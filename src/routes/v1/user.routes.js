/**
 * User Management
 * 
 * POST   /api/v1/users/register         Register a new user
 * POST   /api/v1/users/login            Login & get JWT token
 * POST   /api/v1/users/logout           Logout a user
 * GET    /api/v1/users/me               Get current user info
 * GET    /api/v1/users/                 List all users
 * PUT    /api/v1/users/                 Update user's profile
 * PUT    /api/v1/users/update_password  Update password
 * PUT    /api/v1/users/:id              (Admin) Update user role/shift
 * DELETE /api/v1/users/:id              (Admin) Delete a user
 * 
 */

const express = require('express')

const { userController } = require('../../controllers')
const validator = require('../../validators/zod.validator')
const userValidators = require('../../dto/user.dto')
const { authMiddleware, adminMiddleware } = require('../../middlewares')

const userRouter = express.Router()

userRouter.post('/register', validator(userValidators.createUserSchema), userController.register)
userRouter.post('/login', validator(userValidators.loginUserSchema), userController.login)
userRouter.post('/logout', authMiddleware, userController.logout)
userRouter.get('/me', authMiddleware, userController.getUser)
userRouter.get('/', userController.getAllUsers)
userRouter.put('/', authMiddleware, validator(userValidators.updateUserSchema), userController.updateProfile)
userRouter.put('/update_password', authMiddleware, validator(userValidators.passwordSchema), userController.updatePassword)
userRouter.put('/:id', adminMiddleware, validator(userValidators.adminUserUpdateSchema), userController.ADupdateProfile)  // ADMIN
userRouter.delete('/:id', adminMiddleware, userController.ADdeleteProfile) // ADMIN

module.exports = userRouter