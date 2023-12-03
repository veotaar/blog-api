const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true },
    content: { type: String, required: true },
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    hidden: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const Post = mongoose.model('Post', PostSchema);

module.exports = Post;
