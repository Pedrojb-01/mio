const prisma = require('../utils/prisma');
const AppError = require('../utils/app_error');

// Complete onboarding by creating the user's profile
async function completeOnboarding(userId, data) {
  const {
    businessName,
    niche,
    businessDescription,
    differentiators,
    targetAudience,
    platform,
    voiceTone
  } = data;

  // Check if profile already exists
  const existingProfile = await prisma.profile.findUnique({
    where: { userId }
  });

  if (existingProfile) {
    throw new AppError('Onboarding already completed', 409);
  }

  // Create profile with all onboarding data
  const profile = await prisma.profile.create({
    data: {
      userId,
      businessName,
      niche,
      businessDescription,
      differentiators,
      targetAudience,
      platform,
      voiceTone,
      onboardingComplete: true
    }
  });

  return profile;
}

module.exports = { completeOnboarding };