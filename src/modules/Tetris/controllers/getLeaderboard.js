import { errorResponse, successResponse } from "../../../utils";
import Tetris from "../model";
import Userinfo from "../../Tetris/UserinfoModel";

const { DirectSecp256k1HdWallet } = require("@cosmjs/proto-signing");
const { calculateFee } = require("@cosmjs/stargate");
const { getSigningCosmWasmClient } = require("@sei-js/core");

export const getLeaderboardController = async (req, res) => {
  let data;
  try {
    const { } = req;
    // try {
    //   const now = new Date();
    //   const currentHour = now.getHours();
    //   let lowerBound = new Date(now);
    //   let upperBound = new Date(now);
    //   lowerBound.setHours(Math.floor(currentHour / 2) * 2, 0, 0, 0);
    //   upperBound.setHours(Math.ceil(currentHour / 2) * 2, 0, 0, 0);

    //   data = await Tetris.find({
    //     timestamp: {
    //       $gte: lowerBound,
    //       $lt: upperBound,
    //     },
    //   })
    //     .select("wallet score amount level createdAt")
    //     .sort({ score: -1 });
    // } catch (err) {
    //   console.log("tetris", err);
    // }
    console.log("aaa");
    const showInfo = await Userinfo.find({}).sort({ totalScore: -1 }).limit(5);
    const tetrisInfo = await Tetris.find({}).sort({ updatedAt: -1 }).limit(15);
    return successResponse({
      res,
      response: { data: { showInfo, tetrisInfo } },
    });
  } catch (err) {
    return errorResponse({ res, err });
  }
};

export const getTotalUserController = async (req, res) => {
  let data;
  try {
    const { } = req;
    const totalUser = await Tetris.find({}).count();
    return successResponse({
      res,
      response: { data: totalUser },
    });
  } catch (err) {
    return errorResponse({ res, err });
  }
};

export const getMyInfoController = async (req, res) => {
  console.log("getMyInfo called!");
  let { wallet } = req.body;
  try {
    console.log(wallet);
    const userInfo = await Userinfo.findOne({ wallet });
    return successResponse({
      res,
      response: { data: userInfo },
    });
  } catch (err) {
    return errorResponse({ res, err });
  }
};

export const updateMyFlagController = async (req, res) => {
  console.log("updateMyFlag called!");
  let { wallet } = req.body;

  const existingUser = await Userinfo.findOne({ wallet });
  console.log(existingUser);

  if (existingUser) {
    if (existingUser.totalPlay < 4) {
      existingUser.totalPlay += 1;
    }
    await existingUser.save();
    return successResponse({
      res,
      response: { existingUser },
    });
  } else {
    return errorResponse({ res, err: "Cannot find User!" });
  }
};

export const resetMyFlagController = async (req, res) => {
  console.log("resetMyFlag called!");
  let { wallet } = req.body;

  const existingUser = await Userinfo.findOne({ wallet });
  console.log(existingUser);

  if (existingUser && existingUser.totalPlay === 4) {
    const boost = Math.floor((Math.random() * 10) + 1) / 100;
    existingUser.totalPlay = 0;
    existingUser.totalBalance += boost;
    await existingUser.save();
    return successResponse({
      res,
      response: { boost, existingUser },
    });
  } else {
    return errorResponse({ res, err: "Cannot find User!" });
  }
};

export const depositController = async (req, res) => {
  const { wallet, txHash, amount } = req.body;
  console.log(wallet, txHash, amount);

  const existingUser = await Userinfo.findOne({ wallet });
  console.log(existingUser);
  if (existingUser) {
    // Update the total score for the existing user
    existingUser.totalBalance =
      Math.floor((existingUser.totalBalance + amount) * 1000) / 1000;
    await existingUser.save();
    return successResponse({
      res,
      response: { existingUser },
    });

    console.log(`Updated user with wallet ${wallet}`);
  } else {
    // Create a new user with the given wallet and total score

    const newUser = new Userinfo({
      wallet,
      totalBalance: amount,
      totalScore: 0,
      lastScore: 0,
    });
    await newUser.save();
    console.log(`Created new user with wallet ${wallet}`);
    return successResponse({
      res,
      response: { newUser },
    });
  }
};

export const createTetrisController = async (req, res) => {
  const { wallet, txHash, amount, level } = req.body;
  console.log(wallet);

  const user = await Userinfo.findOne({ wallet });
  if (user) {
    if (user.totalBalance < amount) {
      return errorResponse({ res, err: "Can't create game" });
    }
  } else {
    return errorResponse({ res, err: "Can't create game" });
  }

  //need validation

  try {
    // const todayTotal = await Tetris.find({ wallet, level }).count();
    // if (todayTotal > 5) {
    //   return res.status(400).json({ message: "Rate limit" });
    // }
    let goal;
    if (level === 1) {
      goal = Math.floor(Math.random() * 14000) + 1000;
    }
    if (level === 2) {
      goal = Math.floor(Math.random() * 25000) + 15000;
    }
    if (level === 3) {
      goal = Math.floor(Math.random() * 210000) + 40000;
    }
    const newTetris = await Tetris.create({
      wallet,
      txHash,
      amount,
      score: 0,
      goal,
      level,
    });
    console.log(newTetris);

    user.totalBalance = Math.floor((user.totalBalance - amount) * 1000) / 1000;
    await user.save();

    return successResponse({
      res,
      response: { newTetris },
    });
  } catch (err) {
    return errorResponse({ res, err });
  }
};

export const checkLimitController = async (req, res) => {
  const { wallet, level } = req.body;
  console.log(wallet, level);

  try {
    const todayTotal = await Tetris.find({ wallet, level }).count();
    if (todayTotal > 5) {
      return res.status(400).json({ message: "Rate limit" });
    }

    return successResponse({
      res,
      response: { status: "ok" },
    });
  } catch (err) {
    return errorResponse({ res, err });
  }
};

export const claimController = async (req, res) => {
  return successResponse({
    res,
    response: { status: "ok" },
  });
  const { walletAddress, amount } = req.body;
  const userinf = await Userinfo.findOne({ wallet: walletAddress });
  console.log(userinf);
  if (userinf) {
    if (userinf.totalBalance >= amount) {
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(
        "judge absent panther concert sadness dash know velvet century merry lock clown",
        { prefix: "sei" }
      );
      const [firstAccount] = await wallet.getAccounts();
      const client = await getSigningCosmWasmClient(
        "https://rpc.atlantic-2.seinetwork.io/",
        wallet
      );

      let transferAmount;

      // check result and send payment
      // Execute a message on a smart contract
      transferAmount = {
        amount: Math.floor(amount * 1e6).toString(),
        denom: "usei",
      };
      console.log(transferAmount);
      const fee = calculateFee(150000, "0.1usei");
      try {
        const result = await client.sendTokens(
          firstAccount.address,
          walletAddress,
          [transferAmount],
          fee
        );
        console.log("result", result);
        userinf.totalBalance =
          Math.floor((userinf.totalBalance - amount) * 1000) / 1000;
        await userinf.save();
        console.log(result);
        return successResponse({
          res,
          response: { result: "ok" },
        });
      } catch (err) {
        console.log(err);
        return errorResponse({ res, err: "rpc issue" });
      }
    } else {
      return errorResponse({ res, err: "you don't have enough balance" });
    }
  } else {
    return errorResponse({ res, err: "unable to find user for this wallet" });
  }
};
