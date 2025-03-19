import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false }, // exclude password by default
  role: { type: String, required: true, enum: ['Admin', 'Developer', 'Tester'], default: 'Tester' },
});

// Password hashing before saving (middleware)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  // console.log("this pre userSchma is working!! bruh")
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// method to compare passwords
userSchema.methods.comparePassword = async function (enteredPassword){
  return bcrypt.compare(enteredPassword, this.password)
}

const User = mongoose.model('User', userSchema);
export default User
