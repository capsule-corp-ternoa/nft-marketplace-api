import { IUserView } from "../interfaces/IUserView";
import mongoose, { PaginateModel } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const UserView = new mongoose.Schema({
  viewed: {
    type: String,
    required: true,
  },
  viewer: {
    type: String,
  },
  viewerIp: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
  },
});

UserView.plugin(mongoosePaginate);

const UserViewModel = mongoose.model<IUserView & mongoose.Document>(
  "UserView",
  UserView,
  "user-views"
) as PaginateModel<IUserView & mongoose.Document>;

export default UserViewModel;
