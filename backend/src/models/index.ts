import mongoose from "mongoose";
import config from "../config/config";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.databaseUrl!);
    console.log(`MongoDB Connected`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
