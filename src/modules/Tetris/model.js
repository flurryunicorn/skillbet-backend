import mongoose from "mongoose";

const Schema = mongoose.Schema;
const TetrisSchema = new Schema(
  {
    wallet: {
      type: String,
      default: 0,
    },
    txHash: {
      type: String,
      default: 0,
    },
    amount: {
      type: Number,
      default: 0,
    },
    goal: {
      type: Number,
      default: 0,
    },
    score: {
      type: Number,
      default: 0,
    },
    level: {
      type: Number,
      default: 1,
    },
  },
  {
    autoIndex: true,
    timestamps: true,
    toJSON: { getters: true },
  }
);
const UserModel = mongoose.model("Tetris", TetrisSchema, "tetrises");

export default UserModel;
