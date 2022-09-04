const router = require("express").Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const verify = require("../verifyToken");
const CryptoJs = require("crypto-js");

//update
router.put("/:id", verify, async (req, res) => {
  if (req.user.id === req.params.id || req.user.isAdmin) {
    if (req.body.password) {
      req.body.password = CryptoJS.AES.encrypt(
        JSON.stringify(req.body.password),
        process.env.SECRET_KEY
      ).toString();
    }
    try {
      const updateUser = await User.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      );
      res.status(200).json(updateUser);
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("you can update only your account");
  }
});

//delete user

router.delete("/:id", verify, async (req, res) => {
  if (req.user.id === req.params.id || req.user.isAdmin) {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.status(200).json("user hasbeen deleted");
    } catch (err) {
      res.status(403).json(err);
    }
  } else {
    res.status(403).json("you can delete only your account");
  }
});

//get

router.get("/find/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, ...info } = user._doc;
    res.status(200).json(info);
  } catch (err) {
    res.status(403).json(err);
  }
});

//get all
router.get("/", verify, async (req, res) => {
  const query = req.query.new;
  // console.log('isAdmin',req.user.isAdmin)
  if (req.user.isAdmin) {
    try {
      const users = query
        ? await User.find().sort({ _id: -1 }).limit(5)
        : await User.find();
      res.status(200).json(users);
    } catch (err) {
      res.status(403).json(err);
    }
  } else {
    res.status(403).json("you are not allowed to see all users");
  }
});



// get stats

router.get("/stats", async (req, res) => {
  // console.log('stats route')

  const today = new Date();
  const lastYear = today.setFullYear(today.setFullYear() - 1);
 

  try {
    const data = await User.aggregate([
      {
        $project: {
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
    ]);
    // console.log('userStats', data)
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
