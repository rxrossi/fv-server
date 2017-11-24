import mongoose from 'mongoose';

export default mongoose.model('Professional', mongoose.Schema({
  name: { type: String, unique: true },
  phone: String,
}));
