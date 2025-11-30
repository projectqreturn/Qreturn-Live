import mongoose, { Schema, model, models } from "mongoose";

const ReportPostSchema = new Schema(
  {
    reporterId: {
      type: String,
      required: true,
    },
    reporterEmail: {
      type: String,
      required: true,
    },
    postId: {
      type: String,
      required: true,
    },
    postType: {
      type: String,
      required: true,
      enum: ['lost', 'found'],
    },
    postTitle: {
      type: String,
      required: true,
    },
    postOwnerEmail: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      enum: [
        'Spam',
        'Inappropriate Content',
        'Misleading Information',
        'Scam',
        'Duplicate Post',
        'Other'
      ],
    },
    description: {
      type: String,
      required: true,
      maxlength: 500,
    },
    upvotes: {
      type: [String], // Array of user IDs who upvoted this report
      default: [],
    },
    voteCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'resolved', 'dismissed'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
ReportPostSchema.index({ postId: 1, reporterId: 1 });
ReportPostSchema.index({ status: 1 });
ReportPostSchema.index({ voteCount: -1 });
ReportPostSchema.index({ createdAt: -1 });

const ReportPost = models.ReportPost || model("ReportPost", ReportPostSchema);

export default ReportPost;
