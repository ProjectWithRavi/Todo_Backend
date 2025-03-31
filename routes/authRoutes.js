const express = require("express");
const { check } = require("express-validator");
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Register User
router.post(
  "/register",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists(),
    check("state", "State is required").not().isEmpty(), // Validation for state
  ],
  authController.register
);

// Login User
router.post(
  "/login",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  authController.login
);

// Route to upload profile image
router.post(
  "/uploadProfileImage",
  authMiddleware,
  authController.uploadProfileImage
);

// Protected Profile Route
router.get("/profile", authMiddleware, authController.getProfile); // Delegating profile logic to controller

router.get("/profile/name", authMiddleware, authController.getUserName);

module.exports = router;
