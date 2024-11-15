import { select } from '@inquirer/prompts';
import { execSync } from 'child_process';

interface AppInfo {
    bundleId: string;
    displayName?: string;
    [key: string]: any;
}

export const getIOSSimulatorUUID = (): string | null => {
  try {
    const uuid = execSync(
      "xcrun simctl list devices | grep -w 'Booted' | awk -F '[()]' '{print $2}'"
    )
      .toString()
      .trim();
    return uuid || null;
  } catch (error) {
    console.error('Could not retrieve iOS Simulator UUID:', error);
    return null;
  }
};

export const getInstalledApps = (): string | null => {
  try {
    return execSync('xcrun simctl listapps booted').toString();
  } catch (error) {
    console.error('Error retrieving installed apps:', error);
    return null;
  }
};

export const parseInstalledApps = (output: string): AppInfo[] => {
  const apps: AppInfo[] = [];
  const lines = output.split('\n');

  let i = 0;
  while (i < lines.length) {
    let line = lines[i].trim();
    const appMatch = line.match(/^"([^"]+)"\s*=\s*\{$/);
    if (appMatch) {
      const bundleId = appMatch[1];
      const appInfo: AppInfo = { bundleId };
      i++;
      let nestingLevel = 1;
      let appDataLines: string[] = [];
      while (i < lines.length && nestingLevel > 0) {
        line = lines[i].trim();
        const openBraces = (line.match(/{/g) || []).length;
        const closeBraces = (line.match(/}/g) || []).length;
        nestingLevel += openBraces - closeBraces;

        appDataLines.push(line);
        i++;
      }

      const appData = appDataLines.join('\n');
      const appDataMatches = [...appData.matchAll(/^(\w+)\s*=\s*(.*);$/gm)];

      appDataMatches.forEach((match) => {
        const key = match[1];
        let value: any = match[2].trim();

        if (value.endsWith(',')) {
          value = value.slice(0, -1).trim();
        }

        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        } else if (value.startsWith('(') && value.endsWith(')')) {
          value = value
            .substring(1, value.length - 1)
            .split(',')
            .map((s: string) => s.trim().replace(/"/g, ''));
        } else if (value.startsWith('{') && value.endsWith('}')) {
          value = {};
        }

        appInfo[key] = value;
      });

      if (appInfo.CFBundleDisplayName || appInfo.CFBundleName) {
        appInfo.displayName = appInfo.CFBundleDisplayName || appInfo.CFBundleName;
        apps.push(appInfo);
      }
    } else {
      i++;
    }
  }

  return apps;
};

export const launchIOSApp = (bundleId: string): boolean => {
  try {
    const udid = getIOSSimulatorUUID();
    if (!udid) {
      console.error('No booted iOS simulator found.');
      return false;
    }
    execSync(`xcrun simctl launch ${udid} ${bundleId}`);
    console.log(`Launched app with bundleId: ${bundleId}`);
    return true;
  } catch (error) {
    console.error('Error launching iOS app:', error);
    return false;
  }
};

export const promptUserToSelectApp = async (apps: AppInfo[]): Promise<string> => {
  const choices = apps.map((app) => ({
    name: `${app.displayName} (${app.bundleId})`,
    value: app.bundleId,
  }));

  const answer = await select({
    message: 'Select the app you want to use:',
    choices: choices,
    pageSize: choices.length,
  });

  return answer;
};
