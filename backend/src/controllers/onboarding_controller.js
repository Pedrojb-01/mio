const { completeOnboarding } = require('../services/onboarding_service');

const VALID_VOICE_TONES = ['professional', 'casual', 'inspirational', 'educational', 'humorous'];

async function completeOnboardingController(req, res) {
  try {
    const userId = req.user.id;
    const {
      businessName,
      niche,
      businessDescription,
      differentiators,
      targetAudience,
      platform,
      voiceTone
    } = req.body;

    // Validate required fields
    if (!businessName || !niche) {
      return res.status(400).json({ message: 'Business name and niche are required' });
    }

    // Validate voiceTone enum
    if (voiceTone && !VALID_VOICE_TONES.includes(voiceTone)) {
      return res.status(400).json({ message: 'Invalid voice tone' });
    }

    const profile = await completeOnboarding(userId, {
      businessName,
      niche,
      businessDescription,
      differentiators,
      targetAudience,
      platform,
      voiceTone
    });

    return res.status(201).json({ message: 'Onboarding completed successfully', profile });

  } catch (error) {
    if (error.isAppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = { completeOnboardingController };