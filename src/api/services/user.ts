import { request } from "graphql-request";
import fetch from "node-fetch";
import { IUser } from "../../interfaces/IUser";
import UserViewModel from "../../models/userView";
import QueriesBuilder from "./gqlQueriesBuilder";
import { AccountResponse, Account } from "../../interfaces/graphQL";
import NodeCache from "node-cache";
import NFTService from "./nft";
import { TIME_BETWEEN_SAME_USER_VIEWS, TERNOA_API_URL } from "../../utils";
import { CustomResponse } from "../../interfaces/graphQL";
import { INFT } from "../../interfaces/graphQL";

const indexerUrl =
  process.env.INDEXER_URL || "https://indexer.chaos.ternoa.com";

const usersCache = new NodeCache({ stdTTL: 300 });

export class UserService {
  /**
   * Finds a user in DB
   * @param walletId - User's wallet ID
   * @param incViews - Should increase views counter
   * @param ignoreCache - Should fetch directly from database and ignore cache
   * @throws Will throw an error if wallet ID doesn't exist
   */
  async findUser(
    walletId: string,
    incViews: boolean = false,
    viewerWalletId: string = null,
    viewerIp: string = null, 
    ignoreCache: boolean = false
  ): Promise<IUser> {
    if (!ignoreCache && !incViews) {
      const user = usersCache.get(walletId) as IUser | undefined;
      if (user !== undefined) return user;
    }
    try {
      const data = await fetch(`${TERNOA_API_URL}/api/users/${walletId}`)
      const user = await data.json() as IUser
      let viewsCount = 0
      if (!user) throw new Error();
      if (incViews){
        const date = +new Date()
        const views = await UserViewModel.find({viewed: walletId})
        if (viewerIp && (views.length === 0 || date - Math.max.apply(null, views.filter(x => x.viewerIp === viewerIp).map(x => x.date)) > TIME_BETWEEN_SAME_USER_VIEWS)){
          const newView = new UserViewModel({viewed: walletId, viewer: viewerWalletId, viewerIp, date})
          await newView.save();
          viewsCount = views.length + 1
        }else{
          viewsCount = views.length
        }
      }
      if (!usersCache.has(walletId)) usersCache.set(walletId, user);
      return {...user, viewsCount};
    } catch (err) {
      throw new Error(err + "User can't be found");
    }
  }

  /**
   * Get amount of caps on wallet
   * @param id - User's public address
   * @throws Will throw an error if indexer can't be reached
   * @return A promise that resolves to the account
   */
  async getAccountBalance(id: string): Promise<Account> {
    try {
      const query = QueriesBuilder.capsBalanceFromId(id);
      const result: AccountResponse = await request(indexerUrl, query);
      if (result && result.accountEntities && result.accountEntities.nodes && result.accountEntities.nodes.length) {
        return result.accountEntities.nodes[0];
      } else {
        return { "capsAmount": "0", "tiimeAmount": "0" }
      }
    } catch (err) {
      throw new Error("Couldn't get caps balance");
    }
  }

  /**
   * gets liked NFTs
   * @param walletId - wallet Id
   * @param page? - Page number
   * @param limit? - Number of elements per page
   * @throws Will throw an error if db can't be reached
   */
   async getLikedNfts(walletId: string, page?: string, limit?: string, withSeriesDataValues?: boolean): Promise<CustomResponse<INFT>> {
    try {
      const withSeriesData = (withSeriesDataValues === true)
      if (page && limit){
        const data = await fetch(`${TERNOA_API_URL}/api/users/${walletId}?removeBurned=${true}`)
        const user = await data.json() as IUser
        const totalLikedNfts = user.likedNFTs.length
        const likedIndexStart = (Number(page)-1)*Number(limit)
        const hasNextPage = likedIndexStart+Number(limit) < totalLikedNfts
        const hasPreviousPage = Number(page) > 1 && likedIndexStart>0
        if (likedIndexStart !== 0 && likedIndexStart >= totalLikedNfts) throw new Error("Pagination parameters are incorrect");
        const userLikedNFTs  = totalLikedNfts===0 ? [] : user.likedNFTs.slice(likedIndexStart, likedIndexStart+Number(limit))
        if (!userLikedNFTs) return {data: [], totalCount: 0, hasNextPage: false, hasPreviousPage:false}
        const response = await NFTService.getNFTsFromIds(userLikedNFTs.map(x=>x.nftId), null, null, null, withSeriesData)
        response.hasNextPage = hasNextPage
        response.hasPreviousPage = hasPreviousPage
        return response
      }else{
        const data = await fetch(`${TERNOA_API_URL}/api/users/${walletId}`)
        const user = await data.json() as IUser
        if (!user.likedNFTs) return {data: [], totalCount: 0}
        const response = await NFTService.getNFTsFromIds(user.likedNFTs.map(x=>x.nftId), null, null, null, withSeriesData)
        return response
      }
    } catch (err) {
      throw new Error("Couldn't get liked NFTs");
    }
  }
}

export default new UserService();
