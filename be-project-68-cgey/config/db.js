const mongoose = require("mongoose");

const dbconnection = async () => {
  await mongoose.connect(
    process.env.MONGO_URI,

    console.log(
      `Connected to MongoDB ${mongoose.connection.host}:${mongoose.connection.port}`,
    ),
  );
};

module.exports = dbconnection;
