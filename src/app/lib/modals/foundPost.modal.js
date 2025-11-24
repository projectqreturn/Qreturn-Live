import mongoose, { Schema, model, models } from "mongoose";
import sequence from "mongoose-sequence";

const AutoIncrement = sequence(mongoose);

const FoundPostSchema = new Schema({
  foundPostId: {
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

FoundPostSchema.plugin(AutoIncrement, { inc_field: "foundPostId" });

const FoundPost = models?.FoundPost || model("FoundPost", FoundPostSchema);

export default FoundPost;
