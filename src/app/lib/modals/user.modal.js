import { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  
  photo: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  gps: {
    type: String,
    default: null, // Format: "lat,lng"
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  nic: {
    type: String,
    default: null,
  },
});

const User = models.Users || model("Users", UserSchema);

export default User;