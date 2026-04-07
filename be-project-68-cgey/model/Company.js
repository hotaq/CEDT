const mongoose = require("mongoose");

const CompanySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please add a company name"],
            unique: true,
            trim: true,
            maxlength: [50, "Name cannot be more than 50 characters"],
        },
        address: {
            type: String,
            required: [true, "Please add an address"],
        },
        website: {
            type: String,
            required: [true, "Please add a website"],
            match: [
                /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
                "Please use a valid URL with HTTP or HTTPS",
            ],
        },
        photoUrl: {
            type: String,
            match: [
                /^$|https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
                "Please use a valid photo URL with HTTP or HTTPS",
            ],
            default: "",
        },
        description: {
            type: String,
            required: [true, "Please add a description"],
            maxlength: [500, "Description cannot be more than 500 characters"],
        },
        telephone: {
            type: String,
            required: [true, "Please add a telephone number"],
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

CompanySchema.virtual("bookings", {
    ref: "Booking",
    localField: "_id",
    foreignField: "company",
    justOne: false,
});

CompanySchema.virtual("reviews", {
    ref: "Review",
    localField: "_id",
    foreignField: "company",
    justOne: false,
});

CompanySchema.virtual("jobs", {
    ref: "Job",
    localField: "_id",
    foreignField: "company",
    justOne: false,
});

module.exports = mongoose.model("Company", CompanySchema);
