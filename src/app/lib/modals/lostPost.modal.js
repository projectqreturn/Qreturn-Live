import mongoose, { Schema, model, models } from "mongoose";
import sequence from "mongoose-sequence";

const AutoIncrement = sequence(mongoose);

const LostPostSchema = new Schema({
  lostPostId: {
    type: Number,
    unique: true,
  },
  title: {
    type: String,
  required: true,
  },
  date: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  Category: {
    type: String,
    required: true,
  },
  District: {
    type: String,
    required: true,
  },
  gps: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  reward: {
    type: Boolean,
    required: true,
    default: false,
  },
  price: {
    type: String,
  },
  email: {
    type: String,
    required: true,
  },
  clerkUserId: {
    type: String,
    required: false,
    default: "",
  },
  photo: {
    type: [String],
    
  },
  postType: {
    type: String,
  },
  is_verified: {
    type: Boolean,
    default: false,
  },
  search_Id: {
    type: String,
    required: false,
    default: "",
  },
}, { timestamps: true });


LostPostSchema.plugin(AutoIncrement, { inc_field: "lostPostId" });

const LostPost = models?.LostPost || model("LostPost", LostPostSchema);

export default LostPost;
