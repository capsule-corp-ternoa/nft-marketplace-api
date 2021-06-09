import { ICategory } from "../interfaces/ICategory";
import mongoose, { PaginateModel } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const Category = new mongoose.Schema({
  code: {
    type: String,
    required: [true, "Please enter a code"],
    unique: true,
    index: true,
  },
  name: {
    type: String,
    required: [true, "Please enter a name"],
  },
  description: {
    type: String,
  },
});

Category.plugin(mongoosePaginate);

const UserModel = mongoose.model<ICategory & mongoose.Document>(
  "Category",
  Category,
  "nft-categories"
) as PaginateModel<ICategory & mongoose.Document>;

export default UserModel;
