const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { reviewSchema } = require("../schema.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");

// Middleware to validate review input
const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

// POST a new review
router.post(
  "/",
  validateReview,
  wrapAsync(async (req, res) => {
    const { id } = req.params;

    // Check if listing exists
    const listing = await Listing.findById(id);
    if (!listing) {
      throw new ExpressError(404, "Listing not found!");
    }

    // Create and save new review
    const newReview = new Review(req.body.review);
    await newReview.save();

    // Update listing by pushing review ID
    await Listing.findByIdAndUpdate(id, {
      $push: { reviews: newReview._id },
    });
    req.flash("success", "New Review Created");
    res.redirect(`/listings/${id}`);
  })
);

// DELETE a review
router.delete(
  "/:reviewId",
  wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;

    // Pull review reference from listing
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

    // Delete review document
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "New Review Deleted");
    res.redirect(`/listings/${id}`);
  })
);

module.exports = router;
