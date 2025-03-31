const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { validationResult } = require("express-validator");
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const fs = require("fs");
const { log } = require("console");

// Register a new user
exports.register = async (req, res) => {
  const { name, email, password, state } = req.body;

  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Check if the user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // // Hash the password
    // const salt = await bcrypt.genSalt(10);
    // const hashedPassword = await bcrypt.hash(password, salt);
    // console.log(password, hashedPassword, "gen pass");

    //*****************  hash password create in user modal and add in password automatic

    // Create a new user
    user = new User({
      name,
      email,
      password,
      state, // Include state when creating the user
    });

    console.log(user, "user after register");

    // Save the user to the database
    await user.save();

    // Create and return a JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Login User
exports.login = async (req, res) => {
  const { email, password } = req.body;
  console.log(password);
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: "Invalid Email" });
    }

    // ************ this comparePassword method get from the user modal
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid Password" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Return the token
    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Get Profile (Protected Route)
exports.getProfile = async (req, res) => {
  try {
    // Find user by the ID stored in the JWT
    const user = await User.findById(req.user).select("-password"); // Don't send password back

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Return the user's profile
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

exports.getUserName = async (req, res) => {
  try {
    // Find user by ID (extracted from the JWT token)
    const user = await User.findById(req.user).select("-password"); // Only return the name

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Return the user's name
    res.json({ name: user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// *************************************** image controller ************************************

// Function to generate file hash
const generateFileHash = (file) => {
  const hash = crypto.createHash("md5"); // Using MD5 hash algorithm (you can use other algorithms like sha256)
  hash.update(file.buffer); // `file.buffer` contains the file's binary data
  return hash.digest("hex");
};

// Set up Multer storage configuration (using memoryStorage to store the file in memory)
const storage = multer.memoryStorage();

// Initialize multer with the storage configuration
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb("Error: Only image files are allowed!");
    }
  },
});

// Route to upload profile image
exports.uploadProfileImage = [
  upload.single("profileImage"), // Field name in the form is "profileImage"
  async (req, res) => {
    try {
      // Find the user by ID (req.user is set by the JWT middleware)
      const user = await User.findById(req.user);

      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }

      // Generate file hash based on the content of the file
      const fileHash = generateFileHash(req.file);
      const fileExtension = path.extname(req.file.originalname); // Get file extension (e.g., .jpg)

      // Define the upload directory
      const uploadDir = path.join(__dirname, "..", "uploads");

      // Check if the file already exists in the upload folder
      const existingFile = fs.existsSync(
        path.join(uploadDir, `${fileHash}${fileExtension}`)
      );

      let filename;

      if (existingFile) {
        // If the file already exists, reuse the existing file
        filename = `${fileHash}${fileExtension}`;
      } else {
        // If it's a new file, save it with the generated hash name
        filename = `${fileHash}${fileExtension}`;
        // Write the file to the disk
        fs.writeFileSync(path.join(uploadDir, filename), req.file.buffer);
      }

      // Save the image URL (relative path) in the user's profile
      user.profileImage = `/uploads/${filename}`;
      await user.save();

      // Send the image URL as response
      res.json({
        msg: "Profile image uploaded successfully",
        imageUrl: user.profileImage,
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  },
];
