import express from "express";
import cookieParser from "cookie-parser";
import logger from "morgan";
import CORS from "cors";
import authRouter from "./routes/auth.js";
import projectRouter from "./routes/project.js";

var app = express();

app.use(
    CORS({
        origin: true,
    }),
);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/auth", authRouter);
app.use("/project", projectRouter);

app.use(function (req, res, next) {
    res.status(404).json({
        success: false,
        message: "This route could not be found",
        data: null,
    });
});

app.use(function (err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    res.status(err.status || 500).json({
        success: false,
        message: "An error occurred",
        data: null,
    });
});

export default app;
