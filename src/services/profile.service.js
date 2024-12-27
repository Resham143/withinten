const User = require('../models/user.model');

class ProfileService {
  async updateProfile(userId, profileData) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.profile_name = profileData.name;
    await user.save();
    return user;
  }

  async updateImage(userId, imagePath) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.profile_image = imagePath;
    await user.save();
    return user;
  }

  async updateLanguage(userId, language) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.profile_language = language;
    await user.save();
    return user;
  }

  async updateLocation(userId, coordinates) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.profile_longitude = coordinates[0];
    user.profile_latitude = coordinates[1];
    await user.save();
    return user;
  }
}

module.exports = new ProfileService(); 