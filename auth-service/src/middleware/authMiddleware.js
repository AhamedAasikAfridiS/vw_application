const { ApiError } = require("../utils/apiError");
const tokenService = require("../services/tokenService");

function authenticate(req, _res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return next(new ApiError(401, "Authorization bearer token is required."));
  }

  try {
    req.user = tokenService.verifyAccessToken(token);
    return next();
  } catch (_error) {
    return next(new ApiError(401, "Invalid or expired access token."));
  }
}

function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, "You do not have permission to access this resource."));
    }
    return next();
  };
}

module.exports = { authenticate, requireRole };
