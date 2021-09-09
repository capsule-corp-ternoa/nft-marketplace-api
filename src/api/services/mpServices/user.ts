import { request } from "graphql-request";
import { IUser, IUserDTO } from "../../../interfaces/IUser";
import { ICompleteNFT, PaginationResponse } from "../../../interfaces/graphQL";
import UserModel from "../../../models/user";
import UserViewModel from "../../../models/userView";
import QueriesBuilder from "../gqlQueriesBuilder";
import crypto from "crypto";
import { PaginateResult } from "mongoose";
import { AccountResponse, Account } from "../../../interfaces/graphQL";
import NodeCache from "node-cache";
import { isValidSignature, validateUrl, validateTwitter } from "../../../utils";
import NFTService from "./nft";
import { TIME_BETWEEN_SAME_USER_VIEWS } from "../../../utils";

const indexerUrl =
  process.env.INDEXER_URL || "https://indexer.chaos.ternoa.com";

const usersCache = new NodeCache({ stdTTL: 300 });

export class UserService {
  /**
   * Returns all users with pagination
   * @param page - Page number
   * @param limit - Number of users per page
   * @throws Will throw an error if can't fetch users
   */
  async getAllUsers(
    page: number = 1,
    limit: number = 15
  ): Promise<PaginateResult<IUser>> {
    try {
      return await UserModel.paginate({ artist: true }, { page, limit });
    } catch (err) {
      throw new Error("Users can't be fetched");
    }
  }

  /**
   * Creates a new user in DB
   * @param userDTO - User data
   * @throws Will throw an error if can't create user
   */
  async createUser(userDTO: IUserDTO): Promise<IUser> {
    const nonce = crypto.randomBytes(16).toString("base64");
    try {
      const newUser = new UserModel({ ...userDTO, nonce });
      return await newUser.save();
    } catch (err) {
      throw new Error("User can't be created");
    }
  }


  /**
   * Creates a new user in DB
   * @param walletId - wallet Id
   * @throws Will throw an error if can't create user
   */
   async reviewRequested(walletId: string): Promise<any> {
    try {
      return UserModel.findOneAndUpdate({walletId}, {reviewRequested: true}, { new: true });
    } catch (err) {
      throw new Error("User can't be updated");
    }
  }

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
      const user = await UserModel.findOne({ walletId });
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
      return {...user.toObject(), viewsCount};
    } catch (err) {
      throw new Error(err + "User can't be found");
    }
  }

  /**
   * Finds multiple users in DB
   * @param ids - An array of users mongo ids
   * @throws Will throw an error if DB can't be reached
   * @return A promise that resolves to the users
   */
  async findUsersById(ids: string[]): Promise<IUser[]> {
    try {
      const users = UserModel.find({ _id: { $in: ids } });
      return users;
    } catch (err) {
      throw new Error("Users can't be found");
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
   * verify signature and update the user
   * @param walletId - User's public address
   * @param walletData - User's data for update
   * @throws Will throw an error if signature is invalid or if user can't be found in db
   * @return A promise of updated user
   */
  async updateUser(walletId: string, walletData: any): Promise<IUser> {
    try{
      const data = JSON.parse(walletData.data)
      try{
        if (!isValidSignature(walletData.data, walletData.signedMessage, data.walletId)) throw new Error("Invalid signature")
      }catch(err){
        throw new Error("Invalid signature")
      }
      let isError=false
      const {name, customUrl, bio, twitterName, personalUrl, picture, banner} = data
      if (typeof name !== "string" || name.length===0) isError=true
      if (customUrl && (typeof customUrl !== "string" || !validateUrl(customUrl))) isError=true
      if (bio && typeof bio !== "string") isError=true
      if (twitterName && (typeof twitterName !== "string" || !validateTwitter(twitterName))) isError=true
      if (personalUrl && (typeof personalUrl !== "string" || !validateUrl(personalUrl))) isError=true
      if (picture && (typeof picture !== "string" || !validateUrl(picture))) isError=true
      if (banner && (typeof banner !== "string" || !validateUrl(banner))) isError=true
      if (isError) throw new Error("Couldn't update user")
      const userOld = await UserModel.findOne({walletId})
      let twitterVerified = userOld.twitterVerified
      if (userOld.twitterName !== twitterName) twitterVerified = false
      const user = await UserModel.findOneAndUpdate(
        { walletId },
        {name, customUrl, bio, twitterName, personalUrl, picture, banner, twitterVerified},
        {new: true}
      );
      return user
    }catch(err){
      throw err
    }
  }

  /**
   * Like an NFT
   * @param walletId - wallet Id
   * @param nftId - nft Id
   * @throws Will throw an error if already liked or if db can't be reached
   */
   async likeNft(walletId: string, nftId: string): Promise<IUser> {
    try {
      const user  = await UserModel.findOne({walletId});
      const nft  = await NFTService.getNFT(nftId);
      const key = {serieId: nft.serieId, nftId: nft.id}
      if (!user || !nft) throw new Error()
      if (user.likedNFTs){
        if (nft.serieId === "0"){
          if (user.likedNFTs.map(x => x.nftId).includes(key.nftId)) throw new Error()
        }else{
          if (user.likedNFTs.map(x => x.serieId).includes(key.serieId)) throw new Error()
        }
        user.likedNFTs.push(key)
      }else{
        user.likedNFTs= [key]
      }
      await user.save()
      return user
    } catch (err) {
      throw new Error("Couldn't like NFT");
    }
  }

  /**
   * Unlike an NFT
   * @param walletId - wallet Id
   * @param nftId - nft Id
   * @throws Will throw an error if already liked or if db can't be reached
   */
   async unlikeNft(walletId: string, nftId: string): Promise<IUser> {
    try {
      const user  = await UserModel.findOne({walletId});
      const nft  = await NFTService.getNFT(nftId);
      const key = {serieId: nft.serieId, nftId: nft.id}
      if (!user || !nft || !user.likedNFTs) throw new Error()
      if (nft.serieId === "0"){
        if (!user.likedNFTs.map(x => x.nftId).includes(key.nftId)) throw new Error()
        user.likedNFTs = user.likedNFTs.filter(x => x.nftId !== key.nftId)
      }else{
        if (!user.likedNFTs.map(x => x.serieId).includes(key.serieId)) throw new Error()
        user.likedNFTs = user.likedNFTs.filter(x => x.serieId !== key.serieId)
      }
      await user.save()
      return user
    } catch (err) {
      throw new Error("Couldn't unlike NFT");
    }
  }

  /**
   * gets liked NFTs
   * @param walletId - wallet Id
   * @throws Will throw an error if db can't be reached
   */
   async getLikedNfts(walletId: string): Promise<ICompleteNFT[]> {
    try {
      const user  = await UserModel.findOne({walletId});
      if (!user) throw new Error()
      if (!user.likedNFTs) return []
      const nfts = (await NFTService.getNFTsFromIds(user.likedNFTs.map(x=>x.nftId)))
      return nfts
    } catch (err) {
      throw new Error("Couldn't get liked NFTs");
    }
  }

/**
 * gets liked NFTs paginated
 * @param walletId - wallet Id
 * @param page - Page number
 * @param limit - Number of elements per page
 * @throws Will throw an error if db can't be reached
 */
  async getLikedNftsPaginated(walletId: string, page: number, limit: number): Promise<PaginationResponse<ICompleteNFT[]>> {
    try {
      const user  = await UserModel.findOne({walletId});
      if (!user) throw new Error()
      if (!user.likedNFTs) return {data: [], hasNextPage: false, hasPreviousPage: false, totalCount: 0}
      const nfts = await NFTService.getPaginatedNFTsFromIds(user.likedNFTs.map(x=>x.nftId), page, limit)
      return nfts
    } catch (err) {
      throw new Error("Couldn't get liked NFTs");
    }
  }

  /**
   * store temporary oauth twitter token to validate user
   * @param walletId - wallet Id
   * @param oauthToken - Oauth token
   * @throws Will throw an error if db can't be reached
   */
   async setTwitterVerificationToken(walletId: string, oauthToken: string): Promise<void> {
    try{
      await UserModel.findOneAndUpdate(
        { walletId },
        {twitterVerificationToken: oauthToken}
      );
    }catch(err){
      throw err
    }
  }

  /**
   * Get's the user by oauth verification token
   * @param oauthToken - Oauth token
   * @throws Will throw an error if db can't be reached
   */
   async getUserByTwitterVerificationToken(oauthToken: string): Promise<IUser> {
    try{
      return await UserModel.findOne({ twitterVerificationToken: oauthToken });
    }catch(err){
      throw err
    }
  }

  /**
   * Validate the twitter username
   * @param isValid - if his twitter name matches the one entered in profile page
   * @param walletId - wallet id
   * @throws Will throw an error if db can't be reached
   */
    async validateTwitter(isValid: boolean, walletId: string): Promise<void> {
    try{
        await UserModel.findOneAndUpdate(
          { walletId },
          { twitterVerificationToken: '',twitterVerified: isValid }
        );
    }catch(err){
      throw err
    }
  }
}

export default new UserService();
