const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    description: {
        type: String,
        required: true,
    },
    maxGuests: {
        type: Number,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model("Accommodation", schema);
