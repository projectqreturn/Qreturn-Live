import mongoose, { Schema, model, models } from "mongoose";
import sequence from "mongoose-sequence";

const AutoIncrement = sequence(mongoose);

// Clear the existing model if it exists
if (models.MyItems) {
    delete models.MyItems;
}

// Define fresh schema
const MyItemsSchema = new Schema({
    myItemsId: {
        type: Number,
        unique: true,
    },
    userId: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    Category: {
        type: String,
        required: true,
    },
    photo: {
        type: [String],
        default: [],
    },
    description: {
        type: String,
        required: true,
    },
    search_Id: {
    type: String,
    required: false,
    },
    isMarkedAsLost: {
    type: Boolean,
    default: false,
    },
    lostPostId: {
    type: Number,
    required: false,
    },

}, { 
    strict: true, // This ensures only defined fields are saved
    timestamps: true // Adds createdAt and updatedAt fields
});

MyItemsSchema.plugin(AutoIncrement, { inc_field: "myItemsId" });

// Create a fresh model
const MyItems = model("MyItems", MyItemsSchema);

export default MyItems;
