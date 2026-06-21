const prisma = require('../utils/prisma');

// Update user's profile
async function updateProfile(userId, data) {

  // Check if profile exists
  const existingProfile = await prisma.profile.findUnique({
    where: { userId }
  });

  if (!existingProfile) {
    const error = new Error('Profile not found');
    error.statusCode = 404;
    throw error;
  }

  const updatedProfile = await prisma.profile.update({
    where: { userId },
    data
  });

  return updatedProfile;
}

module.exports = { updateProfile };