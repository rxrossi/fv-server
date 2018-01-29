import mongoose from 'mongoose';
import mongoTenant from 'mongo-tenant';

const clientsSchema = mongoose.Schema({
  name: { type: String, unique: true },
  phone: String,
});

clientsSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

clientsSchema.set('toObject', { getters: true, virtuals: true });
clientsSchema.set('toJSON', { getters: true, virtuals: true });

clientsSchema.plugin(mongoTenant);

export default mongoose.model('Client', clientsSchema);

