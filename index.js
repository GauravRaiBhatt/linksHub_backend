const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

// ********************************************************************************************************************************************
// connecting to database0
mongoose
  .connect(process.env.DATABASE0_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 50,
    wtimeoutMS: 2500,
  })
  .then((msg) => {
    console.log("Successfully connected to database -> Database0");
  })
  .catch((err) => {
    console.log("error in connecting to database ;\n", err);
  });

// starting server
app.listen(port, () => {
  console.log(
    `Starting server at : ${new Date()}\nSever listening at http://localhost:${port}`
  );
});
// ********************************************************************************************************************************************

// home page
app.get("/", (req, res) => {
  res.status(200).json({ message: "This is thelinkshub API :-)" });
});

// routes from ./routes folder
app.use("/api/auth", require("./routes/auth"));
app.use("/api/links", require("./routes/links"));

// default routes
app.get("*", (req, res) => {
  res.status(400).json({ message: "This end-point is wrong:)" });
});
