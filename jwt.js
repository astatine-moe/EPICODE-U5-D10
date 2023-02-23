const jwt = require("jsonwebtoken");
const User = require("./api/user/model");

const accessSecret = process.env.JWT_TOKEN;
const refreshSecret = process.env.JWT_REFRESH_TOKEN;

module.exports = {
    createAccessToken: (user) => {
        return new Promise((resolve, reject) => {
            const payload = {
                id: user._id,
                email: user.email,
                role: user.role,
            };
            jwt.sign(
                payload,
                accessSecret,
                { expiresIn: "15m" },
                (err, token) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(token);
                }
            );
        });
    },
    createRefreshToken: (user) => {
        return new Promise((resolve, reject) => {
            const payload = {
                id: user._id,
                email: user.email,
                role: user.role,
            };
            jwt.sign(
                payload,
                refreshSecret,
                { expiresIn: "7d" },
                (err, token) => {
                    if (err) {
                        reject(err);
                    }
                    user.refreshToken = token;
                    user.save();
                    resolve(token);
                }
            );
        });
    },
    verifyRefreshToken: (refreshToken) => {
        return new Promise((resolve, reject) => {
            jwt.verify(refreshToken, refreshSecret, (err, payload) => {
                if (err) {
                    return reject(err);
                }
                const userId = payload.id;
                User.findById(userId).then((user) => {
                    if (!user) {
                        return reject(createHttpError(404, "User not found"));
                    }
                    if (user.refreshToken !== refreshToken) {
                        return reject(
                            createHttpError(404, "Refresh token is not valid")
                        );
                    }
                    const accessToken = createAccessToken(user);
                    resolve({ accessToken });
                });
            });
        });
    },

    verifyAccessToken: (req, res, next) => {
        if (!req.headers["authorization"]) {
            return next(createHttpError(401));
        }
        const authHeader = req.headers["authorization"];
        const bearerToken = authHeader.split(" ");
        const token = bearerToken[1];
        jwt.verify(token, accessSecret, (err, payload) => {
            if (err) {
                const message =
                    err.name === "JsonWebTokenError"
                        ? "Unauthorized"
                        : err.message;
                return next(createHttpError.Unauthorized(message));
            }
            req.payload = payload;
            next();
        });
    },

    verifyHost: (req, res, next) => {
        if (req.payload.role !== "host") {
            return next(createHttpError.Unauthorized());
        }
        next();
    },

    verifyGuest: (req, res, next) => {
        if (req.payload.role !== "guest") {
            return next(createHttpError.Unauthorized());
        }
        next();
    },

    verifyLoggedIn: (req, res, next) => {
        if (!req.payload) {
            return next(createHttpError.Unauthorized());
        }
        next();
    },

    verifyLoggedOut: (req, res, next) => {
        if (req.payload) {
            return next(createHttpError.Unauthorized());
        }
        next();
    },
};
