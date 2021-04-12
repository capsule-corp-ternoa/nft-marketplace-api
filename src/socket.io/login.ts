import { Namespace, Socket } from "socket.io";

export default (io: Namespace) => {
  io.on("connection", (socket: Socket) => {
    const { session } = socket.handshake.query;

    socket.join(session);
    io.to(session).emit("CONNECTION_SUCCESS", {
      msg: "connection successful",
    });

    socket.on("SEND_WALLET_ID", ({ session: sessionArg, walletId }) => {
      socket.to(`${sessionArg}`).emit("RECEIVE_WALLET_ID", { walletId });
    });
  });
};
