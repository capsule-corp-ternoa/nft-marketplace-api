import express, { Application } from "express";
import mongoose from "mongoose";
import http from "http";
import cors from "cors";
import os from "os";
import L from "./logger";

import errorHandler from "../api/middlewares/error.handler";

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
    /*
    mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const db = mongoose.connection;
    db.on("error", (err) => L.error({ err }, "db connection error"));
    db.once("open", () => {
      L.info("db connection successfull");
    }); */
  }

  router(routes: (app: Application) => void): ExpressServer {
    routes(app);
    app.use(errorHandler);
    return this;
  }

  listen(port: number): Application {
    const welcome = (portNmbr: number) => (): void =>
      L.info(
        `up and running in ${
          process.env.NODE_ENV || "development"
        } @: ${os.hostname()} on port: ${portNmbr}}`
      );

    http.createServer(app).listen(port, welcome(port));

    return app;
  }
}
