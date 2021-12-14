import mongoose, { PaginateModel } from "mongoose";
import { IFollow } from "../interfaces/IFollow";
import mongoosePaginate from "mongoose-paginate-v2";

/* based on socialite implementation https://github.com/mongodb-labs/socialite/blob/master/docs/graph.md */

const Follow = new mongoose.Schema({
  followed: {
    type: String,
    required: true,
  },
  follower: {
    type: String,
    required: true,
  },
});

Follow.plugin(mongoosePaginate);

const FollowModel = mongoose.model<IFollow & mongoose.Document>(
  "Follow",
  Follow
) as PaginateModel<IFollow & mongoose.Document>;

export default FollowModel;
