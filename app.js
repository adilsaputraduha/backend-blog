const express = require("express");
const session = require("express-session");
const { redisStore } = require("redis");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const flash = require("req-flash");
const app = express();

require("dotenv").config();
const { NODE_ENV, PORT_SERVER_DEV, PORT_SERVER_PRO, SECR_KEY } = process.env;

let PORT, KEY;
if (NODE_ENV === "production") {
    PORT = PORT_SERVER_PRO;
    KEY = SECR_KEY;
} else {
    PORT = PORT_SERVER_DEV;
    KEY = SECR_KEY;
}

const loginRoutes = require("./src/routes/router-login");
const logoutRoutes = require("./src/routes/router-logout");
const appRoutes = require("./src/routes/router-app");
const apiRoutes = require("./src/routes/router-api");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(
    helmet({
        contentSecurityPolicy: false,
    })
);

app.disable("x-powered-by");

app.use(express.static(__dirname + "/uploads"));
app.use("/assets", express.static(path.join(__dirname, "src/assets")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/service-worker.js", function (req, res, next) {
    res.sendFile(path.join(__dirname, "src/assets/service-worker.js"));
});

app.set("views", path.join(__dirname, "src/views"));
app.set("view engine", "ejs");

app.use(
    session({
        resave: false,
        saveUninitialized: false,
        secret: KEY,
        store: redisStore,
        name: "secretname",
        cookie: {
            sameSite: true,
            maxAge: 24 * 60 * 60 * 1000,
        },
    })
);

app.use(flash());
app.use(function (req, res, next) {
    res.setHeader(
        "Cache-Control",
        "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
    );
    res.setHeader("Pragma", "no-cache");
    next();
});

app.get("/", (req, res) => {
    res.send("API Version : 1");
});

app.use("/login", loginRoutes);
app.use("/logout", logoutRoutes);
app.use("/app", appRoutes);
app.use("/api", apiRoutes);

app.listen(PORT, () => {
    console.log("Server Berjalan di Port : " + PORT);
});
