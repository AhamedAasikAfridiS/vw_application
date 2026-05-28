const { ApiError } = require("../utils/apiError");
const { hashPassword, comparePassword } = require("../utils/password");
const { hashToken } = require("../utils/tokenHash");
const { USER_ROLES, toPublicUser } = require("../models/userModel");
const userRepository = require("../repositories/userRepository");
const refreshTokenRepository = require("../repositories/refreshTokenRepository");
const tokenService = require("./tokenService");

async function issueTokens(user) {
  const accessToken = tokenService.signAccessToken(user);
  const refreshToken = tokenService.signRefreshToken(user);
  await refreshTokenRepository.createRefreshToken({
    userId: user.id,
    tokenHash: hashToken(refreshToken),
    expiresAt: tokenService.getRefreshExpiryDate()
  });

  return { accessToken, refreshToken };
}

async function register({ name, email, password, role = USER_ROLES.USER }) {
  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    throw new ApiError(409, "An account with this email already exists.");
  }

  const passwordHash = await hashPassword(password);
  const user = await userRepository.createUser({ name, email, passwordHash, role });
  const tokens = await issueTokens(user);

  return { user: toPublicUser(user), ...tokens };
}

async function login({ email, password }) {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const passwordMatches = await comparePassword(password, user.password_hash);
  if (!passwordMatches) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const tokens = await issueTokens(user);
  return { user: toPublicUser(user), ...tokens };
}

async function refresh(refreshToken) {
  let payload;
  try {
    payload = tokenService.verifyRefreshToken(refreshToken);
  } catch (_error) {
    throw new ApiError(401, "Invalid refresh token.");
  }

  const tokenRecord = await refreshTokenRepository.findActiveByHash(hashToken(refreshToken));
  if (!tokenRecord) {
    throw new ApiError(401, "Refresh token has expired or was revoked.");
  }

  const user = await userRepository.findById(payload.sub);
  if (!user) {
    throw new ApiError(401, "Refresh token user no longer exists.");
  }

  const accessToken = tokenService.signAccessToken(user);
  return { user: toPublicUser(user), accessToken };
}

async function logout(refreshToken) {
  if (refreshToken) {
    await refreshTokenRepository.revokeByHash(hashToken(refreshToken));
  }
}

async function getMe(userId) {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found.");
  }
  return toPublicUser(user);
}

module.exports = { register, login, refresh, logout, getMe };
