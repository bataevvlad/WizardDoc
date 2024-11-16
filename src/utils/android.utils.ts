import { execSync } from 'child_process';

interface ForegroundApp {
    appPackage: string;
    appActivity: string;
}

export const getAndroidForegroundAppPackageAndActivity = (): ForegroundApp | null => {
  try {
    const output = execSync('adb shell dumpsys activity activities').toString();
    const lines = output.split('\n');
    const lineWithFocus = lines.find((line) => line.includes('ResumedActivity:'));

    if (lineWithFocus) {
      // ResumedActivity: ActivityRecord{cb77ef3 u0 com.example.app/com.example.app.MainActivity t93}
      const match = lineWithFocus.match(
        /* eslint-disable */
        /ResumedActivity: ActivityRecord\{.*\s([^\s\/]+)\/([^\s\}\s]+)\s/
        /* eslint-enable */
      );

      if (match) {
        const appPackage = match[1];
        let appActivity = match[2];

        if (appActivity.startsWith('.')) {
          appActivity = `${appPackage}${appActivity}`;
        }

        return { appPackage, appActivity };
      } else {
        console.error('Could not parse the ResumedActivity line');
        return null;
      }
    } else {
      console.error('Could not find the ResumedActivity line');
      return null;
    }
  } catch (error) {
    console.error('Error fetching the foreground app:', error);
    return null;
  }
};
