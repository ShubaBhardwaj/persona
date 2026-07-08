import mongoose from "mongoose";

const DBConnect = async () => {
  const connect = await mongoose.connect(process.env.MONGO_DB_URI as string);
  console.log(`MongoDB connected`);
};

export default DBConnect;
