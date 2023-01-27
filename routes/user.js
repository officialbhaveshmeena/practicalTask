const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const hashRound = 10;
const randToken = require("rand-token");
const DOMAIN = "icma-apac.com";
const dotenv = require("dotenv");
dotenv.config();

const mail_key = process.env.mail_key;
const MAIL = process.env.MAIL;
console.log(MAIL, mail_key);

const mailgun = require("mailgun-js")({
  apiKey: mail_key,
  domain: DOMAIN,
});

router.post("/register", async (req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  let password = req.body.password;
  console.log(req.body);

  try {
    if (password) {
      let hashpassword = await bcrypt.hash(password, hashRound);
      const user = new User({
        username: username,
        email: email,
        password: hashpassword,
      });
      await user.save();
      console.log(user);
      res.json({
        msq: "register successfully",
        user: {
          name: user.username,
          email: user.email,
        },
      });
    } else {
      res.json({
        Error: "Please Enter Password",
      });
    }
  } catch (e) {
    res.json({
      Error: e.message,
    });
  }
});

router.post("/login", async (req, res) => {
  // const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  console.log(req.body);

  if (!req.body.email || !req.body.password) {
    //401 authorized
    res.json({
      msg: "No credientials",
    });
  } else {
    //password = await bcrypt.compare(password,)
    try {
      const user = await User.findOne({ email: email });
      if (user) {
        let result = bcrypt.compare(password, user.password);
        if (result) {
          console.log("user logged in..");
          res.json({
            msq: "login successfully",
            user: {
              name: user.username,
              email: user.email,
            },
          });
        } else {
          res.json({
            msg: "Invalid Credentials",
          });
        }
      } else {
        res.json({
          msg: "Invalid Credentials",
        });
      }
    } catch (e) {
      res.json({
        Error: e.message,
      });
    }
  }
});

router.post("/update/:id", async (req, res) => {
  const id = req.params.id;
  const data = req.body;

  try {
    if (data.password) {
      let hashpassword = await bcrypt.hash(data.password, hashRound);
      data.password = hashpassword;
      await User.findByIdAndUpdate({ _id: id }, { $set: data });
      const user = await User.findById({ _id: id });
      res.json({
        msq: "user update successfully",
        user: {
          msg: "Password update successfully",
          name: user.username,
          email: user.email,
        },
      });
    } else {
      await User.findByIdAndUpdate({ _id: id }, { $set: data });
      const user = await User.findById({ _id: id });
      res.json({
        msq: "user update successfully",
        user: {
          name: user.username,
          email: user.email,
        },
      });
    }
  } catch (e) {
    res.json({
      Error: e.message,
    });
  }
});

//forget password

//link generation
router.post("/forgot-password", async (req, res) => {
  const email = req.body.email;
  const token = randToken.generate(16);

  try {
    const user = await User.findOne({ email: email });
    if (user) {
      await User.updateOne(
        { email: email },
        {
          $set: {
            token: token,
          },
        }
      );
      const url = `http://localhost:4500/user/reset-password?token=${token}`;

      let messageOptions = {
        from: MAIL,
        to: email,
        subject: "Reset Password Link",
        html:
          '<p>You requested for reset password, kindly use this <a "' +
          url +
          '">link</a> : "' +
          url +
          '"to reset your password</p>',
      };

      mailgun.messages().send(messageOptions, async function (error, info) {
        if (error) {
          console.log("mail not sent");
          //console.log(error);
          res.json({
            status: false,
            message: "Link couldn't sent",
          });
        } else {
          console.log("mail sent");
          res.json({
            url: url,
            status: true,
            message: "Link Sent successfully",
          });
        }
      });
    } else {
      res.json({
        status: false,
        message: "User doesn't exists",
      });
    }
  } catch (e) {
    res.json({
      Error: e.message,
    });
  }
});

//reset password
router.post("/reset-password", async (req, res) => {
  const token = req.query.token;
  const changePass = req.body.password;

  try {
    let hashchangePass = await bcrypt.hash(changePass, hashRound);
    let result = await User.updateOne(
      { token: token },
      {
        $set: {
          password: hashchangePass,
        },
      }
    );

    console.log(result);
    if (!result.matchedCount) {
      res.json({
        message: "Invalid token",
      });
    } else if (result.modifiedCount && result.matchedCount) {
      await User.updateOne(
        { token: token },
        {
          $unset: {
            token: "",
          },
        }
      );
      res.json({
        message: "password reset successfully",
      });
    } else {
      res.json({
        message: "couldn't set password",
      });
    }
  } catch (e) {
    res.json({
      Error: e.message,
    });
  }
});

module.exports = router;
