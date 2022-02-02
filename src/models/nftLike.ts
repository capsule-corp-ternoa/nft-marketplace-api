import mongoose, {AggregatePaginateModel} from "mongoose";
import { INftLike } from "../interfaces/INftLikee";
import aggregatePaginate  from "mongoose-aggregate-paginate-v2";

const NftLike = new mongoose.Schema({
  nftId: {
    type: String,
    index: true,
  },
  serieId: {
    type: String,
    index: true,
  },
  walletId: {
    type: String,
    index: true,
  },
}, { timestamps: true });

NftLike.plugin(aggregatePaginate);

const NftLikeModel = mongoose.model<INftLike & mongoose.Document>("NftLike", NftLike, "nft-likes") as unknown as AggregatePaginateModel<INftLike & mongoose.Document>;

export default NftLikeModel;