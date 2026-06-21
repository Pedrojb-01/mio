const { updateProfile } = require('../services/profile_service');

const VALID_VOICE_TONES = ['professional', 'casual', 'inspirational', 'educational', 'humorous'];

async function updateProfileController(req, res) {
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

    // Build update object with only provided fields
    const data = {};
    if (businessName !== undefined) data.businessName = businessName;
    if (niche !== undefined) data.niche = niche;
    if (businessDescription !== undefined) data.businessDescription = businessDescription;
    if (differentiators !== undefined) data.differentiators = differentiators;
    if (targetAudience !== undefined) data.targetAudience = targetAudience;
    if (platform !== undefined) data.platform = platform;
    if (voiceTone !== undefined) data.voiceTone = voiceTone;

    // Validate that required fields are not being emptied
    if (data.businessName === '') {
      return res.status(400).json({ message: 'Business name cannot be empty' });
    }
    if (data.niche === '') {
      return res.status(400).json({ message: 'Niche cannot be empty' });
    }

    // Validate voiceTone enum
    if (data.voiceTone && !VALID_VOICE_TONES.includes(data.voiceTone)) {
      return res.status(400).json({ message: 'Invalid voice tone' });
    }

    // Nothing to update
    if (Object.keys(data).length === 0) {
      return res.status(400).json({ message: 'No fields provided for update' });
    }

    const profile = await updateProfile(userId, data);
    return res.status(200).json({ message: 'Profile updated successfully', profile });

  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ message: error.message });
  }
}

module.exports = { updateProfileController };