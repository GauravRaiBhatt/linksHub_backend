const usersCollection = require("../models/usersModel");
const linksCollection = require("../models/linksModel");
const { mongo } = require("mongoose");

const router = require("express").Router();

// this route works fine
router.get("/", (req, res) => {
  res
    .status(200)
    .json({ message: "This end-point will provide links related services" });
});

// this route works fine
// returns all the links available in the collection : links
// this needs to be made protected
router.get("/alllinks", (req, res) => {
  linksCollection
    .find()
    .then((links) => {
      if (links.length)
        return res.status(200).json({
          allLinks: links,
          message: "allLinks is the array of the public links available",
        });
      return res
        .status(200)
        .json({ allLinks: [], message: "NO public links available till date" });
    })
    .catch((err) => {
      res.status(500).json({
        message: "error while quering database for publically available links",
        err,
      });
    });
});

// this route works fine
router.get("/allPublicLinks", (req, res) => {
  linksCollection
    .find({ public: true })
    .then((links) => {
      if (links.length)
        return res.status(200).json({
          allPublicLinks: links,
          message: "Successfully fetched allPublic links.",
        });
      return res.status(200).json({
        allPublicLinks: [],
        message: "NO public links available till date",
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: "error while quering database for publically available links",
        err,
      });
    });
});

router.post("/allHisPrivateLinks", (req, res) => {
  const userId = req.body.userId;
  linksCollection
    .find({ userId: userId, public: false })
    .then((doc) => {
      if (doc.length)
        return res.status(200).json({
          links: doc,
          message: `successfully fetched all the private links created so far by ${doc[0].userName}`,
        });
      else
        return res
          .status(200)
          .json({ links: [], message: "No private links so far" });
    })
    .catch((error) => res.status(500).json(error));
});

// this route works fine
// this needs to be made protected
router.post("/addlink", (req, res) => {
  const { userId, userHandle, userName, title, link, public } = req.body;

  if (!userId || !userName || !title || !link)
    return res.status(400).json({ message: "provide value for each field" });

  usersCollection
    .findOne({ _id: userId })
    .then((doc) => {
      if (!doc)
        return res.status(400).json({ message: "userId does not exists" });

      // check if this new item to be added is duplicate => {userId,title,link,public}
      linksCollection
        .findOne({ userId: userId, title: title, link: link, public: public })
        .then((doc) => {
          if (doc) {
            return res
              .status(400)
              .json({ message: "This seems to be a duplicate entry" });
          } else {
            linksCollection
              .insertMany({ userId, userHandle, userName, title, link, public })
              .then((response) => {
                console.log(response[0]._id);

                usersCollection
                  .updateOne(
                    { _id: userId },
                    { $addToSet: { links: response[0]._id } }
                  )
                  .then(() => {
                    return res.status(200).json({
                      message: "successfully added link's _id to links[]",
                      ...response,
                    });
                  })
                  .catch((err) => {
                    return res.status(500).json({
                      message: "error while adding link's id to the links[]",
                      err,
                    });
                  });
              })
              .catch((err) => {
                return res
                  .status(500)
                  .json({ message: "error while adding the link", err });
              });
          }
        })
        .catch((err) => {
          return res.status(500).json({
            message: "error while checking uniqueness of the link to be added",
            err,
          });
        });
    })
    .catch((err) => {
      return res
        .status(500)
        .json({ message: "error while verifying userId", err });
    });
});

// this need to be made protected
router.delete("/delete/:id", (req, res) => {
  const id = req.params.id;
  const userId = req.body.userId;
  linksCollection
    .findOne({ _id: id })
    .then((doc) => {
      if (!doc) {
        return res
          .status(400)
          .json({ message: "Link does not exists therefore operation failed" });
      } else if (doc.userId != userId) {
        return res
          .status(400)
          .json({ message: "You are not the owner of this link :)" });
      } else {
        linksCollection
          .deleteOne({ _id: id })
          .then(() => {
            // also remove the id from the users:links[] for this user
            usersCollection
              .updateOne(
                { _id: userId },
                { $pull: { links: mongo.ObjectId(id) } }
              )
              .then(() => {
                return res
                  .status(200)
                  .json({ message: `Successfully deleted links ${id}` });
              })
              .catch((error) => {
                return res.status(500).json({
                  error,
                  message: "Failed while deleting from links[]",
                });
              });
          })
          .catch((error) => {
            return res
              .status(500)
              .json({ error, message: "Failed while deleting link" });
          });
      }
    })
    .catch((error) => {
      return res
        .status(500)
        .json({ error, message: "error while varifying userId" });
    });
});

module.exports = router;
