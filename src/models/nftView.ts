import { INftView } from "../interfaces/INftView";
import mongoose, { AggregatePaginateModel } from "mongoose";
import aggregatePaginate  from "mongoose-aggregate-paginate-v2";

const NftView = new mongoose.Schema({
  viewedSerie: {
    type: String,
    required: true,
  },
  viewedId: {
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

NftView.plugin(aggregatePaginate);

const NftViewModel = mongoose.model<INftView & mongoose.Document>(
  "NftView",
  NftView,
  "nft-views"
) as unknown as AggregatePaginateModel<INftView & mongoose.Document>;

export default NftViewModel;
