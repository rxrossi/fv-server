import mongoose from 'mongoose';
import mongoTenant from 'mongo-tenant';

const professionalsSchema = mongoose.Schema({
  name: { type: String, unique: true },
  phone: String,
});

professionalsSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

professionalsSchema.set('toObject', { getters: true, virtuals: true });
professionalsSchema.set('toJSON', { getters: true, virtuals: true });
professionalsSchema.plugin(mongoTenant);

export default mongoose.model('Professional', professionalsSchema);

