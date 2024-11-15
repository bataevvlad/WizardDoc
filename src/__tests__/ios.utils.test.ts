import {
  getIOSSimulatorUUID,
  getInstalledApps,
  parseInstalledApps,
  launchIOSApp,
  promptUserToSelectApp,
} from '../utils/ios.utils';
import { execSync } from 'child_process';
import { select } from '@inquirer/prompts';

jest.mock('child_process', () => ({
  execSync: jest.fn(),
}));

jest.mock('@inquirer/prompts', () => ({
  select: jest.fn(),
}));

const mockedExecSync = execSync as jest.Mock;
const mockedSelect = select as jest.Mock;

describe('iOS Utility Functions', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getIOSSimulatorUUID', () => {
    test('should return the UUID of the booted iOS simulator', () => {
      mockedExecSync.mockReturnValue('12345-67890-abcdef');

      const result = getIOSSimulatorUUID();

      expect(result).toBe('12345-67890-abcdef');
      expect(mockedExecSync).toHaveBeenCalledWith(
        "xcrun simctl list devices | grep -w 'Booted' | awk -F '[()]' '{print $2}'"
      );
    });

    test('should return null if no simulator is booted', () => {
      mockedExecSync.mockReturnValue('');

      const result = getIOSSimulatorUUID();

      expect(result).toBeNull();
    });

    test('should handle errors and return null', () => {
      mockedExecSync.mockImplementation(() => {
        throw new Error('Command failed');
      });

      const result = getIOSSimulatorUUID();

      expect(result).toBeNull();
    });
  });

  describe('getInstalledApps', () => {
    test('should return the output of installed apps', () => {
      const mockOutput = 'Sample App List';
      mockedExecSync.mockReturnValue(mockOutput);

      const result = getInstalledApps();

      expect(result).toBe(mockOutput);
      expect(mockedExecSync).toHaveBeenCalledWith('xcrun simctl listapps booted');
    });

    test('should return null if an error occurs', () => {
      mockedExecSync.mockImplementation(() => {
        throw new Error('Command failed');
      });

      const result = getInstalledApps();

      expect(result).toBeNull();
    });
  });

  describe('parseInstalledApps', () => {
    test('should parse the installed apps output and return AppInfo array', () => {
      const mockOutput = `
        "com.example.app1" = {
          CFBundleDisplayName = "App One";
          CFBundleName = "AppOne";
        };
        "com.example.app2" = {
          CFBundleDisplayName = "App Two";
        };
      `;
      const result = parseInstalledApps(mockOutput);

      expect(result).toEqual([
        { bundleId: 'com.example.app1', CFBundleDisplayName: 'App One', CFBundleName: 'AppOne', displayName: 'App One' },
        { bundleId: 'com.example.app2', CFBundleDisplayName: 'App Two', displayName: 'App Two' },
      ]);
    });

    test('should correctly parse and transform values based on their format', () => {
      const mockOutput = `
    "org.reactjs.native.example.MobxArticleLight" =     {
        ApplicationType = User;
        Bundle = "file:///Users/vladislav.bataev/Library/Developer/CoreSimulator/Devices/EBFD5591-BB13-4CD0-8AD6-74D0EB18CEAF/data/Containers/Bundle/Application/D497470F-5053-4B42-934F-A2A41EA1F10B/MobxArticleLight.app/";
        BundleContainer = "file:///Users/vladislav.bataev/Library/Developer/CoreSimulator/Devices/EBFD5591-BB13-4CD0-8AD6-74D0EB18CEAF/data/Containers/Bundle/Application/D497470F-5053-4B42-934F-A2A41EA1F10B/";
        CFBundleDisplayName = MobxArticleLight;
        CFBundleExecutable = MobxArticleLight;
        CFBundleIdentifier = "org.reactjs.native.example.MobxArticleLight";
        CFBundleName = MobxArticleLight;
        CFBundleVersion = 1;
        DataContainer = "file:///Users/vladislav.bataev/Library/Developer/CoreSimulator/Devices/EBFD5591-BB13-4CD0-8AD6-74D0EB18CEAF/data/Containers/Data/Application/598AE39B-0B54-4223-999B-FF1556065F90/";
        Path = "/Users/vladislav.bataev/Library/Developer/CoreSimulator/Devices/EBFD5591-BB13-4CD0-8AD6-74D0EB18CEAF/data/Containers/Bundle/Application/D497470F-5053-4B42-934F-A2A41EA1F10B/MobxArticleLight.app";
    };
  `;

      const result = parseInstalledApps(mockOutput);

      expect(result).toEqual([
        {
          bundleId: 'org.reactjs.native.example.MobxArticleLight',
          ApplicationType: 'User',
          Bundle: 'file:///Users/vladislav.bataev/Library/Developer/CoreSimulator/Devices/EBFD5591-BB13-4CD0-8AD6-74D0EB18CEAF/data/Containers/Bundle/Application/D497470F-5053-4B42-934F-A2A41EA1F10B/MobxArticleLight.app/',
          BundleContainer: 'file:///Users/vladislav.bataev/Library/Developer/CoreSimulator/Devices/EBFD5591-BB13-4CD0-8AD6-74D0EB18CEAF/data/Containers/Bundle/Application/D497470F-5053-4B42-934F-A2A41EA1F10B/',
          CFBundleDisplayName: 'MobxArticleLight',
          CFBundleExecutable: 'MobxArticleLight',
          CFBundleIdentifier: 'org.reactjs.native.example.MobxArticleLight',
          CFBundleName: 'MobxArticleLight',
          CFBundleVersion: '1',
          DataContainer: 'file:///Users/vladislav.bataev/Library/Developer/CoreSimulator/Devices/EBFD5591-BB13-4CD0-8AD6-74D0EB18CEAF/data/Containers/Data/Application/598AE39B-0B54-4223-999B-FF1556065F90/',
          Path: '/Users/vladislav.bataev/Library/Developer/CoreSimulator/Devices/EBFD5591-BB13-4CD0-8AD6-74D0EB18CEAF/data/Containers/Bundle/Application/D497470F-5053-4B42-934F-A2A41EA1F10B/MobxArticleLight.app',
          displayName: 'MobxArticleLight',
        },
      ]);
    });


    test('should return an empty array for invalid input', () => {
      const mockOutput = `Invalid App List`;
      const result = parseInstalledApps(mockOutput);

      expect(result).toEqual([]);
    });
  });

  describe('launchIOSApp', () => {
    test('should launch an iOS app given a valid bundleId and booted simulator', () => {
      mockedExecSync.mockReturnValue('12345-67890-abcdef');
      jest.spyOn(global.console, 'log').mockImplementation();

      const result = launchIOSApp('com.example.app');

      expect(result).toBe(true);
      expect(mockedExecSync).toHaveBeenCalledWith('xcrun simctl launch 12345-67890-abcdef com.example.app');
    });

    test('should return false if no simulator is booted', () => {
      mockedExecSync.mockReturnValue('');
      jest.spyOn(global.console, 'error').mockImplementation();

      const result = launchIOSApp('com.example.app');

      expect(result).toBe(false);
      expect(global.console.error).toHaveBeenCalledWith('No booted iOS simulator found.');
    });

    test('should return false if an error occurs in execSync', () => {
      mockedExecSync.mockImplementation(() => {
        throw new Error('Command failed');
      });

      const consoleErrorSpy = jest.spyOn(global.console, 'error').mockImplementation();

      const result = launchIOSApp('com.example.app');

      expect(result).toBe(false);

      expect(consoleErrorSpy).toHaveBeenNthCalledWith(
        1,
        'Could not retrieve iOS Simulator UUID:',
        expect.any(Error)
      );
      expect(consoleErrorSpy).toHaveBeenNthCalledWith(
        2,
        'No booted iOS simulator found.'
      );

      consoleErrorSpy.mockRestore();
    });

  });

  describe('promptUserToSelectApp', () => {
    test('should prompt the user to select an app and return the selected bundleId', async () => {
      const mockApps = [
        { bundleId: 'com.example.app1', displayName: 'App One' },
        { bundleId: 'com.example.app2', displayName: 'App Two' },
      ];
      mockedSelect.mockResolvedValue('com.example.app1');

      const result = await promptUserToSelectApp(mockApps);

      expect(result).toBe('com.example.app1');
      expect(mockedSelect).toHaveBeenCalledWith({
        message: 'Select the app you want to use:',
        choices: [
          { name: 'App One (com.example.app1)', value: 'com.example.app1' },
          { name: 'App Two (com.example.app2)', value: 'com.example.app2' },
        ],
        pageSize: 2,
      });
    });
  });


});
