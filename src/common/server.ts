import express, { Application } from "express";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import os from "os";
import L from "./logger";
import errorHandler from "../api/middlewares/error.handler";
import * as Sentry from "@sentry/node"
import * as Tracing from "@sentry/tracing"
import compression from "compression";

const app = express();

if (process.env.SENTRY_DSN){
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.SENTRY_ENV,
    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // enable Express.js middleware tracing
      new Tracing.Integrations.Express({
        app,
      }),
    ],
    tracesSampleRate: 1.0,
  });
}

export default class ExpressServer {
  constructor() {
    // CORS
    app.use(cors());
    // express middlewares
    app.use(compression())
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
    } as any);
    const db = mongoose.connection;
    db.on("error", (err) => L.error({ err }, "db connection error"));
    db.once("open", () => {
      L.info("db connection successfull");
    });
  }

  router(routes: (app: Application) => void): ExpressServer {
    if (process.env.SENTRY_DSN) app.use(Sentry.Handlers.requestHandler());
    if (process.env.SENTRY_DSN) app.use(Sentry.Handlers.tracingHandler());
    routes(app);
    if (process.env.SENTRY_DSN) app.use(Sentry.Handlers.errorHandler());
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

    const io = new Server(httpServer, {
      // TODO: handle CORS
      cors: { origin: "*" },
      transports: ['websocket']
    });

    socketInit(io);

    httpServer.listen(port, welcome(port));

    return app;
  }
}
