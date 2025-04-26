const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const Notification = require("../models/notification.js");
const mongoose = require("mongoose");
const isLoggedIn = require("../middleware.js");

const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

// Index Route
router.get(
  "/",
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
  })
);

// New route to add colleges
router.get("/new", isLoggedIn, (req, res) => {
  res.render("listings/new.ejs");
});

// Notifications route
router.get(
  "/notification",
  wrapAsync(async (req, res) => {
    try {
      const notifications = await Notification.find().sort({ date: -1 });
      res.render("listings/notification", { notifications });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).send("Internal Server Error");
    }
  })
);

// Admission Information Route
router.get("/admission", (req, res) => {
  res.render("listings/admission");
});

// Contact Information Route
router.get("/contact", (req, res) => {
  res.render("listings/contact");
});

// Home Route — placed BEFORE ":id" to avoid conflict
router.get("/home", (req, res) => {
  res.render("listings/home");
});

// Search Route
router.get(
  "/search",
  wrapAsync(async (req, res) => {
      const { query } = req.query; // Get the search query from the request
      try {
          let results;
          // Check if the query is a number (for code search) or a string (for name/location)
          if (!isNaN(query)) {
              results = await Listing.find({ code: query }); // Search by code (exact match)
          } else {
              results = await Listing.find({
                  $or: [
                      { name: { $regex: query, $options: "i" } }, // Case-insensitive search on name
                      { location: { $regex: query, $options: "i" } }, // Case-insensitive search on location
                  ],
              });
          }
          res.render("listings/index", { allListings: results }); // Render the index page with search results
      } catch (error) {
          console.error("Error during search:", error);
          res.status(500).send("An error occurred while searching.");
      }
  })
);

// // Search Route
// router.get(
//   "/search",
//   wrapAsync(async (req, res) => {
//       const { query } = req.query; // Get the search query from the request
//       try {
//           const results = await Listing.find({
//                   name: { $regex: query, $options: "i" } // Case-insensitive search on name
//           });
//           res.render("listings/index", { allListings: results }); // Render the index page with search results
//       } catch (error) {
//           console.error("Error during search:", error);
//           res.status(500).send("An error occurred while searching.");
//       }
//   })
// );


// // Search Route
// router.get(
//   "/search",
//   wrapAsync(async (req, res) => {
//       const { query } = req.query; // Get the search query from the request
//       try {
//           let results;
//           // Check if the query is a number (for code search) or a string (for name/location)
//           if (!isNaN(query)) {
//               results = await Listing.find({ code: query }); // Search by code (exact match)
//           } else {
//               results = await Listing.find({                    $or: [                        { name: { $regex: query, $options: "i" } }, // Case-insensitive search on name
//                       { location: { $regex: query, $options: "i" } }, // Case-insensitive search on location
//                   ],
//               });
//           }
//           res.render("listings/index", { allListings: results }); // Render the index page with search results
//       } catch (error) {
//           console.error("Error during search:", error);
//           res.status(500).send("An error occurred while searching.");
//       }
//   })
// );

// Create Route
router.post(
  "/",
  isLoggedIn,
  validateListing,
  wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "New Listing Created");
    res.redirect("/listings");
  })
);

// Edit route
router.get(
  "/:id/edit",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing you requested for does not exist!");
      res.redirect("/listings");
    }
    res.render("listings/edit", { listing });
  })
);

// Update Route
router.put(
  "/:id",
  isLoggedIn,
  validateListing,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing.owner._id.equals(res.locals.currentUser._id)) {
      req.flash("error", "you don't have permission to edit!");
      return res.redirect(`/listings/${id}`);
    }
    try {
      const updatedListing = await Listing.findByIdAndUpdate(
        id,
        req.body.listing,
        { new: true }
      );

      if (!updatedListing) {
        return res.status(404).send("Listing not found!");
      }
      req.flash("success", "Listing Updated!");
      res.redirect("/listings");
    } catch (error) {
      console.error("Error updating listing:", error);
      res.status(500).send("Something went wrong!");
    }
  })
);

// Delete Route
router.delete(
  "/:id",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    try {
      await Listing.findByIdAndDelete(id);
      req.flash("success", "Listing Deleted!");
      res.redirect("/listings");
    } catch (error) {
      console.error("Error deleting listing:", error);
      res.status(500).send("Something went wrong!");
    }
  })
);

// College info show route — placed LAST to avoid conflicts
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    // console.log("ID from params:", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      req.flash("error", "Invalid Listing ID!");
      return res.redirect("/listings");
    }

    const listing = await Listing.findById(id)
      .populate("reviews")
      .populate("owner");
    if (!listing) {
      req.flash("error", "Listing you requested for does not exist!");
      return res.redirect("/listings");
    }
    res.render("listings/show", { listing });
  })
);

module.exports = router;
