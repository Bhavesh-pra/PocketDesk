const express = require("express");
const router = express.Router();
const Subscriber = require("../models/subscriber");
const { isValidEmail, errorResponse } = require("../middleware/validationMiddleware");

router.post("/", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return errorResponse(res, 400, "Email is required");
    }
    if (!isValidEmail(email)) {
      return errorResponse(res, 400, "Invalid email format");
    }

    const trimmedEmail = email.toLowerCase().trim();

    // Check if already subscribed
    const existing = await Subscriber.findOne({ email: trimmedEmail });
    if (existing) {
      return res.status(200).json({ 
        message: "You are already subscribed to our newsletter!",
        alreadySubscribed: true 
      });
    }

    const subscriber = new Subscriber({ email: trimmedEmail });
    await subscriber.save();

    res.status(201).json({ 
      message: "Successfully subscribed to the newsletter!",
      alreadySubscribed: false 
    });
  } catch (error) {
    console.error("Subscription error: ", error);
    errorResponse(res, 500, "Failed to subscribe");
  }
});

module.exports = router;
