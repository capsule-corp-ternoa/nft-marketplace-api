import "./common/env";
import Server from "./common/server";
import routes from "./routes";
import socketInit from "./socket.io/main";

const port = parseInt(process.env.PORT ?? "3000", 10);
export default new Server().router(routes).listen(port, socketInit);
