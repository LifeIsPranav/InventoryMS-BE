/**
 * Inventory Model Fields
 * Inventory Price -> Cost Price
 */

const mongoose = require("mongoose")

const inventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    }
  }],

  costPrice: {
    type: Number,
    default: 0
  },

  totalCapacity: {
    type: Number,
    default: 0
  },

  capacityOccupied: {
    type: Number,
    default: 0
  },

  totalVolume: {
    type: Number,
    default: 0
  },

  volumeOccupied: {
    type: Number,
    default: 0
  },

  storage: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Storage',
      default: null
    }
  ],

  inventoryLocation: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  }
}, { timestamps: true })

const inventoryModel = mongoose.model('Inventory', inventorySchema)
module.exports = inventoryModel