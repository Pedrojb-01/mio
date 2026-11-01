const prisma = require('../utils/prisma');
const AppError = require('../utils/app_error');

async function completeOnboarding(userId, data) {
  const {
    businessName,
    niche,
    businessDescription,
    differentiators,
    targetAudience,
    voiceTone
  } = data;

  const existingProfile = await prisma.profile.findUnique({
    where: { userId }
  });

  if (existingProfile) {
    throw new AppError('Onboarding already completed', 409);
  }

  const profile = await prisma.profile.create({
    data: {
      userId,
      businessName,
      niche,
      businessDescription,
      differentiators,
      targetAudience,
      voiceTone,
      onboardingComplete: true
    }
  });

  return profile;
}

module.exports = { completeOnboarding };