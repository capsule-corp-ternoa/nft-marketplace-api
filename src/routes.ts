import { Application } from "express";
import usersRouter from "./api/controllers/mpControllers/users/router";
import nftsRouter from "./api/controllers/mpControllers/nfts/router";
import categoriesRouter from "./api/controllers/mpControllers/categories/router";
import appNftsRouter from "./api/controllers/appControllers/nfts/router"
import tmNftsRouter from "./api/controllers/tmControllers/nfts/router"

export default function routes(app: Application): void {
  // Marketplace routes
  app.use("/api/mp/users", usersRouter);
  app.use("/api/mp/NFTs", nftsRouter);
  app.use("/api/mp/categories", categoriesRouter);
  // Wallet app routes
  app.use("/api/app/NFTs", appNftsRouter)
  // Tiime machin routes
  app.use("/api/tm/NFTs", tmNftsRouter)

}
