const express = require("express");
const router = express.Router();
const Notification = require("../models/notification"); // Adjust this import as per your file structure

// Fetch and render notifications
router.get("/", async (req, res) => {
  try {
    // Fetch notifications from the database and sort by date in descending order
    const notifications = await Notification.find().sort({ date: -1 });

    // Render the notifications on the notification.ejs page
    res.render("listings/notification", { notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
