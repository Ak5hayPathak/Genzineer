import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "15m";
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "7d";

const generateAccessToken = (payload) => {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
    algorithm: "HS256",
    issuer: "genzineer",
    audience: "genzineer-client",
  });
};

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
    algorithm: "HS256",
    issuer: "genzineer",
    audience: "genzineer-client",
  });
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, ACCESS_TOKEN_SECRET, {
    algorithms: ["HS256"],
    issuer: "genzineer",
    audience: "genzineer-client",
  });
};

const verifyRefreshToken = (token, { ignoreExpiration = false } = {}) => {
  return jwt.verify(token, REFRESH_TOKEN_SECRET, {
    algorithms: ["HS256"],
    issuer: "genzineer",
    audience: "genzineer-client",
    ignoreExpiration,
  });
};

export {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
