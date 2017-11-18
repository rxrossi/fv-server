import mongoose from 'mongoose';

export default mongoose.model('Client', mongoose.Schema({
  name: { type: String, unique: true },
  phone: String,
}));
