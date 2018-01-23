import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

const { Schema } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
});

userSchema.pre('save', function (next) {
  const user = this;

  const salt = bcrypt.genSaltSync();

  user.set('password', bcrypt.hashSync(user.password, salt));

  next();
});

userSchema.methods.isPassCorrect = (candidatePassword, password) =>
  bcrypt.compareSync(candidatePassword, password);


export default mongoose.model('User', userSchema);
