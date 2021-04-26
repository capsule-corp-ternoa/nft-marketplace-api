import { Server, Namespace } from "socket.io";
import loginHandler from "./login";
import creationHandler from "./creation";
import buyHandler from "./buy";

export default (io: Server): void => {
  const loginNsp: Namespace = io.of("/socket/login");
  const creationNsp: Namespace = io.of("/socket/createNft");
  const buyNsp: Namespace = io.of("/socket/buyNft");

  // login namespace handler
  loginHandler(loginNsp);

  // nft creation namespace handler
  creationHandler(creationNsp);

  // nft buy namespace handler
  buyHandler(buyNsp);
};
