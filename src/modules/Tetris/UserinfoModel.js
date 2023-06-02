import mongoose from "mongoose";

const Schema = mongoose.Schema;
const UserinfoSchema = new Schema(
  {
    wallet: {
      type: String,
      unique: true,
      default: 0,
    },
    totalBalance: {
      type: Number,
      default: 0,
    },
    totalScore: {
      type: Number,
      default: 0,
    },
    totalPlay: {
      type: Number,
      default: 0,
    },
    lastScore: {
      type: Number,
      default: 0,
    },
    rankRange: {
      type: String,
    },
  },
  {
    autoIndex: true,
    timestamps: true,
    toJSON: { getters: true },
  }
);
const UserinfoModel = mongoose.model("Userinfo", UserinfoSchema, "userinfo");

export default UserinfoModel;
