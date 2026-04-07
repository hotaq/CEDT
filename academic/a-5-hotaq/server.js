const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config({ path: "./config/config.env" });

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({ success: true, data: { id: 1 } });
});

const hospitalRouter = require("./routes/hospitals");
app.use("/api/v1/hospitals", hospitalRouter);

const PORT = process.env.PORT || 5050;
const server = app.listen(PORT, console.log(`Server running on port ${PORT}`));

process.on("unhandledRejection", (err, promise) => {
  console.log(`Error ${err.message}`);

  server.close(() => process.exit(1));
});
