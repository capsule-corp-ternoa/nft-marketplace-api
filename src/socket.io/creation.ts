// tslint:disable: no-unused-expression

import { Namespace, Socket } from "socket.io";

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
      socket.on("MINTING_NFT", (data, callback) => {
        const validCallback = callback && typeof callback === "function";
        // if marketplace is not listening, inform mobile app
        if (io.adapter.rooms.get(`${session}`).size < 2)
          validCallback &&
            callback({ error: "410", msg: "No listener for this session" });
        else {
          // send mobile app response to nft marketplace
          socket.to(`${session}`).emit("MINTING_NFT", data);
          // confirm success to mobile app
          validCallback && callback({ ok: true });
        }
      });
    }
  });
};
