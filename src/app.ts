import { connectDB } from "./config/database";
connectDB();
import express from "express";
import { Request, Response } from "express";
import logger from "morgan";
import cors from "cors";
import { config } from "./config/env";

const { NODE_ENV } = config;

const app = express();

let whitelist: string[] = ["https://ascend.com"];

if (NODE_ENV !== "production") {
  whitelist = [...whitelist, "http://localhost:3000", "http://127.0.0.1:3000"];
}

const corsOptions = {
  origin: (origin: any, callback: any) => {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback("Not allowed by CORS", false);
    }
  },
};
app.use(cors(corsOptions));

app.disable("x-powered-by");

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.json({ limit: "50mb" }));

// import routers
import authRouter from "./routes/auth";
import organizationRouter from "./routes/organization";
import accountRouter from "./routes/account";

// use routers
app.use("/auth", authRouter);
app.use("/orgs", organizationRouter);
app.use("/account", accountRouter);

app.use("*", (req: Request, res: Response) => {
  const path = req.originalUrl;
  const method = req.method;
  return res.status(404).json({
    error: true,
    path,
    method,
    message: `The method ${method} is not defined on path ${path}`,
  });
});

export default app;
