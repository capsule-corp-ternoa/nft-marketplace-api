// tslint:disable: no-unused-expression

import { Namespace, Socket } from "socket.io";
import UserService from "../api/services/user";

export default (io: Namespace) => {
  io.on("connection", (socket: Socket) => {
    const { session } = socket.handshake.query;

    // if session arg not provided, return error
    if (!session)
      io.to(socket.id).emit("CONNECTION_FAILURE", {
        msg: "Missing session argument",
      });
    else {
      socket.join(session);
      io.to(socket.id).emit("CONNECTION_SUCCESS", {
        msg: "Connection successful",
      });

      socket.on("SEND_WALLET_ID", async ({ walletId }, callback) => {
        const validCallback = callback && typeof callback === "function";
        if (!walletId)
          validCallback &&
            callback({ error: "400", msg: "Missing walletId argument" });
        else if (io.adapter.rooms.get(`${session}`).size < 2)
          validCallback &&
            callback({ error: "410", msg: "No listener for this session" });
        else {
          let user;
          // if user exists, retrieve it, otherwise create a new one, return error if it fails
          try {
            user = await UserService.findUser(walletId);
          } catch (err) {
            try {
              user = await UserService.createUser({ walletId });
            } catch (err) {
              validCallback &&
                callback({ error: "500", msg: "Something went wrong" });
              return;
            }
          }
          socket.to(`${session}`).emit("RECEIVE_WALLET_ID", { walletId });
          if (validCallback) callback({ ok: true });
        }
      });
    }
  });
};
