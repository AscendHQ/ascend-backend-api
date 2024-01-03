import { connectDB } from "./config/database";
connectDB();
import express from "express";
import { Request, Response } from "express";
import logger from "morgan";
import cors from "cors";
import { config } from "./config/env";

const { NODE_ENV } = config;

const app = express();

let whitelist: string[] = [
  "https://ascend.africa",
  "https://staging.ascend.africa",
];

if (NODE_ENV !== "production") {
  whitelist = [
    ...whitelist,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://school-management-git-staging-ascendhq.vercel.app",
    "https://ascend-africa.vercel.app",
  ];
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
import staffRouter from "./routes/staff";
import classRouter from "./routes/class";
import subjectRouter from "./routes/subject";
import studentRouter from "./routes/student";

import accountRouter from "./routes/account";
import organizationRouter from "./routes/organization";
import hostelRouter from "./routes/hostel";
import lessonRouter from "./routes/lesson";
import resultRouter from "./routes/result";

// use routers
app.use("/auth", authRouter);
app.use("/staffs", staffRouter);
app.use("/classes", classRouter);
app.use("/subjects", subjectRouter);
app.use("/students", studentRouter);

// commented out as they want to release one feature at a time

// app.use("/organizations", organizationRouter);
// app.use("/accounts", accountRouter);
// app.use("/hostels", hostelRouter);
// app.use("/lessons", lessonRouter);
// app.use("/results", resultRouter);

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
