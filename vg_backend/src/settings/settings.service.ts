import { Injectable, NotFoundException } from '@nestjs/common';
import { UserSettings } from './entities/settings.entity';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  // Mock database for user settings
  private userSettings: UserSettings[] = [];
  private settingsIdCounter = 1;

  /**
   * Creates default settings for a new user.
   * This should be called by the UserService when a new user is created.
   * @param userId - The ID of the new user.
   * @returns The newly created UserSettings object.
   */
  async createDefaultSettings(userId: number): Promise<UserSettings> {
    const defaultSettings: UserSettings = {
      id: this.settingsIdCounter++,
      userId,
      language: 'vi',
      isDarkMode: false,
      elderly_notificationsEnabled: true,
      elderly_soundEnabled: true,
      elderly_vibrationEnabled: true,
      relative_appNotificationsEnabled: true,
      relative_emailAlertsEnabled: true,
      relative_smsAlertsEnabled: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.userSettings.push(defaultSettings);
    return defaultSettings;
  }

  /**
   * Retrieves the settings for a specific user.
   * @param userId - The ID of the user.
   * @returns The UserSettings object.
   */
  async getSettingsByUserId(userId: number): Promise<UserSettings> {
    const settings = this.userSettings.find(s => s.userId === userId);
    if (!settings) {
      // If settings don't exist for some reason, create them.
      return this.createDefaultSettings(userId);
    }
    return settings;
  }

  /**
   * Updates the settings for a specific user.
   * @param userId - The ID of the user.
   * @param updateSettingsDto - The settings data to update.
   * @returns The updated UserSettings object.
   */
  async updateSettings(
    userId: number,
    updateSettingsDto: UpdateSettingsDto,
  ): Promise<UserSettings> {
    const settingsIndex = this.userSettings.findIndex(s => s.userId === userId);
    if (settingsIndex === -1) {
      throw new NotFoundException(`Settings for user with ID ${userId} not found.`);
    }

    const updatedSettings = {
      ...this.userSettings[settingsIndex],
      ...updateSettingsDto,
      updatedAt: new Date(),
    };

    this.userSettings[settingsIndex] = updatedSettings;
    return updatedSettings;
  }
}
