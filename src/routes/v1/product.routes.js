/**
 * Product Management
 * 
 * POST   /api/v1/products/                  Create a new product
 * GET    /api/v1/products/                  Get all products
 * GET    /api/v1/products/needsRestock      Get products needing restock
 * GET    /api/v1/products/category/:category Get products by category
 * GET    /api/v1/products/supplier/:supplierId Get products by supplier
 * GET    /api/v1/products/:id               Get single product
 * PUT    /api/v1/products/:id               Update product details
 * DELETE /api/v1/products/:id               (Admin) Delete a product
 * 
 */

const express = require('express')

const adminMiddleware = require('../../middlewares/auth.admin.middleware')
const validator = require('../../validators/zod.validator')
const { productController } = require('../../controllers')
const { productDto } = require('../../dto')
const authMiddleware = require('../../middlewares/auth.middleware')

const productRouter = express.Router()

productRouter.post('/', authMiddleware, validator(productDto.createProductSchema), productController.createProduct)
productRouter.get('/', productController.getAllProducts)
productRouter.get('/needsRestock', authMiddleware, productController.getProductsNeedingRestock)
productRouter.get('/category/:category', productController.getProductsByCategory)
productRouter.get('/supplier/:supplierId', productController.getProductsBySupplier)
productRouter.get('/:id', productController.getProduct)
productRouter.put('/:id', authMiddleware, validator(productDto.updateProductSchema), productController.updateProduct)
productRouter.delete('/:id', adminMiddleware, productController.deleteProduct)

module.exports = productRouter