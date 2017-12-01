import mongoose from 'mongoose';

const professionalsSchema = mongoose.Schema({
  name: { type: String, unique: true },
  phone: String,
});

professionalsSchema.virtual('id').get(function(){
    return this._id.toHexString();
});

professionalsSchema.set('toObject', { getters: true, virtuals: true });
professionalsSchema.set('toJSON', { getters: true, virtuals: true });

export default mongoose.model('Professional', professionalsSchema);

