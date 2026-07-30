const { completeOnboarding } = require('../services/onboarding_service');
const { validateRequiredString, validateOptionalString } = require('../utils/validate');

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
      voiceTone
    } = req.body;

    // Validate required fields
    const businessNameError = validateRequiredString(businessName, 'Business name', 64);
    const nicheError        = validateRequiredString(niche,         'Niche',         64);
    if (businessNameError) return res.status(400).json({ message: businessNameError });
    if (nicheError)        return res.status(400).json({ message: nicheError });

    // Validate optional text fields
    const descError   = validateOptionalString(businessDescription, 'Business description', 500);
    const diffError   = validateOptionalString(differentiators,     'Differentiators',      500);
    const audError    = validateOptionalString(targetAudience,      'Target audience',      500);
    if (descError)  return res.status(400).json({ message: descError });
    if (diffError)  return res.status(400).json({ message: diffError });
    if (audError)   return res.status(400).json({ message: audError });

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