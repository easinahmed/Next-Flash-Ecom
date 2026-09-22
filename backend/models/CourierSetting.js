const mongoose = require('mongoose');

const courierSettingSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      required: true,
      enum: ['steadfast', 'pathao'],
      unique: true,
    },
    isEnabled: {
      type: Boolean,
      default: false,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    mode: {
      type: String,
      enum: ['sandbox', 'production'],
      default: 'production',
    },
    // Steadfast fields
    apiKey: {
      type: String,
      default: '',
    },
    secretKey: {
      type: String,
      default: '',
    },
    baseUrl: {
      type: String,
      default: 'https://portal.steadfast.com.bd/api/v1',
    },
    // Pathao fields
    clientId: {
      type: String,
      default: '',
    },
    clientSecret: {
      type: String,
      default: '',
    },
    username: {
      type: String,
      default: '',
    },
    password: {
      type: String,
      default: '',
    },
    storeId: {
      type: String,
      default: '',
    },
    pathaoBaseUrl: {
      type: String,
      default: 'https://api-hermes.pathao.com',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CourierSetting', courierSettingSchema);
