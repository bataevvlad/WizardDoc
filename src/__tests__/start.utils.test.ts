import { startIOS } from '../utils/start.utils';
import { getInstalledApps, launchIOSApp, parseInstalledApps, promptUserToSelectApp } from '../utils/ios.utils';

jest.mock("../utils/ios.utils", () => ({
  getInstalledApps: jest.fn(),
  launchIOSApp: jest.fn(),
  parseInstalledApps: jest.fn(),
  promptUserToSelectApp: jest.fn(),
}));

describe("startIOS", () => {
  const mockCapabilities = {
    capabilities: {
      "appium:udid": "mock-udid",
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should exit if no iOS simulator UDID is provided", async () => {
    const capabilitiesWithoutUdid = { capabilities: {} };

    const exitSpy = jest.spyOn(process, "exit").mockImplementation((code?: string | number | null | undefined) => {
      throw new Error(`Process exited with code ${code}`);
    });

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(startIOS(capabilitiesWithoutUdid)).rejects.toThrow("Process exited with code 1");

    expect(consoleErrorSpy).toHaveBeenCalledWith("No active iOS simulator found. Please start a simulator.");
    expect(exitSpy).toHaveBeenCalledWith(1);

    consoleErrorSpy.mockRestore();
  });

  it("should exit if no installed apps are retrieved", async () => {
    (getInstalledApps as jest.Mock).mockReturnValue(null);

    const exitSpy = jest.spyOn(process, "exit").mockImplementation((code?: string | number | null | undefined) => {
      throw new Error(`Process exited with code ${code}`);
    });

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(startIOS(mockCapabilities)).rejects.toThrow("Process exited with code 1");
    expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to retrieve installed apps.");
    expect(exitSpy).toHaveBeenCalledWith(1);

    // Cleanup spy
    consoleErrorSpy.mockRestore();
  });

  it("should exit if no apps are found on the simulator", async () => {
    (getInstalledApps as jest.Mock).mockReturnValue("mock-output");
    (parseInstalledApps as jest.Mock).mockReturnValue([]);

    const exitSpy = jest.spyOn(process, "exit").mockImplementation((code?: string | number | null | undefined) => {
      throw new Error(`Process exited with code ${code}`);
    });

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(startIOS(mockCapabilities)).rejects.toThrow("Process exited with code 1");
    expect(consoleErrorSpy).toHaveBeenCalledWith("No apps found on the simulator.");
    expect(exitSpy).toHaveBeenCalledWith(1);

    // Cleanup spy
    consoleErrorSpy.mockRestore();
  });

  it("should set the bundle ID and launch the app if everything is successful", async () => {
    const mockBundleId = "com.example.app";
    (getInstalledApps as jest.Mock).mockReturnValue("mock-output");
    (parseInstalledApps as jest.Mock).mockReturnValue([mockBundleId]);
    (promptUserToSelectApp as jest.Mock).mockResolvedValue(mockBundleId);
    (launchIOSApp as jest.Mock).mockReturnValue(true);

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(startIOS(mockCapabilities)).resolves.toBeUndefined();

    expect(getInstalledApps).toHaveBeenCalled();
    expect(parseInstalledApps).toHaveBeenCalledWith("mock-output");
    expect(promptUserToSelectApp).toHaveBeenCalledWith([mockBundleId]);

    expect(launchIOSApp).toHaveBeenCalledWith(mockBundleId);

    // @ts-ignore
    expect(mockCapabilities.capabilities["appium:bundleId"]).toBe(mockBundleId);

    expect(consoleErrorSpy).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });


  it("should exit if the app fails to launch", async () => {
    const mockBundleId = "com.example.app";
    (getInstalledApps as jest.Mock).mockReturnValue("mock-output");
    (parseInstalledApps as jest.Mock).mockReturnValue([mockBundleId]);
    (promptUserToSelectApp as jest.Mock).mockResolvedValue(mockBundleId);
    (launchIOSApp as jest.Mock).mockReturnValue(false);

    const exitSpy = jest.spyOn(process, "exit").mockImplementation((code?: string | number | null | undefined) => {
      throw new Error(`Process exited with code ${code}`);
    });

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(startIOS(mockCapabilities)).rejects.toThrow("Process exited with code 1");
    expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to launch the iOS app.");
    expect(exitSpy).toHaveBeenCalledWith(1);

    // Cleanup spy
    consoleErrorSpy.mockRestore();
  });
});
