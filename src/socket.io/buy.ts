// tslint:disable: no-unused-expression

import { Namespace, Socket } from "socket.io";

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
      socket.join(session);
      io.to(socket.id).emit("CONNECTION_SUCCESS", {
        msg: "Connection successful",
      });
      socket.on("NFT_BUY", (data, callback) => {
        const validCallback = callback && typeof callback === "function";
        // if marketplace is not listening, inform mobile app
        if (io.adapter.rooms.get(`${session}`).size < 2)
          validCallback &&
            callback({ error: "410", msg: "No listener for this session" });
        else {
          // send mobile app response to nft marketplace
          socket.to(`${session}`).emit("NFT_BUY", data);
          // confirm success to mobile app
          validCallback && callback({ ok: true });
        }
      });
    }
  });
};
