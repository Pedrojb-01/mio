const prisma = require('../utils/prisma');
const AppError = require('../utils/app_error');

// Update user's profile
async function updateProfile(userId, data) {

  // Check if profile exists
  const existingProfile = await prisma.profile.findUnique({
    where: { userId }
  });

  if (!existingProfile) {
    throw new AppError('Profile not found', 404);
  }

  const updatedProfile = await prisma.profile.update({
    where: { userId },
    data
  });

  return updatedProfile;
}

// Get user's profile
async function getProfile(userId) {

  const profile = await prisma.profile.findUnique({
    where: { userId }
  });

  if (!profile) {
    throw new AppError('Profile not found', 404);
  }

  return profile;
}

module.exports = { updateProfile, getProfile };