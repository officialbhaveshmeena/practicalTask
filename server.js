const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");

const productRoute = require("./routes/product");
const userRoute = require("./routes/user");

dotenv.config();
const url =
  "mongodb+srv://venom:venom@cluster0.nn4apzp.mongodb.net/practical?retryWrites=true&w=majority";

mongoose.connect(url, () => {
  console.log("database connected..");
});
mongoose.set("strictQuery", false);
mongoose.Promise = global.Promise;
const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log("server is running on port: " + PORT + " on localhost");
});

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: !0 })),
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "OPTIONS, GET, POST, PUT, PATCH, DELETE"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    next();
  });

//user
app.use("/user", userRoute);
//products
app.use("/product", productRoute);
