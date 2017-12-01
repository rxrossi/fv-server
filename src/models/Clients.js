import mongoose from 'mongoose';

const clientsSchema = mongoose.Schema({
  name: { type: String, unique: true },
  phone: String,
});

clientsSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

export default mongoose.model('Client', clientsSchema);

