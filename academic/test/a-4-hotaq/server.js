const express = require("express");
const dotenv = require("dotenv");

dotenv.config({ path: "./config/config.env" });

const app = express();

// Body parser
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({ success: true, data: { id: 1 } });
});

const hospitalRouter = require("./routes/hospital");
app.use("/api/v1/hospitals", hospitalRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log("server running"));
