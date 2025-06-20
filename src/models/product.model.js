const mongoose = require("mongoose")

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true
  },

  batchId: {
    type: String
  },

  productCategory: {
    type: String,
  },

  sku: {
    type: String
  },

  price: {
    type: Number,
    default: 0
  },

  quantity: {
    type: Number,
    default: 0
  },

  weight: {
    type: Number,
    default: 0
  },

  dimensions: {
    length: { type: Number, default: 0 },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 }
  },

  description: {
    type: String
  },

  thresholdLimit: {
    type: Number,
    default: 0
  },

  restockRecommended: {
    type: Boolean,
    default: false
  },

  storage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Storage"
  },

  shelfLifeDays: {
    type: Number,
    default: 0
  },

  mfgDate: {
    type: Date
  },

  expiryDate: {
    type: Date
  },

  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  supplierLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number]
    }
  }

}, { timestamps: true })

productSchema.pre('save', function (next) {
  this.sku = this._id.toString()
  next()
})

const ProductModel = mongoose.model("Product", productSchema)
module.exports = ProductModel