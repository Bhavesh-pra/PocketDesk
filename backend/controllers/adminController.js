const User = require("../models/user");
const Pdf = require("../models/pdf");
const Image = require("../models/image");
const Video = require("../models/video");
const Note = require("../models/note");

// List all users
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    
    // Enrich with asset counts (simplified for now)
    const enrichedUsers = await Promise.all(users.map(async (user) => {
      const pdfCount = await Pdf.countDocuments({ userId: user._id });
      const imageCount = await Image.countDocuments({ userId: user._id });
      const videoCount = await Video.countDocuments({ userId: user._id });
      const noteCount = await Note.countDocuments({ userId: user._id });
      
      return {
        ...user.toObject(),
        assetCount: pdfCount + imageCount + videoCount + noteCount
      };
    }));

    res.json(enrichedUsers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

// Toggle user active status
const toggleUserActive = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    // Don't allow deactivating self
    if (user._id.toString() === req.userId) {
      return res.status(400).json({ message: "You cannot deactivate yourself" });
    }

    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}`, isActive: user.isActive });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
};

// Get Global Metrics
const getMetrics = async (req, res) => {
  try {
    // 1. Total Stats
    const totalUsers = await User.countDocuments();
    
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const activeUsers = await User.countDocuments({ lastLogin: { $gte: thirtyDaysAgo } });

    // 2. Storage aggregation
    const pdfStorage = await Pdf.aggregate([{ $group: { _id: null, total: { $sum: "$size" } } }]);
    const imageStorage = await Image.aggregate([{ $group: { _id: null, total: { $sum: "$size" } } }]);
    const videoStorage = await Video.aggregate([{ $group: { _id: null, total: { $sum: "$size" } } }]);
    const noteStorage = await Note.aggregate([{ $group: { _id: null, total: { $sum: "$size" } } }]);

    const totalStorage = (pdfStorage[0]?.total || 0) + (imageStorage[0]?.total || 0) + 
                         (videoStorage[0]?.total || 0) + (noteStorage[0]?.total || 0);

    // 3. Signup Trends (last 7 days)
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const signups = await User.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
      }},
      { $sort: { "_id": 1 } }
    ]);

    // 4. Content Distribution
    const distribution = [
      { name: "PDFs", value: await Pdf.countDocuments() },
      { name: "Images", value: await Image.countDocuments() },
      { name: "Videos", value: await Video.countDocuments() },
      { name: "Notes", value: await Note.countDocuments() }
    ];

    res.json({
      totalUsers,
      activeUsers,
      totalStorage,
      signups,
      distribution
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch metrics" });
  }
};

module.exports = {
  getUsers,
  toggleUserActive,
  getMetrics
};
