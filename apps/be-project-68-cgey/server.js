const express = require("express");
const dotenv = require("dotenv");
const dbconnection = require("./config/db");

dotenv.config({ path: "./config/.env" });

const app = express();
app.use(express.json());
dbconnection();
console.log("MONGO_URI:", process.env.MONGO_URI);

const auth = require("./routes/auth");
const companies = require("./routes/companies");
const bookings = require("./routes/bookings");
const jobs = require("./routes/jobs");
const reviews = require("./routes/reviews");

app.use("/api/v1/", auth);
app.use("/api/v1/companies", companies);
app.use("/api/v1/bookings", bookings);
app.use("/api/v1/jobs", jobs);
app.use("/api/v1/reviews", reviews);

const port = process.env.PORT || 5050;
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
