// tslint:disable: no-unused-expression

import { Namespace, Socket } from "socket.io";

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
      io.to(socket.id).emit("CONNECTION_SUCCESS", {
        msg: "Connection successful",
      });
      socket.on("MINTING_NFT", (data, callback) => {
        const validCallback = callback && typeof callback === "function";
        socket.to(`${session}`).emit("MINTING_NFT", data);
        // confirm success to mobile app
        validCallback && callback({ ok: true });
      });
      socket.on("MINTED_NFT", (data, callback) => {
        const validCallback = callback && typeof callback === "function";
        socket.to(`${session}`).emit("MINTED_NFT", data);
        // confirm success to mobile app
        validCallback && callback({ ok: true });
      });
      await socket.join(session);
    }
  });
};
