const mongoose = require('mongoose')

const transportationSchema = new mongoose.Schema({
  packageId: {
    type: String,
    required: true
  },

  transportationCost: {
    type: Number,
    default: 0
  },

  totalWeight: {
    type: Number,
    default: 0
  },

  totalVolume: {
    type: Number,
    default: 0
  },

  totalValue: {
    type: Number,
    default: 0
  },

  status: {
    type: String,
    enum: ['pending', 'dispatched', 'inTransit', 'delivered'],
    default: 'pending'
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
      min: 1,
      default: 1
    }
  }],

  startLocation: {
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
  },

  currentLocation: {
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
  },

  destination: {
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
  },

  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },

  eta: {
    type: Date
  },

  transportMode: {
    type: String,
    enum: ['land', 'air', 'ship'],
    default: 'land'
  },
}, { timestamps: true })

const transportationModel = mongoose.model('transportation', transportationSchema)
module.exports = transportationModel