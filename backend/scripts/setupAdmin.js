const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const User = require("../models/user");
const Pdf = require("../models/pdf");
const Image = require("../models/image");
const Video = require("../models/video");
const Note = require("../models/note");

const ADMIN_EMAIL = "pocketdesk3@gmail.com";
const ADMIN_PASSWORD = "P0cKetdE${";

const setupAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for migration...");

    // 1. Setup Admin Account
    let admin = await User.findOne({ email: ADMIN_EMAIL });
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    if (admin) {
      console.log("Admin exists. Updating role and password...");
      admin.role = "admin";
      admin.password = hashedPassword;
      admin.isActive = true;
      await admin.save();
    } else {
      console.log("Creating new admin account...");
      admin = await User.create({
        email: ADMIN_EMAIL,
        password: hashedPassword,
        role: "admin",
        isActive: true
      });
    }

    // 2. Ensure all users have isActive=true and role='user' if missing
    await User.updateMany(
      { email: { $ne: ADMIN_EMAIL } }, 
      { $set: { isActive: true, role: "user" } }
    );
    console.log("Users updated.");

    // 3. Backfill sizes for assets
    const models = [
      { name: "Pdf", model: Pdf },
      { name: "Image", model: Image },
      { name: "Video", model: Video },
      { name: "Note", model: Note }
    ];

    for (const { name, model } of models) {
      const docs = await model.find({ size: { $in: [0, null] } });
      console.log(`Backfilling sizes for ${docs.length} ${name} documents...`);
      
      for (const doc of docs) {
        if (doc.filePath && fs.existsSync(doc.filePath)) {
          const stats = fs.statSync(doc.filePath);
          doc.size = stats.size;
          await doc.save();
        } else {
          // If file not found, we can't do much, maybe set a small default or skip
          console.warn(`File not found for ${name} [${doc._id}]: ${doc.filePath}`);
        }
      }
    }

    console.log("Migration completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  }
};

setupAdmin();
