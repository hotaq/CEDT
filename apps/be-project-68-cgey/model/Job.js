const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Please add a job title"],
        trim: true,
        maxlength: [100, "Title cannot be more than 100 characters"],
    },
    company: {
        type: mongoose.Schema.ObjectId,
        ref: "Company",
        required: true,
    },
    description: {
        type: String,
        required: [true, "Please add a description"],
        maxlength: [2000, "Description cannot be more than 2000 characters"],
    },
    skills: [
        {
            type: String,
            trim: true,
        },
    ],
    jobType: {
        type: String,
        required: [true, "Please add a job type"],
        trim: true,
    },
    isRemote: {
        type: Boolean,
        default: false,
    },
    salaryMin: {
        type: Number,
        min: [0, "Minimum salary cannot be negative"],
    },
    salaryMax: {
        type: Number,
        min: [0, "Maximum salary cannot be negative"],
    },
    location: {
        type: String,
        required: [true, "Please add a location"],
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Job", JobSchema);
