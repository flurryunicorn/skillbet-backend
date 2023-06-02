import { RouteModule } from "../RouteModuleClass";
// import { getUserSchema, getUsersSchema, getEventsSchema } from "./schema";

import {
  getLeaderboardController,
  createTetrisController,
  getMyInfoController,
  updateMyFlagController,
  resetMyFlagController,
  checkLimitController,
  depositController,
  getTotalUserController,
  claimController,
} from "./controllers";

class TetrisModule extends RouteModule {
  publicRoutes() {
    this.router.get("/fetchLeaderboard", getLeaderboardController);
    this.router.get("/fetchTotalUser", getTotalUserController);
    this.router.post("/getMyInfo", getMyInfoController);
    this.router.post("/updateMyFlag", updateMyFlagController);
    this.router.post("/resetMyFlag", resetMyFlagController);
    this.router.post("/claimAmount", claimController);
    this.router.post("/deposit", depositController);
    this.router.post("/createTetris", createTetrisController);
    this.router.post("/checkLimit", checkLimitController);
    // get all users on the system
    // this.router.get(
    //   "/",
    //   this.validateSchema(getUsersSchema, { includeQuery: true }),
    //   getUsersController
    // );
  }

  privateRoutes() {
    // // get following status
    // this.router.get(
    //   "/:username/follow",
    //   this.validateSchema(null, { idParamCheck: true, idName: "username" }),
    //   getFollowingStatusController
    // );
  }
}

export const tetrisModule = new TetrisModule();
