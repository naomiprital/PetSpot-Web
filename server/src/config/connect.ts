import mongoose from 'mongoose';

const connectDB = () => {
  mongoose.connect(process.env.MONGODB_URI as string);
  const db = mongoose.connection;
  db.on('error', error => {
    console.error('MongoDB connection error:', error);
  });
  db.once('open', () => {
    console.log('Connected to MongoDB');
  });
};

export default connectDB;
