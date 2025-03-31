const mongoose = require("mongoose");
require("dotenv").config(); // Load environment variables from .env file

// Function to connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI; // Get the MongoDB URI from the .env file
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // Exit the process with failure if connection fails
  }
};

module.exports = connectDB;
