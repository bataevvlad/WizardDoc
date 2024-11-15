import {getInstalledApps, launchIOSApp, parseInstalledApps, promptUserToSelectApp} from './ios.utils'

export const startIOS = async (iosCapabilities: any) => {
  if (!iosCapabilities.capabilities['appium:udid']) {
    console.error('No active iOS simulator found. Please start a simulator.');
    process.exit(1);
  }

  const output = getInstalledApps();
  if (!output) {
    console.error('Failed to retrieve installed apps.');
    process.exit(1);
  }

  const apps = parseInstalledApps(output);
  if (apps.length === 0) {
    console.error('No apps found on the simulator.');
    process.exit(1);
  }

  const bundleId = await promptUserToSelectApp(apps);
  console.log('You selected app with bundleId:', bundleId);
  iosCapabilities.capabilities['appium:bundleId'] = bundleId;

  const appLaunched = launchIOSApp(bundleId);
  if (!appLaunched) {
    console.error('Failed to launch the iOS app.');
    process.exit(1);
  }
}
