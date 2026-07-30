const { getProfileWithUser, updateProfile } = require('../services/profile_service');
const { validateRequiredString, validateOptionalString } = require('../utils/validate');

const VALID_VOICE_TONES = ['professional', 'casual', 'inspirational', 'educational', 'humorous'];

async function updateProfileController(req, res) {
  try {
    const userId = req.user.id;
    const {
      name,
      businessName,
      niche,
      businessDescription,
      differentiators,
      targetAudience,
      voiceTone
    } = req.body;

    // Build update object with only provided fields
    const data = {};
    if (name !== undefined) data.name = name;
    if (businessName !== undefined) data.businessName = businessName;
    if (niche !== undefined) data.niche = niche;
    if (businessDescription !== undefined) data.businessDescription = businessDescription;
    if (differentiators !== undefined) data.differentiators = differentiators;
    if (targetAudience !== undefined) data.targetAudience = targetAudience;
    if (voiceTone !== undefined) data.voiceTone = voiceTone;

    // Validate fields that were provided
    if (data.name !== undefined) {
      const err = validateRequiredString(data.name, 'Name', 64);
      if (err) return res.status(400).json({ message: err });
    }
    if (data.businessName !== undefined) {
      const err = validateRequiredString(data.businessName, 'Business name', 64);
      if (err) return res.status(400).json({ message: err });
    }
    if (data.niche !== undefined) {
      const err = validateRequiredString(data.niche, 'Niche', 64);
      if (err) return res.status(400).json({ message: err });
    }
    if (data.businessDescription !== undefined) {
      const err = validateOptionalString(data.businessDescription, 'Business description', 500);
      if (err) return res.status(400).json({ message: err });
    }
    if (data.differentiators !== undefined) {
      const err = validateOptionalString(data.differentiators, 'Differentiators', 500);
      if (err) return res.status(400).json({ message: err });
    }
    if (data.targetAudience !== undefined) {
      const err = validateOptionalString(data.targetAudience, 'Target audience', 500);
      if (err) return res.status(400).json({ message: err });
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
    return res.status(200).json({ message: 'Profile updated successfully', profile, name: data.name });

  } catch (error) {
    if (error.isAppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function getProfileController(req, res) {
  try {
    const userId = req.user.id;
    const data = await getProfileWithUser(userId);
    return res.status(200).json(data);
  } catch (error) {
    if (error.isAppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = { updateProfileController, getProfileController };