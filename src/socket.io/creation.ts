// tslint:disable: no-unused-expression

import { Namespace, Socket } from "socket.io";
import L from "../common/logger";

export default (io: Namespace) => {
  io.on("connection", async (socket: Socket) => {
    const { session } = socket.handshake.query;

    // if session arg not provided, return error and refuse connection
    if (!session || session === "undefined" || session === "") {
      io.to(socket.id).emit("CONNECTION_FAILURE", {
        msg: "Missing session argument",
      });
      socket.disconnect();
    } else {
      await socket.join(session);
      L.info('socked ' + socket.id + ' joined to session ' + session) + ' room size=' + io.adapter.rooms.get(session as string).size;
      socket.on('disconnect', async (_r) => {
        const socketRooms = await io.adapter.fetchSockets({
          rooms: new Set(session),
        });
        L.info(`on DISCONNECT: eval socket room size = ${socketRooms.length} - room = ${session} - disconnected socket id = ${socket.id}`);
        socketRooms.forEach(async socketRoom => {
          await socketRoom.disconnect();
          L.info('socked ' + socket.id + ' in session ' + session + ' was disconnected by server due to another room socket was disconnected.');
        });
      });
      socket.on('PGPS_READY', (data, callback) => {
        const validCallback = callback && typeof callback === "function";
        socket.to(`${session}`).emit("PGPS_READY", data);
        validCallback && callback({ ok: true });
      })
      socket.on('PGPS_READY_RECEIVED', (data, callback) => {
        const validCallback = callback && typeof callback === "function";
        socket.to(`${session}`).emit("PGPS_READY_RECEIVED", data);
        validCallback && callback({ ok: true });
      })
      socket.on('RUN_NFT_MINT', (data, callback) => {
        const validCallback = callback && typeof callback === "function";
        socket.to(`${session}`).emit("RUN_NFT_MINT", data);
        validCallback && callback({ ok: true });
      })
      socket.on('RUN_NFT_MINT_ERROR', (data, callback) => {
        const validCallback = callback && typeof callback === "function";
        socket.to(`${session}`).emit("RUN_NFT_MINT_ERROR", data);
        validCallback && callback({ ok: true });
      })
      socket.on('RUN_NFT_MINT_RECEIVED', (data, callback) => {
        const validCallback = callback && typeof callback === "function";
        socket.to(`${session}`).emit("RUN_NFT_MINT_RECEIVED", data);
        validCallback && callback({ ok: true });
      })
      socket.on("MINTING_NFT", (data, callback) => {
        const validCallback = callback && typeof callback === "function";
        socket.to(`${session}`).emit("MINTING_NFT", data);
        validCallback && callback({ ok: true });
      });
      socket.on("MINTING_NFT_RECEIVED", (data, callback) => {
        const validCallback = callback && typeof callback === "function";
        socket.to(`${session}`).emit("MINTING_NFT_RECEIVED", data);
        validCallback && callback({ ok: true });
      });
      socket.on("MINTING_NFT_ERROR", (data, callback) => {
        const validCallback = callback && typeof callback === "function";
        socket.to(`${session}`).emit("MINTING_NFT_ERROR", data);
        validCallback && callback({ ok: true });
      });
      socket.on("UPLOAD_REMAINING_TIME", (data, callback) => {
        const validCallback = callback && typeof callback === "function";
        socket.to(`${session}`).emit("UPLOAD_REMAINING_TIME", data);
        validCallback && callback({ ok: true });
      });
      socket.on("WALLET_READY", (data, callback) => {
        const validCallback = callback && typeof callback === "function";
        socket.to(`${session}`).emit("WALLET_READY", data);
        validCallback && callback({ ok: true });
      });
      io.to(socket.id).emit("CONNECTION_SUCCESS", {
        msg: "Connection successful",
      });
    }
  });
};
