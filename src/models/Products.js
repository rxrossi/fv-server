import mongoose from 'mongoose';

export default mongoose.model('Product', mongoose.Schema({
  name: { type: String, unique: true },
  measure_unit: String,
}));
