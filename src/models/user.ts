import { IUser } from "../interfaces/IUser";
import mongoose, { PaginateModel } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const User = new mongoose.Schema({
  walletId: {
    type: String,
    required: [true, "Please enter a walletId"],
    unique: true,
    index: true,
    minlength: 48,
    maxlength: 48,
  },
  nonce: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    default() {
      return "Ternoa #" + this.walletId.slice(0, 5);
    },
  },
  bio: {
    type: String,
  },
  twitterName: {
    type: String,
  },
  customUrl: {
    type: String,
  },
  personalUrl: {
    type: String,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  artist: {
    type: Boolean,
    default: false,
  },
  nbFollowers: {
    type: Number,
    default: 0,
  },
  nbFollowing: {
    type: Number,
    default: 0,
  },
  views: {
    type: Number,
    default: 0,
  },
  picture: {
    type: String,
  },
  banner: {
    type: String,
  },
  createdAt : { 
    type: Date, 
  },
  updatedAt : { 
    type: Date, 
  },
});

User.pre<any & mongoose.Document>('updateOne', function (next){
  // tslint:disable-next-line:no-console
  console.log(this)
  const now = new Date()
  this.set({updatedAt: now})
  if (this.createdAt){
    this.set({created_at: now})
  }
  next()
})

User.plugin(mongoosePaginate);

const UserModel = mongoose.model<IUser & mongoose.Document>(
  "User",
  User
) as PaginateModel<IUser & mongoose.Document>;

export default UserModel;
