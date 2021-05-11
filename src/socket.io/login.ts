// tslint:disable: no-unused-expression

import { Namespace, Socket } from "socket.io";
import UserService from "../api/services/user";
import L from "../common/logger";
export default (io: Namespace) => {
  io.on("connection", async (socket: Socket) => {
    const emitWalletId = async (_walletId: string, _session: string, callback: (args: any) => void | null = null) => {
      const validCallback = callback && typeof callback === "function";
      if (!_walletId) {
        L.error(`Missing walletId argument for room ${_session}`);
        validCallback &&
          callback({ error: "400", msg: "Missing walletId argument" });
      }
      else {
        let user;
        // if user exists, retrieve it, otherwise create a new one, return error if it fails
        try {
          user = await UserService.findUser(_walletId);
        } catch (err) {
          try {
            user = await UserService.createUser({ walletId: _walletId });
          } catch (err) {
            validCallback &&
              callback({ error: "500", msg: "Something went wrong" });
            return;
          }
        }
        socket.to(`${_session}`).emit("RECEIVE_WALLET_ID", { walletId: _walletId });
        if (validCallback) callback({ ok: true });
      }
    }

    const { session, walletId } = socket.handshake.query;

    // if session arg not provided, return error and refuse connection
    if (!session || session === "undefined" || session === "") {
      io.to(socket.id).emit("CONNECTION_FAILURE", {
        msg: "Missing session argument",
      });
      socket.disconnect();
    } else {
      io.adapter.once("join-room", (room, id) => {
        socket.on("SEND_WALLET_ID", async ({ walletId: walltId }, callback) => {
          emitWalletId(walltId, <string>session, callback);
        });
      });
      await socket.join(session);
      socket.on('disconnect', () => {
      });
      io.to(socket.id).emit("CONNECTION_SUCCESS", {
        msg: "Connection successful",
      });
    }
  });
};
