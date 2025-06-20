/**
 * User Model Fields
 *
 * name            : string     // Full name of user
 * email           : string     // Unique identifier for login
 * password        : string     // Hashed password
 * role            : string     // 'admin', 'staff', 'supplier', 'driver'
 * phone           : string     // Optional contact info
 * shift           : string[]   // Shift timings like ['Morning', 'Evening']
 * wagePerHour     : number     // Hourly wage
 * hoursThisMonth  : number     // Auto-tracked for payroll
 * extraShift      : boolean    // Flag overworked employees
 * active          : boolean    // Whether user is active or not
 * createdAt       : Date       // Timestamp
 * updatedAt       : Date       // Timestamp
 * 
 */

const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    unique: true,
    select: false,
    sparse: true
  },

  phone: {
    type: String,
    unique: true,
    sparse: true
  },

  password: {
    type: String,
    required: true,
    select: false
  },

  role: {
    type: String,
    enum: ['admin', 'staff', 'supplier', 'driver'],
    default: 'staff'
  },

  shift: {
    type: String,
    enum: ['morning', 'evening', 'night'],
    default: 'morning'
  },

  wagePerHour: {
    type: Number,
    default: 0
  },

  hoursThisMonth: {
    type: Number,
    default: 0
  },

  extraShift: {
    type: Boolean,
    default: false
  },

  active: {
    type: Boolean,
    default: true
  },

  wage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wage'
  }
}, { timestamps: true })

const userModel = mongoose.model('User', userSchema)
module.exports = userModel