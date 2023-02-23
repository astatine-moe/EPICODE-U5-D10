const http = require("http"),
    express = require("express"),
    mongoose = require("mongoose"),
    morgan = require("morgan"),
    expressListRoutes = require("express-list-routes"),
    expressCookieParser = require("cookie-parser"),
    path = require("path");
const {
    badRequestHandler,
    notFoundHandler,
    genericErrorHandler,
} = require("./err");

require("dotenv").config({ path: path.join(__dirname, ".env") });

const app = express();
const server = http.createServer(app);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI);
mongoose.connection.on("error", (err) => {
    console.error(err);
    console.log(
        "MongoDB connection error. Please make sure MongoDB is running."
    );
    process.exit();
});

// Express configuration
app.set("port", process.env.PORT || 3000);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//cookies
app.use(expressCookieParser());

// Routes
app.use("/products", require("./api/products/route"));
app.use("/products", require("./api/reviews/route"));

// Error handler
app.use(badRequestHandler);
app.use(notFoundHandler);
app.use(genericErrorHandler);

// Start Express server
server.listen(app.get("port"), () => {
    console.log(
        "App is running at http://localhost:%d in %s mode",
        app.get("port"),
        app.get("env")
    );
    console.log("Press CTRL-C to stop");

    expressListRoutes({ prefix: "/api" }, "API:", app);
});
