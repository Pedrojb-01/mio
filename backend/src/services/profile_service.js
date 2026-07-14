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

// Get user and profile
async function getProfileWithUser(userId) {
  const [user, profile] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true }
    }),
    prisma.profile.findUnique({
      where: { userId }
    })
  ]);

  return {
    id:      user.id,
    name:    user.name,
    email:   user.email,
    role:    user.role,
    profile: profile ?? null,
  };
}

module.exports = { getProfileWithUser, updateProfile };