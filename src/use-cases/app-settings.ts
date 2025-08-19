import { 
  getAllAppSettings, 
  getAppSetting, 
  setAppSetting,
  isEarlyAccessMode as checkEarlyAccessMode 
} from "~/data-access/app-settings";

export async function getAppSettingsUseCase() {
  const settings = await getAllAppSettings();
  
  // Transform into a more usable format
  return settings.reduce((acc, setting) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {} as Record<string, string>);
}

export async function updateAppSettingUseCase(
  key: string, 
  value: string, 
  userId: number
) {
  // Validate the key
  const allowedKeys = ["EARLY_ACCESS_MODE"];
  if (!allowedKeys.includes(key)) {
    throw new Error(`Invalid setting key: ${key}`);
  }
  
  // Validate boolean values
  if (key === "EARLY_ACCESS_MODE") {
    if (value !== "true" && value !== "false") {
      throw new Error("EARLY_ACCESS_MODE must be 'true' or 'false'");
    }
  }
  
  await setAppSetting(key, value, userId);
}

export async function getEarlyAccessModeUseCase() {
  return checkEarlyAccessMode();
}

export async function toggleEarlyAccessModeUseCase(enabled: boolean, userId: number) {
  await setAppSetting("EARLY_ACCESS_MODE", enabled.toString(), userId);
}