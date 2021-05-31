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
      await socket.join(session);
      socket.on("NFT_BUY", (data, callback) => {
        const validCallback = callback && typeof callback === "function";
        // send mobile app response to nft marketplace
        socket.to(`${session}`).emit("NFT_BUY", data);
        // confirm success to mobile app
        validCallback && callback({ ok: true });
      });
      socket.on('NFT_BUY_RECEIVED', (data, callback) => {
        const validCallback = callback && typeof callback === "function";
        socket.to(`${session}`).emit("NFT_BUY_RECEIVED", data);
        validCallback && callback({ ok: true });
      });
      io.to(socket.id).emit("CONNECTION_SUCCESS", {
        msg: "Connection successful",
      });
    }
  });
};
