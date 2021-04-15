import { Server, Namespace } from "socket.io";
import loginHandler from "./login";
import creationHandler from "./creation";

export default (io: Server): void => {
  const loginNsp: Namespace = io.of("/socket/login");
  const creationNsp: Namespace = io.of("/socket/createNft");

  // login namespace handler
  loginHandler(loginNsp);

  // nft creation namespace handler
  creationHandler(creationNsp);
};
