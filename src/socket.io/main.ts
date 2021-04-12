import { Server } from "socket.io";
import loginHandler from "./login";

export default (io: Server): void => {
  const loginNsp = io.of("/socket/login");

  // login namespace handler
  loginHandler(loginNsp);
};
