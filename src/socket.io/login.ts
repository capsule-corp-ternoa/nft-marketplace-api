// tslint:disable: no-unused-expression

import { Namespace, Socket } from "socket.io";
import UserService from "../api/services/user";
import L from "../common/logger";

export default (io: Namespace) => {
  io.on("connection", (socket: Socket) => {

    const { session } = socket.handshake.query;

    // if session arg not provided, return error and refuse connection
    if (!session || session === "undefined" || session === "") {
      io.to(socket.id).emit("CONNECTION_FAILURE", {
        msg: "Missing session argument",
      });
      socket.disconnect();
    } else {
      L.info(`Login socket CONNECTED in room ${session} for id ${socket.id} at ${new Date()}`);
      socket.join(session);
      L.info(`Login socket JOIN room ${session} for id ${socket.id} at ${new Date()}`);
      socket.on('disconnect', () => {
        L.info(`Login socket DISCONNECTED in room ${session} for id ${socket.id} at ${new Date()}`);
      });
      io.to(socket.id).emit("CONNECTION_SUCCESS", {
        msg: "Connection successful",
      });

      socket.on("SEND_WALLET_ID", async ({ walletId }, callback) => {
        const validCallback = callback && typeof callback === "function";
        const socketCount = io.adapter.rooms.get(<string> session).size;
        if (!walletId)
          validCallback &&
            callback({ error: "400", msg: "Missing walletId argument" });
        else if (socketCount < 2) {
          L.info(`Not enough joins (${socketCount} )in room ${session}`);
          validCallback &&
            callback({ error: "410", msg: "No listener for this session" });
        }
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
