import { execSync } from 'child_process';
import { getAndroidForegroundAppPackageAndActivity } from '../utils/android.utils';

jest.mock('child_process', () => ({
  execSync: jest.fn(),
}));

const mockedExecSync = execSync as jest.Mock;

describe('getAndroidForegroundAppPackageAndActivity', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Given ResumedActivity is present, When the appActivity does not start with a dot, Then it should return appPackage and appActivity', () => {
    const mockOutput = `
      Activities dump:
      ResumedActivity: ActivityRecord{cb77ef3 u0 com.example.app/com.example.app.MainActivity t93}
    `;
    mockedExecSync.mockReturnValue(mockOutput);

    const result = getAndroidForegroundAppPackageAndActivity();

    expect(result).toEqual({
      appPackage: 'com.example.app',
      appActivity: 'com.example.app.MainActivity',
    });
  });

  test('Given ResumedActivity is missing, When no matching line is found, Then it should return null', () => {
    const mockOutput = `
      Activities dump:
      SomeOtherActivity: ActivityRecord{cb77ef3 u0 com.example.app/.MainActivity t93}
    `;
    mockedExecSync.mockReturnValue(mockOutput);

    const result = getAndroidForegroundAppPackageAndActivity();

    expect(result).toBeNull();
  });

  test('Given execSync throws an error, When the command fails, Then it should log an error and return null', () => {
    mockedExecSync.mockImplementation(() => {
      throw new Error('Command failed');
    });

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    const result = getAndroidForegroundAppPackageAndActivity();

    expect(result).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error fetching the foreground app:',
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });

  test('Given ResumedActivity is present, When appActivity starts with a dot, Then it should return a fully qualified appActivity', () => {
    const mockOutput = `
      Activities dump:
      ResumedActivity: ActivityRecord{cb77ef3 u0 com.example.app/.MainActivity t93}
    `;
    mockedExecSync.mockReturnValue(mockOutput);

    const result = getAndroidForegroundAppPackageAndActivity();

    expect(result).toEqual({
      appPackage: 'com.example.app',
      appActivity: 'com.example.app.MainActivity',
    });
  });

  test('Given ResumedActivity is unparseable, When the line format is invalid, Then it should log an error and return null', () => {
    const mockOutput = `
      Activities dump:
      ResumedActivity: ActivityRecord{cb77ef3 u0 invalid_line_format}
    `;
    mockedExecSync.mockReturnValue(mockOutput);

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    const result = getAndroidForegroundAppPackageAndActivity();

    expect(result).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalledWith('Could not parse the ResumedActivity line');

    consoleErrorSpy.mockRestore();
  });
});
