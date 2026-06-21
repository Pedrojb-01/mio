const prisma = require('../utils/prisma');

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
    const error = new Error('Onboarding already completed');
    error.statusCode = 409;
    throw error;
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