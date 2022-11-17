const router = require("express").Router();
const bcryptjs = require("bcryptjs");
const usersCollection = require("../models/usersModel");

router.get("/", (req, res) => {
  res
    .status(200)
    .json({ message: "This end-point will provide authentication services" });
});

router.post(
  "/signup",
  (req, res, next) => {
    if (req.body.password.trim().length)
      req.body.password = bcryptjs.hashSync(req.body.password.trim(), 12);
    next();
  },
  (req, res) => {
    const { userHandle, userName, public, password } = req.body;

    if (
      !userHandle.trim().length ||
      !userName.trim().length ||
      !password.trim().length
    ) {
      return res.status(400).json({ message: "provide value for each field" });
    } else {
      usersCollection
        .findOne({ userHandle: userHandle.toLowerCase() })
        .then((doc) => {
          if (doc)
            return res
              .status(400)
              .json({ message: "Provide UNIQUE userHandle" });

          usersCollection
            .insertMany({
              userHandle: userHandle.toLowerCase(),
              userName,
              public,
              password,
            })
            .then((response) => {
              res.status(200).json(response[0]);
            })
            .catch((err) => {
              res.status(500).json({ err });
            });
        })
        .catch((err) => {
          res.status(500).json({
            message: "error while verifying the uniqueness of userHandle",
            err,
          });
        });
    }
  }
);

router.post("/login", (req, res) => {
  const { userHandle, password } = req.body;

  if (!userHandle || !password)
    return res.status(400).json({
      message: "provide value for each field" + userHandle + ":" + password,
    });

  usersCollection
    .findOne({ userHandle: userHandle.toLowerCase() })
    .then((doc) => {
      if (doc) {
        bcryptjs
          .compare(password, doc.password)
          .then((passwordMatched) => {
            if (passwordMatched) res.status(200).json(doc);
            else res.status(400).json({ message: "wrong credentials" });
          })
          .catch((err) => {
            res
              .status(400)
              .json({ message: "error while comparing password", err });
          });
      } else {
        res.status(400).json({ message: "No such user exists" });
      }
    })
    .catch((err) => {
      res.status(500).json({
        message: "error while cheacking for the existing userHandle",
        err,
      });
    });
});

router.post("/getUserByUserId", (req, res) => {
  const userId = req.body.userId;
  usersCollection
    .findOne({ _id: userId })
    .then((doc) => {
      if (doc) {
        res.status(200).json(doc);
      } else {
        res.status(400).json({ message: "No such user exists" });
      }
    })
    .catch((err) => {
      res.status(500).json({
        message: "error while cheacking for the user",
        err,
      });
    });
});

module.exports = router;
