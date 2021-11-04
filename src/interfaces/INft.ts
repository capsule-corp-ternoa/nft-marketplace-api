import { ICategory } from "./ICategory";
import mongoose from "mongoose";

export interface IMongoNft {
  _id: string;
  chainId: string;
  categories: ICategory[] | mongoose.Types.ObjectId[];
}