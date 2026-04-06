import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";

const app = express();

app.use(
  cors({
    origin: "https://skillhubconnect.vercel.app",
    credentials: true,
  })
);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});


app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "https://skillhubconnect.vercel.app");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
});

app.use(passport.initialize());

import userRouter from "./routes/user.routes.js";
import authRouter from "./routes/auth.routes.js";
import chatRouter from "./routes/chat.routes.js";
import messageRouter from "./routes/message.routes.js";
import requestRouter from "./routes/request.routes.js";
import reportRouter from "./routes/report.routes.js";
import ratingRouter from "./routes/rating.routes.js";

app.use("/user", userRouter);
app.use("/auth", authRouter);
app.use("/chat", chatRouter);
app.use("/message", messageRouter);
app.use("/request", requestRouter);
app.use("/report", reportRouter);
app.use("/rating", ratingRouter);

export { app };
