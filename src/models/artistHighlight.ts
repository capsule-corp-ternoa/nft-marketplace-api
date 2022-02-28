import { IArtistHighlight } from "../interfaces/IArtistHighlight";
import mongoose, { PaginateModel } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const ArtistHighlight = new mongoose.Schema({
  walletId: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
  },
});

ArtistHighlight.plugin(mongoosePaginate);

const ArtistHighlightModel = mongoose.model<IArtistHighlight & mongoose.Document>(
  "ArtistHighlight",
  ArtistHighlight,
  "artist-highlights"
) as PaginateModel<IArtistHighlight & mongoose.Document>;

export default ArtistHighlightModel;
