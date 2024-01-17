const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema(
  {
    parent: { type: Schema.Types.ObjectId, ref: 'Article' },
    author: { type: String, required: true },
    content: { type: String, required: true }
  },
  { timestamps: true }
);

const Comment = mongoose.model('Comment', CommentSchema);

module.exports = Comment;
