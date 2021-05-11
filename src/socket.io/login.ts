// tslint:disable: no-unused-expression

import { Namespace, Socket } from "socket.io";
import UserService from "../api/services/user";
import L from "../common/logger";
export default (io: Namespace) => {
  const roomSockets: { string: string[] } | any = {}
  io.on("connection", async (socket: Socket) => {
    const emitWalletId = async (_walletId: string, _session: string, callback: (args: any) => void | null = null) => {
      const validCallback = callback && typeof callback === "function";
      L.info(`roomSocket=` + JSON.stringify(roomSockets[_session]));
      const socketCount = roomSockets[_session]?.length || 0;
      L.info(`emitWalletId?  socketCount = ${socketCount} - session: ${_session}`);
      if (!_walletId) {
        L.info(`Missing walletId argument for room ${_session}`);
        validCallback &&
          callback({ error: "400", msg: "Missing walletId argument" });
      }
      else if (socketCount < 2) {
        L.info(`Not enough joins (${socketCount})in room ${_session}`);
        validCallback &&
          callback({ error: "410", msg: "No listener for this session" });
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
        L.info(`RECEIVE_WALLET_ID emitting for room ${_session} / walletId: ${_walletId}`);
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
      L.info(`Login socket CONNECTED in room ${session} for id ${socket.id} at ${new Date()}`);
      L.info(`Login socket JOIN room ${session} for id ${socket.id} at ${new Date()}`);
      io.adapter.once("join-room", (room, id) => {
        L.info(`socket ${id} has joined room ${room}`);
        L.info(`After join - (bef) roomSocket update len=` + (roomSockets[room]?.length || 0));
        L.info(`roomSocket=` + JSON.stringify(roomSockets[room]));
        if (!roomSockets[room]) {
          roomSockets[room] = []
        }
        roomSockets[room].push(id);
        L.info(`After join - (aft) roomSocket update len=` + (roomSockets[room]?.length || 0));
        L.info(`roomSocket=` + JSON.stringify(roomSockets[room]));
        if (walletId) {
          L.info(`emitWalletId ${walletId} given on login by mobil for session ${session}`);
          emitWalletId(<string>walletId, <string>session);
          socket.to(`${session}`).emit("RECEIVE_WALLET_ID", { walletId });
        }
        socket.on("SEND_WALLET_ID", async ({ walletId: walltId }, callback) => {
          L.info(`emitWalletId given on event SEND_WALLET_ID`);
          emitWalletId(walltId, <string>session, callback);
        });
      });
      io.adapter.once("leave-room", (room, id) => {
        L.info(`socket ${id} has left room ${room}`);
        const index = roomSockets[room]?.indexOf(id)
        if (index >= 0) {
          roomSockets[room].splice(index, 1);
        }
        L.info(`After left - roomSocket update len=` + (roomSockets[room]?.length || 0));
        L.info(`roomSocket=` + JSON.stringify(roomSockets[room]));
      });
      await socket.join(session);
      socket.on('disconnect', () => {
        L.info(`Login socket DISCONNECTED in room ${session} for id ${socket.id} at ${new Date()}`);
      });
      io.to(socket.id).emit("CONNECTION_SUCCESS", {
        msg: "Connection successful",
      });
    }
  });
};
