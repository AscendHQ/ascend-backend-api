import { connect } from "mongoose";
import { config } from "./env";
const { MONGODB_URL } = config;
const options: object = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
};

export const connectDB = (): void => {
  connect(MONGODB_URL as string, options)
    .then(() => console.log("database connection successful"))
    .catch(() => {
      console.log("database connection failed, exiting now...");
      process.exit();
    });
};
