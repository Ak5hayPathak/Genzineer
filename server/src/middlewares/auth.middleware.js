import { verifyAccessToken } from "../utils/token.utils.js";
import { findActiveAuthSession } from "../repositories/auth-session.repository.js";
import ApiError from "../utils/ApiError.utils.js";

const authenticate = async (req, res, next) => {
  const accessToken = req.cookies?.accessToken;

  if (!accessToken) {
    throw new ApiError(401, "Authentication required");
  }

  let payload;

  try {
    payload = verifyAccessToken(accessToken);
  } catch {
    throw new ApiError(401, "Invalid or expired access token");
  }

  const { userId, sessionId } = payload;

  if (!userId || !sessionId) {
    throw new ApiError(401, "Invalid access token payload");
  }

  const session = await findActiveAuthSession(sessionId);

  if (!session || session.user_id !== userId) {
    throw new ApiError(401, "Session is invalid or revoked");
  }

  req.user = {
    id: userId,
    sessionId,
  };

  next();
};

export { authenticate };
