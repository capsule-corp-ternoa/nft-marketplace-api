import { Application } from "express";
import usersRouter from "./api/controllers/V1/mpControllers/users/router";
import nftsRouter from "./api/controllers/V1/mpControllers/nfts/router";
import categoriesRouter from "./api/controllers/V1/mpControllers/categories/router";
import followRouter from "./api/controllers/V1/mpControllers/follows/router";
import appNftsRouter from "./api/controllers/V1/appControllers/nfts/router"
import tmNftsRouter from "./api/controllers/V1/tmControllers/nfts/router"
import nftsRouterV2 from "./api/controllers/V2/mpControllers/nfts/router";
import appNftsRouterV2 from "./api/controllers/V2/appControllers/nfts/router";
import tmNftsRouterV2 from "./api/controllers/V2/tmControllers/nfts/router";

export default function routes(app: Application): void {
  // Marketplace routes
  app.use("/api/mp/users", usersRouter);
  app.use("/api/mp/NFTs", nftsRouter);
  app.use("/api/mp/categories", categoriesRouter);
  app.use("/api/mp/follow", followRouter)
  // Wallet app routes
  app.use("/api/app/NFTs", appNftsRouter)
  // Tiime machine routes
  app.use("/api/tm/NFTs", tmNftsRouter)

  // keep prod app compatibility temporarily 
  app.use("/api/users", usersRouter);
  app.use("/api/NFTs", nftsRouter);

  /// V2 ROUTES
  app.use("/api/V2/mp/NFTs", nftsRouterV2);
  app.use("/api/V2/app/NFTs", appNftsRouterV2)
  app.use("/api/V2/tm/NFTs", tmNftsRouterV2)

}
