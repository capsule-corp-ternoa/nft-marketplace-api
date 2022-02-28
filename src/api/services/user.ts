import { request } from "graphql-request";
import fetch from "node-fetch";
import { IUser } from "../../interfaces/IUser";
import UserViewModel from "../../models/userView";
import NftLikeModel from "../../models/nftLike";
import FollowModel from "../../models/follow";
import ArtistHighlightModel from "../../models/artistHighlight";
import QueriesBuilder from "./gqlQueriesBuilder";
import { AccountResponse, Account, CustomResponse } from "../../interfaces/graphQL";
import { TIME_BETWEEN_SAME_USER_VIEWS, TERNOA_API_URL } from "../../utils";
import { getAccountBalanceQuery, getUserQuery, getUsersQuery } from "../validators/userValidators";
import { getFiltersQuery } from "../validators/nftValidators";

const indexerUrl =
  process.env.INDEXER_URL || "https://indexer.chaos.ternoa.com";


export class UserService {
  /**
   * Finds a users in DB
   * @param query - see getUserQuery
   * @throws Will throw an error if wallet ID doesn't exist
   */
   async findUsers(
    query: getUsersQuery,
    originalUrl: string,
  ): Promise<CustomResponse<IUser>> {
    try {
      const res = await fetch(`${TERNOA_API_URL}${originalUrl}`)
      if (!res.ok) throw new Error();
      const response: CustomResponse<IUser> = await res.json();
      if (query.populateLikes){
        const likedNFTs = await NftLikeModel.find({walletId: {$in: response.data.map(x => x.walletId)}})
        response.data.forEach(x => {
          x.likedNFTs = likedNFTs.filter(y => y.walletId === x.walletId)
        })
      }
      return response
    } catch (err) {
      throw new Error("Users can't be found : " + err);
    }
  }

  /**
   * Finds a user in DB
   * @param query - see getUserQuery
   * @throws Will throw an error if wallet ID doesn't exist
   */
  async findUser(
    query: getUserQuery
  ): Promise<IUser> {
    try {
      const data = await fetch(`${TERNOA_API_URL}/api/users/${query.id}`)
      const user = await data.json() as IUser
      let likedNFTs
      let viewsCount = 0
      if (!user || (user as any).errors?.length>0) throw new Error();
      if (query.populateLikes){
        likedNFTs = await NftLikeModel.find({walletId: query.id})
        // user = {...((user as any)._doc as IUser), likedNFTs}
      }
      if (query.incViews){
        const date = +new Date()
        const views = await UserViewModel.find({viewed: query.id})
        if (query.viewerIp && (views.length === 0 || date - Math.max.apply(null, views.filter(x => x.viewerIp === query.viewerIp).map(x => x.date)) > TIME_BETWEEN_SAME_USER_VIEWS)){
          const newView = new UserViewModel({viewed: query.id, viewer: query.walletIdViewer, viewerIp: query.viewerIp, date})
          await newView.save();
          viewsCount = views.length + 1
        }else{
          viewsCount = views.length
        }
      }
      return {...user, viewsCount, likedNFTs};
    } catch (err) {
      throw new Error("User can't be found " + err);
    }
  }

  /**
   * Get amount of caps on wallet
   * @param query - see getAccountBalanceQuery
   * @throws Will throw an error if indexer can't be reached
   * @return A promise that resolves to the account
   */
  async getAccountBalance(query: getAccountBalanceQuery): Promise<Account> {
    try {
      const gqlQuery = QueriesBuilder.capsBalanceFromId(query.id);
      const result: AccountResponse = await request(indexerUrl, gqlQuery);
      if (result && result.accountEntities && result.accountEntities.nodes && result.accountEntities.nodes.length) {
        return result.accountEntities.nodes[0];
      } else {
        return { "capsAmount": "0" }
      }
    } catch (err) {
      throw new Error("Couldn't get caps balance");
    }
  }

  /**
   * Get top sellers account address sorted by best sellers
   * @param query - see getFiltersQuery
   * @throws Will throw an error if indexer or db can't be reached
   */
   async getTopSellers(query: getFiltersQuery): Promise<CustomResponse<IUser>> {
    try {
      const gqlQuery = QueriesBuilder.getTopSellers(query);
      const res = await request(indexerUrl, gqlQuery);
      const topSellers: {id: string, occurences: number}[] = res.topSeller.nodes;
      const topSellersSorted = topSellers.map(x => x.id)
      const filterDbUser = {walletIds: topSellersSorted}
      const resDbUsers = await fetch(`${TERNOA_API_URL}/api/users/?filter=${JSON.stringify(filterDbUser)}`)
      const dbUsers: CustomResponse<IUser> = await resDbUsers.json()
      const data = topSellersSorted.map(x => {
        let user = dbUsers.data.find(y => y.walletId === x)
        if (user === undefined) user = {_id: x, walletId: x}
        return user
      })
      const result: CustomResponse<IUser> = {
        totalCount: res.topSeller.totalCount,
        data,
        hasNextPage: res.topSeller.pageInfo.hasNextPage,
        hasPreviousPage: res.topSeller.pageInfo.hasPreviousPage
      }
      return result
    } catch (err) {
      throw new Error("Couldn't get top sellers");
    }
  }

  /**
   * get most followed users sorted by number of follows
   * @param query - see getFiltersQuery
   * @throws Will throw an error if db can't be reached
   */
   async getMostFollowed(query: getFiltersQuery): Promise<CustomResponse<IUser>> {
    try{
      const aggregateQuery = [{ $group: { _id: "$followed", totalViews: { $sum: 1 } } }]
      const aggregate = FollowModel.aggregate(aggregateQuery);
      const res = await FollowModel.aggregatePaginate(aggregate, {page: query.pagination.page, limit: query.pagination.limit, sort:{totalViews: -1, _id: -1}})
      const walletIdsSorted = res.docs.map(x => x._id)
      const filterDbUser = {walletIds: walletIdsSorted}
      const resDbUsers = await fetch(`${TERNOA_API_URL}/api/users/?filter=${JSON.stringify(filterDbUser)}`)
      const dbUsers: CustomResponse<IUser> = await resDbUsers.json()
      const data = walletIdsSorted.map(x => {
        let user = dbUsers.data.find(y => y.walletId === x)
        if (user === undefined) user = {_id: x, walletId: x}
        return user
      })
      const result: CustomResponse<IUser> = {
        totalCount: res.totalDocs,
        data,
        hasNextPage: res.hasNextPage,
        hasPreviousPage: res.hasPrevPage
      }
      return result
    }catch(err){
      throw err
    }
  }

  /**
   * get artist highlight / artist of the week
   * artist with most number of follower
   * stays for 1 week
   * go to next one
   * if no artist, purge artist-highlight table
   * @throws Will throw an error if db / indexer can't be reached
   */
   async getArtistHighLight(): Promise<IUser> {
    try{
      // get last timestamp from db
      const lastArtistHighlight = await ArtistHighlightModel.findOne({}, {}, {sort: {timestamp: -1}});
      // if timestamp is less than 7 days ago, return artist
      if (lastArtistHighlight && (+new Date() - +lastArtistHighlight.timestamp < 7 * 24 * 3600 * 1000)){
        return await this.findUser({id: lastArtistHighlight.walletId});
      }else{
        let artist = null
        let isError = false
        while(!artist && !isError){
          // get 50 first rankings of artist
          const mostFollowed = await this.getMostFollowed({pagination:{page:1, limit: 50}});
          let i = 0
          for (const user of mostFollowed.data){
            i +=1
            // check in db that it's not used else go to next
            const tmpArtistHighlight = await ArtistHighlightModel.findOne({walletId: user.walletId});
            if (tmpArtistHighlight) continue;
            // check that he has at least 6 nfts else go to next
            const gqlQuery = QueriesBuilder.countCreated({id: user.walletId});
            const indexerResponse = await request(indexerUrl, gqlQuery);
            if (indexerResponse.nftEntities.totalCount < 6) continue;
            // if ok, push in db and return artist
            artist = user
            break;
          }
          if (artist) break;
          const count = await ArtistHighlightModel.count()
          if (count > 0){
            // we purge db to start the process again
            await ArtistHighlightModel.deleteMany()
          }else{
            // no artist found, throw error
            isError = true
          }
        }
        if (artist){
          const newArtistHighlight = new ArtistHighlightModel({walletId: artist.walletId, timestamp: new Date()})
          await newArtistHighlight.save()
          return artist
        }else{
          throw new Error("No suitable artist to highlight was found")
        }
      }
    }catch(err){
      throw err
    }
  }
}

export default new UserService();
