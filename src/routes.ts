import { Application } from "express";
import usersRouter from "./api/controllers/users/router";
import nftsRouter from "./api/controllers/nfts/router";

export default function routes(app: Application): void {
  app.use("/api/users", usersRouter);
  app.use("/api/NFTs", nftsRouter);
}
