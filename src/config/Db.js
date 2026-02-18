const mongoose = require("mongoose");
const connectDb = async () => {
  try {
    const MongoDbInstance = await mongoose.connect(process.env.MONGO_DB_URL);
    console.log("MongoDb is Connected Succesfully");
  } catch (error) {
    console.log("MongoDb Connection Failed");
    process.exit(1);
  }
};
module.exports = connectDb;
