const express = require("express");
const router = express.Router();

// ℹ️ Handles password encryption
const bcrypt = require("bcrypt");

// ℹ️ Handles password encryption
const jwt = require("jsonwebtoken");

// Require the User model in order to interact with the database
const User = require("../models/User.model");

// Require necessary (isAuthenticated) middleware in order to control access to specific routes
const { isAuthenticated } = require("../middleware/jwt.middleware.js");
const { uploadImage } = require("../middleware/upload");

// How many rounds should bcrypt run the salt (default - 10 rounds)
const saltRounds = 10;

router.post("/signup", uploadImage.single("profileImage"), (req, res, next) => {
  const { email, password, name } = req.body;

  // Check if email, password, or name are empty
  if (!email || !password || !name) {
    return res
      .status(400)
      .json({ message: "Provide email, password, and name." });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Provide a valid email address." });
  }

  // Validate password format
  const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message:
        "Password must have at least 6 characters and contain at least one number, one lowercase, and one uppercase letter.",
    });
  }

  // Check if user already exists
  User.findOne({ email })
    .then((foundUser) => {
      if (foundUser) {
        return res.status(400).json({ message: "User already exists." });
      }

      // Hash the password
      const salt = bcrypt.genSaltSync(saltRounds);
      const hashedPassword = bcrypt.hashSync(password, salt);

      // Get profile image URL from Cloudinary if uploaded
      let profileImageUrl = "";
      if (req.file) {
        // If the profile image is uploaded, the file path will contain the Cloudinary URL
        profileImageUrl = req.file.path;
      }

      // Create user in the database
      return User.create({
        email,
        password: hashedPassword,
        name,
        profileImage: profileImageUrl,
      });
    })
    .then((createdUser) => {
      // Send back user data (excluding password) along with the profile image URL
      const { _id, email, name, profileImage } = createdUser;
      res.status(201).json({
        user: { _id, email, name, profileImage },
        imageUrl: profileImage, // Cloudinary URL here
      });
    })
    .catch((err) => next(err));
});

module.exports = router;

// POST  /auth/login - Verifies email and password and returns a JWT
router.post("/login", (req, res, next) => {
  const { email, password } = req.body;
  console.log("Login request body:", req.body);

  // Check if email or password are provided as empty string
  if (email === "" || password === "") {
    res.status(400).json({ message: "Provide email and password." });
    return;
  }

  // Check the users collection if a user with the same email exists
  User.findOne({ email })
    .then((foundUser) => {
      if (!foundUser) {
        // If the user is not found, send an error response
        res.status(401).json({ message: "User not found." });
        return;
      }

      // Compare the provided password with the one saved in the database
      const passwordCorrect = bcrypt.compareSync(password, foundUser.password);

      if (passwordCorrect) {
        // Deconstruct the user object to omit the password
        const { _id, email, name, profileImage } = foundUser;

        // Create an object that will be set as the token payload
        const payload = { _id, email, name, profileImage };

        // Create a JSON Web Token and sign it
        const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
          algorithm: "HS256",
          expiresIn: "6h",
        });

        // Send the token as the response
        res.status(200).json({ payload,authToken: authToken });
      } else {
        res.status(401).json({ message: "Unable to authenticate the user" });
      }
    })
    .catch((err) => next(err)); // In this case, we send error handling to the error handling middleware.
});

// GET  /auth/verify  -  Used to verify JWT stored on the client
router.get("/verify", isAuthenticated, (req, res, next) => {
  // If JWT token is valid the payload gets decoded by the
  // isAuthenticated middleware and is made available on `req.payload`
  console.log(`req.payload`, req.payload);

  // Send back the token payload object containing the user data
  res.status(200).json(req.payload);
});

module.exports = router;
