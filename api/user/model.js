const mongoose = require("mongoose");
const argon2 = require("argon2");

const schema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["host", "guest"],
    },
    refreshToken: {
        type: String,
    },
    accessToken: {
        type: String,
    },
});

schema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }

    try {
        const hash = await argon2.hash(this.password);
        this.password = hash;
        next();
    } catch (err) {
        next(err);
    }
});

schema.methods.comparePassword = async function (password) {
    try {
        const isMatch = await argon2.verify(this.password, password);
        return isMatch;
    } catch (err) {
        return false;
    }
};

schema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    delete obj.refreshToken;
    delete obj.accessToken;
    delete user.__v;
    return obj;
};

module.exports = mongoose.model("User", schema);
