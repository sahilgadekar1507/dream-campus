const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
  image: {
    type: [String],
    required: true,
  },
  code: {
    type: Number,
    required: true,
    mex: 999999,
  },
  exam: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: [true, "College name is required"],
    trim: true,
  },
  location: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  cutoff: {
    type: Number,
    required: true,
  },
  accreditation: {
    type: String,
    required: true,
  },
  fees: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  establishedYear: {
    type: Number,
    required: true,
    max: 9999,
  },
  affiliation: {
    type: String,
    required: true,
  },
  // courses: [
  //     {
  //         name: String,
  //         duration: Number,
  //         eligibility: String,
  //         fees: Number,
  //         entranceExam: String,
  //         cutoff: Number
  //     }
  // ],
  // applicationDeadline: Date,
  // admissionProcedure: String,
  // hostelAvailable: Boolean,
  placementRate: {
    type: Number,
    required: true,
  },
  // scholarships: [String],

  phoneNumber: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  website: {
    type: String,
    required: true,
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  }
});

listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
