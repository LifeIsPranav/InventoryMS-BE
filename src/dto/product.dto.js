const { z } = require('zod')

const createProductSchema = z.object({
  productName: z.string().min(3).max(40),
  batchId: z.string().min(2).max(20).optional(),
  productCategory: z.string().optional(),
  price: z.number(),
  quantity: z.number().nonnegative().optional(),
  weight: z.number().optional(),
  dimensions: z.object({ 
    length: z.number(), 
    width: z.number(), 
    height: z.number()
  }).optional(),
  description: z.string().optional(),
  thresholdLimit: z.number().optional(),
  shelfLifeDays: z.number().optional(),
  mfgDate: z.preprocess(arg => new Date(arg), z.date()).optional(),
  expiryDate: z.preprocess(arg => new Date(arg), z.date()).optional(),
  supplierId: z.string().optional(),
  supplierLocation: z.object({
    type: z.literal('Point'),
    coordinates: z.array(z.number()).length(2, { message: "Coordinates must be an array of two numbers: [longitude, latitude]" })
  }).optional()
}).strict()

const updateProductSchema = createProductSchema.partial().extend({
  quantity: z.number().nonnegative().optional()
})

module.exports = {
  createProductSchema,
  updateProductSchema
}