// tslint:disable: no-unused-expression

import { Namespace, Socket } from "socket.io";
import UserService from "../api/services/user";
import L from "../common/logger";
export default (io: Namespace) => {
  io.on("connection", async (socket: Socket) => {
    const emitWalletId = async (walletId: string, _session: string, callback: (args: any) => void | null = null) => {
      const validCallback = callback && typeof callback === "function";
      if (!walletId || walletId === "undefined") {
        L.error(`Missing walletId argument for room ${_session}`);
        validCallback &&
          callback({ error: "400", msg: "Missing walletId argument" });
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
        socket.to(`${_session}`).emit("RECEIVE_WALLET_ID", { walletId });
        L.info(`Emitted RECEIVE_WALLET_ID : wallet ${walletId} to ${_session}`);
        socket.on('RECEIVED_WALLET_ID', ({ walletId: _walletId }, _callback) => {
          L.info(`RECEIVED_WALLET_ID: wallet ${walletId}`);
          emitWalletIdReceived(_walletId, <string>session, _callback);
        });
      }
    }
    const emitWalletIdReceived = async (walletId: string, _session: string, callback: (args: any) => void | null = null) => {
      const validCallback = callback && typeof callback === "function";
      if (!walletId || walletId === "undefined") {
        L.error(`Missing walletId argument for room ${_session}`);
        validCallback &&
          callback({ error: "400", msg: "Missing walletId argument" });
      }
      else {
        socket.to(`${_session}`).emit("RECEIVED_WALLET_ID", { walletId });
        if (validCallback) callback({ ok: true });
      }
    }

    const { session } = socket.handshake.query;

    // if session arg not provided, return error and refuse connection
    if (!session || session === "undefined" || session === "") {
      io.to(socket.id).emit("CONNECTION_FAILURE", {
        msg: "Missing session argument",
      });
      socket.disconnect();
    } else {
      socket.on("SEND_WALLET_ID", async ({ walletId }, callback) => {
        L.info('SEND_WALLET_ID event :'+ walletId);
        emitWalletId(walletId, session as string, callback);
      });
      await socket.join(session);
      L.info('socked joined to session '+session);
      io.to(socket.id).emit("CONNECTION_SUCCESS", {
        msg: "Connection successful",
      });
    }
  });
};
