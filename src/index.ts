import fs from 'fs';
import { remote } from 'webdriverio';
import {
  getIOSSimulatorUUID,
} from "./utils/ios.utils";
import {getTimestamp, getTagResourceRegex, parseCLIArgs} from './utils/common.utils'
import { generateMarkdownContent } from "./utils/readme.utils";
import { getAndroidForegroundAppPackageAndActivity } from "./utils/android.utils";
import {startIOS} from './utils/start.utils'

export const args = parseCLIArgs();

const fileName: string = args.fileName || 'DefaultFileName';
const rootIdContainer: string = args.rootIdContainer || '';
const platform: string = args.platform || 'android';

export const androidCapabilities: any = {
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

export const iosCapabilities: any = {
  path: '/',
  port: 4723,
  capabilities: {
    platformName: 'iOS',
    'appium:automationName': 'XCUITest',
    'appium:noReset': true,
    'appium:udid': getIOSSimulatorUUID(),
  },
};


export const startApp = async (): Promise<void> => {
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
    await startIOS(iosCapabilities)
  }
};

export const fetchTestIdsAndGenerateDoc = async (capabilities: any): Promise<void> => {
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

(async (): Promise<void> => {
  await startApp();

  const capabilities = platform === 'ios' ? iosCapabilities : androidCapabilities;

  fetchTestIdsAndGenerateDoc(capabilities)
    .then(() => console.log('Finished generating documentation.'))
    .catch((error) => console.error('Error:', error));
})();
