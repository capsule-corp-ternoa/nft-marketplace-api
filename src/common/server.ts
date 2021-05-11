import express, { Application } from "express";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import os from "os";
import L from "./logger";

import errorHandler from "../api/middlewares/error.handler";
import { RedisClient } from 'redis';
import { createAdapter } from "socket.io-redis";

const app = express();

export default class ExpressServer {
  constructor() {
    // CORS
    app.use(cors());

    // express middlewares
    app.use(express.json({ limit: process.env.REQUEST_LIMIT || "100kb" }));
    app.use(
      express.urlencoded({
        extended: true,
        limit: process.env.REQUEST_LIMIT || "100kb",
      })
    );
    app.use(express.text({ limit: process.env.REQUEST_LIMIT || "100kb" }));

    // mongo connection

    mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const db = mongoose.connection;
    db.on("error", (err) => L.error({ err }, "db connection error"));
    db.once("open", () => {
      L.info("db connection successfull");
    });
  }

  router(routes: (app: Application) => void): ExpressServer {
    routes(app);
    app.use(errorHandler);
    return this;
  }

  listen(port: number, socketInit: (s: Server) => void): Application {
    const welcome = (portNmbr: number) => (): void =>
      L.info(
        `up and running in ${process.env.NODE_ENV || "development"
        } @: ${os.hostname()} on port: ${portNmbr}}`
      );

    // creates http server
    const httpServer = http.createServer(app);

    // creates socket io server
    const pubClient = new RedisClient({ host: '0.0.0.0', port: 6379 });
    const subClient = pubClient.duplicate();
    const io = new Server(httpServer, {
      // TODO: handle CORS
      cors: { origin: "*" },
      transports: ['websocket']
    }).adapter(createAdapter({ pubClient, subClient }));

    socketInit(io);

    httpServer.listen(port, welcome(port));

    return app;
  }
}
