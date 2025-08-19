import { FLAGS } from "~/config";
import { isEarlyAccessMode, setAppSetting } from "~/data-access/app-settings";

export async function setEarlyAccessMode(enabled: boolean) {
  await setAppSetting(FLAGS.EARLY_ACCESS_MODE, enabled.toString());
}

export async function getEarlyAccessMode(): Promise<boolean> {
  return isEarlyAccessMode();
}
