import { IUser, IUserDTO } from "src/interfaces/IUser";
import L from "../../common/logger";
import UserModel from "../../models/user";
import crypto from "crypto";
import { PaginateResult } from "mongoose";

export class UserService {
  async getAllUsers(
    page: number = 1,
    limit: number = 15
  ): Promise<PaginateResult<IUser>> {
    try {
      return await UserModel.paginate({}, { page, limit });
    } catch (err) {
      throw new Error("Users can't be fetched");
    }
  }
  async createUser(userDTO: IUserDTO): Promise<IUser> {
    const nonce = crypto.randomBytes(16).toString("base64");
    try {
      const newUser = new UserModel({ ...userDTO, nonce });
      return await newUser.save();
    } catch (err) {
      throw new Error("User can't be created");
    }
  }

  async findUser(walletId: string): Promise<IUser> {
    try {
      const user = await UserModel.findOneAndUpdate(
        { walletId },
        { $inc: { views: 1 } },
        { new: true }
      );
      if (!user) throw new Error();
      return user;
    } catch (err) {
      throw new Error("User can't be found");
    }
  }

  async findUsersById(ids: string[]): Promise<IUser[]> {
    try {
      const users = UserModel.find({ _id: { $in: ids } });
      return users;
    } catch (err) {
      throw new Error("Users can't be found");
    }
  }
}

export default new UserService();
