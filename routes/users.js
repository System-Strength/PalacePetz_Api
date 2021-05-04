const express = require('express');
const router = express.Router();
const multer = require('multer');
const UsersController = require('../controllers/userController')

//  Register User
router.post('/register', UsersController.RegisterUsers);

// Login User
router.post('/login', UsersController.Login);

// Update Address
router.patch('/update/address/', UsersController.UpdateAddress)

// Update Profile Image
router.patch('/update/profile/image/', UsersController.UpdateProfileImage)

// Update Profile
router.patch('/update/profile', UsersController.UpdateProfile)

module.exports = router