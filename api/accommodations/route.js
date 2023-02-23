const express = require("express"),
    createHttpError = require("http-errors"),
    router = express.Router();
const {
    createAccessToken,
    createRefreshToken,
    verifyAccessToken,
    verifyGuest,
    verifyHost,
    verifyRefreshToken,
    verifyLoggedIn,
    verifyLoggedOut,
} = require("../../jwt");
const Accommodation = require("./model");

router.get("/", verifyAccessToken, verifyLoggedIn, async (req, res, next) => {
    try {
        const accommodations = await Accommodation.find();
        res.send(accommodations);
    } catch (err) {
        next(err);
    }
});

router.get(
    "/:id",
    verifyAccessToken,
    verifyLoggedIn,
    async (req, res, next) => {
        try {
            const accommodation = await Accommodation.findById(req.params.id);
            if (!accommodation) {
                throw createHttpError(404, "Accommodation not found");
            }
            res.send(accommodation);
        } catch (err) {
            next(err);
        }
    }
);

router.post(
    "/",
    verifyAccessToken,
    verifyLoggedIn,
    verifyHost,
    async (req, res, next) => {
        try {
            const accommodation = new Accommodation(req.body);
            accommodation.host = req.user._id;
            const savedAccommodation = await accommodation.save();
            res.send(savedAccommodation);
        } catch (err) {
            next(err);
        }
    }
);

router.put(
    "/:id",
    verifyAccessToken,
    verifyLoggedIn,
    verifyHost,

    async (req, res, next) => {
        try {
            const accommodation = await Accommodation.findById(req.params.id);
            if (!accommodation) {
                throw createHttpError(404, "Accommodation not found");
            }
            if (accommodation.host.toString() !== req.user._id.toString()) {
                throw createHttpError(403, "Unauthorized");
            }
            Object.assign(accommodation, req.body);
            const savedAccommodation = await accommodation.save();
            res.send(savedAccommodation);
        } catch (err) {
            next(err);
        }
    }
);

router.delete(
    "/:id",
    verifyAccessToken,
    verifyLoggedIn,
    verifyHost,
    async (req, res, next) => {
        try {
            const accommodation = await Accommodation.findById(req.params.id);
            if (!accommodation) {
                throw createHttpError(404, "Accommodation not found");
            }
            if (accommodation.host.toString() !== req.user._id.toString()) {
                throw createHttpError(403, "Unauthorized");
            }
            await accommodation.delete();

            res.send("Accommodation deleted");
        } catch (err) {
            next(err);
        }
    }
);

module.exports = router;
