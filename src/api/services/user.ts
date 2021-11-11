import { request } from "graphql-request";
import fetch from "node-fetch";
import { IUser } from "../../interfaces/IUser";
import UserViewModel from "../../models/userView";
import QueriesBuilder from "./gqlQueriesBuilder";
import { AccountResponse, Account } from "../../interfaces/graphQL";
import NodeCache from "node-cache";
import { TIME_BETWEEN_SAME_USER_VIEWS, TERNOA_API_URL } from "../../utils";
import { getAccountBalanceQuery, getUserQuery } from "../validators/userValidators";

const indexerUrl =
  process.env.INDEXER_URL || "https://indexer.chaos.ternoa.com";

const usersCache = new NodeCache({ stdTTL: 300 });

export class UserService {
  /**
   * Finds a user in DB
   * @param query - see getUserQuery
   * @throws Will throw an error if wallet ID doesn't exist
   */
  async findUser(
    query: getUserQuery
  ): Promise<IUser> {
    if (!query.ignoreCache && !query.incViews) {
      const user = usersCache.get(query.id) as IUser | undefined;
      if (user !== undefined) return user;
    }
    try {
      const data = await fetch(`${TERNOA_API_URL}/api/users/${query.id}`)
      const user = await data.json() as IUser
      let viewsCount = 0
      if (!user || (user as any).errors?.length>0) throw new Error();
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
      if (!usersCache.has(query.id)) usersCache.set(query.id, user);
      return {...user, viewsCount};
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
        return { "capsAmount": "0", "tiimeAmount": "0" }
      }
    } catch (err) {
      throw new Error("Couldn't get caps balance");
    }
  }

}

export default new UserService();
