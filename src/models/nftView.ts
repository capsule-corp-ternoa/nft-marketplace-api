import { INftView } from "../interfaces/INftView";
import mongoose, { PaginateModel } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

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

NftView.plugin(mongoosePaginate);

const NftViewModel = mongoose.model<INftView & mongoose.Document>(
  "NftView",
  NftView,
  "nft-view"
) as PaginateModel<INftView & mongoose.Document>;

export default NftViewModel;
