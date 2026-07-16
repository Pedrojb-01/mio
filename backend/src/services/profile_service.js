const prisma = require('../utils/prisma');
const AppError = require('../utils/app_error');

// Update user's profile
async function updateProfile(userId, { name, ...profileData }) {
  const existingProfile = await prisma.profile.findUnique({
    where: { userId }
  });

  if (!existingProfile) {
    throw new AppError('Profile not found', 404);
  }

  const [updatedProfile] = await Promise.all([
    prisma.profile.update({
      where: { userId },
      data: profileData
    }),
    name !== undefined
      ? prisma.user.update({ where: { id: userId }, data: { name } })
      : Promise.resolve()
  ]);

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