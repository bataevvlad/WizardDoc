import fs from 'fs';
import { remote } from 'webdriverio';
import {
  getIOSSimulatorUUID,
  getInstalledApps,
  parseInstalledApps,
  launchIOSApp,
  promptUserToSelectApp,
} from "./utils/ios.utils";
import { getTimestamp, getTagResourceRegex } from "./utils/common.utils";
import { generateMarkdownContent } from "./utils/readme.utils";
import {getAndroidForegroundAppPackageAndActivity} from "./utils/android.utils";

interface CLIArgs {
    fileName?: string;
    rootIdContainer?: string;
    platform?: string;
}

const args: CLIArgs = process.argv.slice(2).reduce((acc: CLIArgs, curr: string) => {
  const [key, value] = curr.split('=');
  acc[key as keyof CLIArgs] = value;
  return acc;
}, {});

const fileName: string = args.fileName || 'DefaultFileName';
const rootIdContainer: string = args.rootIdContainer || '';
const platform: string = args.platform || 'android';

const androidCapabilities: any = {
  path: '/',
  port: 4723,
  capabilities: {
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:noReset': true,
    'appium:ensureWebviewsHavePages': true,
    'appium:nativeWebScreenshot': true,
    'appium:newCommandTimeout': 3600,
    'appium:connectHardwareKeyboard': true,
  },
};

const iosCapabilities: any = {
  path: '/',
  port: 4723,
  capabilities: {
    platformName: 'iOS',
    'appium:automationName': 'XCUITest',
    'appium:noReset': true,
    'appium:udid': getIOSSimulatorUUID(),
  },
};

const startApp = async (): Promise<void> => {
  if (platform === 'android') {
    const foregroundApp = getAndroidForegroundAppPackageAndActivity();
    if (foregroundApp) {
      androidCapabilities.capabilities['appium:appPackage'] = foregroundApp.appPackage;
      androidCapabilities.capabilities['appium:appActivity'] = foregroundApp.appActivity;
      console.log('Detected foreground app:', foregroundApp);
    } else {
      console.error('Unable to retrieve the foreground app. Please ensure an app is running on the emulator.');
      process.exit(1);
    }
  } else if (platform === 'ios') {
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
};

(async (): Promise<void> => {
  await startApp();

  const capabilities = platform === 'ios' ? iosCapabilities : androidCapabilities;

  const fetchTestIdsAndGenerateDoc = async (): Promise<void> => {
    if (platform === 'ios' && !capabilities.capabilities['appium:udid']) {
      console.error('No active iOS simulator found. Please start a simulator.');
      return;
    }

    const client = await remote(capabilities);

    try {
      const pageSource: string = await client.getPageSource();
      const tagResourceRegex = getTagResourceRegex(platform);

      const matches: { component: string; testIdName: string }[] = [];
      let match: RegExpExecArray | null;

      while ((match = tagResourceRegex.exec(pageSource)) !== null) {
        const testIdName = platform === 'android' ? match[2] : match[3];
        if (!rootIdContainer || testIdName.includes(rootIdContainer)) {
          matches.push({
            component: match[1],
            testIdName: testIdName,
          });
        }
      }

      if (matches.length === 0) {
        console.log(`No elements found with specified criteria.`);
        return;
      }

      const markdownContent = generateMarkdownContent(matches, fileName);
      const timestamp = getTimestamp().replace(/[: ]/g, '-');
      fs.writeFileSync(`output-${timestamp}.md`, markdownContent);
      console.log(`Markdown file created successfully with filtered elements! Filename: output-${timestamp}.md`);
    } finally {
      await client.deleteSession();
    }
  };

  fetchTestIdsAndGenerateDoc()
    .then(() => console.log('Finished generating documentation.'))
    .catch((error) => console.error('Error:', error));
})();
