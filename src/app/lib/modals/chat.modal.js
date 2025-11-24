import mongoose, { Schema, model, models } from "mongoose";
import sequence from "mongoose-sequence";

const AutoIncrement = sequence(mongoose);

const ChatRoomSchema = new Schema({
  chatRoomId: {
    type: Number,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  sender: {
    type: String,
    required: true,
  },
  finder: {
    type: String,
    required: true,
  },
  postId: {
    type: String,
    required: true,
  },
}, { timestamps: true });

ChatRoomSchema.plugin(AutoIncrement, { inc_field: "chatRoomId" });

const ChatRoom = models?.ChatRoom || model("ChatRoom", ChatRoomSchema);

export default ChatRoom;
