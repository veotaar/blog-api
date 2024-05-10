const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SettingsSchema = new Schema(
  {
    allowSignups: { type: Boolean, default: false },
    allowComments: { type: Boolean, default: false },
    loginRoles: { type: [String], default: ['admin'], enum: ['user', 'admin'] }
  }
);

const Settings = mongoose.model('Settings', SettingsSchema);

module.exports = Settings;
