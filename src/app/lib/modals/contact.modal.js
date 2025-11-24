import mongoose, { Schema, model, models } from "mongoose";
import sequence from "mongoose-sequence";

const AutoIncrement = sequence(mongoose);

// Clear the existing model if it exists
if (models.Contact) {
    delete models.Contact;
}

// Define fresh schema
const ContactSchema = new Schema({
    
    userId: {
        type: String,
        required: true,
    },
    name:{
    type: String,
    },
    phone:{
    type: String,
    },
    facebookUrl:{
    type: String,
    },
    instagramUrl:{
    type: String,
    },
    note:{
    type: String,
    },
    is_public: {
        type: Boolean,
        default: false,
    },

    

}, { 
    strict: true, // This ensures only defined fields are saved
    timestamps: true // Adds createdAt and updatedAt fields
});

ContactSchema.plugin(AutoIncrement, { inc_field: "contactId" });

// Create a fresh model
const Contact = model("Contact", ContactSchema);

export default Contact;