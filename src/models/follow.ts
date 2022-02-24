import mongoose, {AggregatePaginateModel} from "mongoose";
import { IFollow } from "../interfaces/IFollow";
import aggregatePaginate  from "mongoose-aggregate-paginate-v2";

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

Follow.plugin(aggregatePaginate);

const FollowModel = mongoose.model<IFollow & mongoose.Document>(
  "Follow",
  Follow
) as unknown as AggregatePaginateModel<IFollow & mongoose.Document>;

export default FollowModel;
