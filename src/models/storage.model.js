/**
 * Imp Things
 * 
 * length, width, height -> Cm,
 * locationId: can Add like A1, A2.. etc
 * holdingCapacity -> Kgs
 * currentVolume : cm3
 */

const mongoose = require("mongoose")

const storageSchema = new mongoose.Schema({
  locationId: {
    type: String,
    required: true,
    unique: true
  },

  dimensions: {
    length: { type: Number, default: 0 },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 }
  },

  holdingCapacity: {
    type: Number,
    default: 0
  },

  capacityOccupied: {
    type: Number,
    default: 0
  },

  Volume: {
    type: Number,
    default: 0
  },

  VolumeOccupied: {
    type: Number,
    default: 0
  },

  totalCost: {
    type: Number,
    default: 0
  },

  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    }
  }],

  inventory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Inventory"
  }
}, { timestamps: true })

const StorageModel = mongoose.model("Storage", storageSchema)

module.exports = StorageModel
