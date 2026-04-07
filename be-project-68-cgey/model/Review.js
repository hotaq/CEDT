const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, "Please add a rating between 1 and 5"],
    },
    comment: {
        type: String,
        required: false,
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },
    company: {
        type: mongoose.Schema.ObjectId,
        ref: "Company",
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Prevent user from submitting more than one review per company
ReviewSchema.index({ company: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("Review", ReviewSchema);
