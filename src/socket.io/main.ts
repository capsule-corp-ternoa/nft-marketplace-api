import { Server, Namespace } from "socket.io";
import loginHandler from "./login";
import creationHandler from "./creation";
import buyHandler from "./buy";
import updateProfileHandler from "./updateProfile";

export default (io: Server): void => {
  const loginNsp: Namespace = io.of("/socket/login");
  const creationNsp: Namespace = io.of("/socket/createNft");
  const buyNsp: Namespace = io.of("/socket/buyNft");
  const updateProfileNsp: Namespace = io.of("/socket/updateProfile");

  // login namespace handler
  loginHandler(loginNsp);

  // nft creation namespace handler
  creationHandler(creationNsp);

  // nft buy namespace handler
  buyHandler(buyNsp);

  // update profil namespace handler
  updateProfileHandler(updateProfileNsp)
};
