import { request } from "graphql-request";
import { IUser, IUserDTO } from "../../../interfaces/IUser";
import UserModel from "../../../models/user";
import QueriesBuilder from "../gqlQueriesBuilder";
import crypto from "crypto";
import { PaginateResult } from "mongoose";
import { AccountResponse, Account } from "../../../interfaces/graphQL";
import NodeCache from "node-cache";
import { validateUrl, validateTwitter } from "../../../utils";

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
   * Finds a user in DB
   * @param walletId - User's wallet ID
   * @param incViews - Should increase views counter
   * @param ignoreCache - Should fetch directly from database and ignore cache
   * @throws Will throw an error if wallet ID doesn't exist
   */
  async findUser(
    walletId: string,
    incViews: boolean = false,
    ignoreCache: boolean = false
  ): Promise<IUser> {
    if (!ignoreCache && !incViews) {
      const user = usersCache.get(walletId) as IUser | undefined;
      if (user !== undefined) return user;
    }
    try {
      const user = await UserModel.findOneAndUpdate(
        { walletId },
        incViews ? { $inc: { views: 1 } } : undefined,
        { new: true }
      );
      if (!user) throw new Error();
      if (!usersCache.has(walletId)) usersCache.set(walletId, user);

      return user;
    } catch (err) {
      throw new Error("User can't be found");
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

  async updateUser(id: string, data: any): Promise<IUser> {
    try{
      let isError=false
      const {name, customUrl, bio, twitterName, personalUrl, picture, banner} = data
      if (typeof name !== "string" || name.length===0) isError=true
      if (customUrl && (typeof customUrl !== "string" || !validateUrl(customUrl))) isError=true
      if (bio && typeof bio !== "string") isError=true
      if (twitterName && (typeof twitterName !== "string" || !validateTwitter(twitterName))) isError=true
      if (personalUrl && (typeof personalUrl !== "string" || !validateUrl(personalUrl))) isError=true
      if (picture && (typeof picture !== "string" || !validateUrl(picture))) isError=true
      if (banner && (typeof banner !== "string" || !validateUrl(banner))) isError=true
      if (isError) throw new Error()
      const user = await UserModel.findOneAndUpdate(
        { _id: id },
        {name, customUrl, bio, twitterName, personalUrl, picture, banner},
        {new: true}
      );
      return user
    }catch(err){
      throw new Error("Couldn't update user");
    }
  }
}

export default new UserService();
