import { IUserView } from "../interfaces/IUserView";
import mongoose, { AggregatePaginateModel } from "mongoose";
import aggregatePaginate  from "mongoose-aggregate-paginate-v2";

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

UserView.plugin(aggregatePaginate);

const UserViewModel = mongoose.model<IUserView & mongoose.Document>(
  "UserView",
  UserView,
  "user-views"
) as unknown as AggregatePaginateModel<IUserView & mongoose.Document>;

export default UserViewModel;
