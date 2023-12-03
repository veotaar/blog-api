const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true }
});

UserSchema.statics.isUsernameExists = async function (username) {
  return this.exists({ username })
    .collation({ locale: 'en', strength: 2 })
    .exec();
};

const User = mongoose.model('User', UserSchema);

module.exports = User;
