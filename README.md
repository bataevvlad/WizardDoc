# WizardDoc - Automated Test ID Documentation Generator

WizardDoc is a Node.js-based tool designed to automate the extraction of test IDs and generate markdown documentation. This is particularly useful for analyzing the page source of Android and iOS applications using Appium WebDriver and creating structured reports.

## Features

- **Platform Compatibility:** Supports both Android and iOS.
- **Dynamic App Detection:** Detects the foreground app (Android) or installed apps (iOS).
- **Markdown Generation:** Automatically creates a detailed markdown report with test IDs and component descriptions.
- **Custom Filtering:** Filter results using `rootIdContainer`.
- **Interactive Selection:** For iOS, it prompts users to select an app if multiple are installed.

## Installation

Ensure you have Node.js installed. Clone the repository and install dependencies:

```bash
npm install
```

## Scripts

Run the following scripts to execute the tool:

- **Android:**
  ```bash
  npm run android
  npm run android:name
  npm run android:name:root
  ```

- **iOS:**
  ```bash
  npm run ios
  npm run ios:name
  npm run ios:name:root
  ```

## Arguments

- **fileName:** Name for the generated markdown file (default: `DefaultFileName`).
- **rootIdContainer:** Filter elements by container ID.
- **platform:** Choose between `ios` or `android`.

## Generated Markdown Format

The output markdown includes:

- Test ID information.
- Component types and descriptions.

---

## Prerequisites

### General
- **Node.js**: Ensure Node.js is installed.
- **Appium**: Start the Appium server before running any scripts. Use the following command to start Appium:
  ```bash
  appium
  ```
  Ensure it is running on the default port `4723`.

---

## How to Start WizardDoc for Android

### Pre-requisites:
1. **Android Emulator or Device**:
   - Ensure you have an Android emulator running or a physical device connected.
   - Verify that `adb` is properly configured by running:
     ```bash
     adb devices
     ```
2. **Appium Server**:
   - Start the Appium server with:
     ```bash
     appium
     ```

### Launching WizardDoc for Android:
You can start the script using the following commands:

#### **Default settings**:
Detects the foreground app package and activity on the connected Android device. Fetches test IDs and generates the markdown report.
```bash
npm run android
```

#### **With custom fileName**:
Use a custom name for the generated markdown file.
```bash
npm run android:name
```

#### **With custom fileName and rootIdContainer**:
Filters test IDs based on the container ID specified in `rootIdContainer`.
```bash
npm run android:name:root
```

### Main Flow for Android:
1. Detects the foreground app using:
   ```bash
   adb shell dumpsys activity
   ```
2. Extracts the package name and activity name of the running app.
3. Uses these values to launch the app and retrieve the page source.
4. Filters the source for elements matching test ID patterns.
5. Generates the markdown report.

---

## How to Start WizardDoc for iOS

### Pre-requisites:
1. **Booted iOS Simulator**:
   - Ensure an iOS simulator is booted and running.
   - Verify with:
     ```bash
     xcrun simctl list devices
     ```
2. **Xcode Tools**:
   - Install and configure Xcode and the `xcrun` command-line tools.
3. **Appium Server**:
   - Start the Appium server with:
     ```bash
     appium
     ```

### Launching WizardDoc for iOS:
You can start the script using the following commands:

#### **Default settings**:
Detects installed apps on the simulator and prompts you to select one. Fetches test IDs and generates the markdown report.
```bash
npm run ios
```

#### **With custom fileName**:
Use a custom name for the generated markdown file.
```bash
npm run ios:name
```

#### **With custom fileName and rootIdContainer**:
Filters test IDs based on the container ID specified in `rootIdContainer`.
```bash
npm run ios:name:root
```

### Main Flow for iOS:
1. Retrieves the UUID of the running simulator using:
   ```bash
   xcrun simctl
   ```
2. Lists installed apps and prompts the user to select one.
3. Uses the selected app's bundle ID to launch the app on the simulator.
4. Retrieves the page source and filters it for test IDs matching the specified criteria.
5. Generates the markdown report.

---

## Developer Notes

### File Structure

- **`src/index.ts`:** Entry point of the application.
- **`utils/ios.utils.ts`:** Functions for iOS simulator interaction.
- **`utils/android.utils.ts`:** Android-specific utilities.
- **`utils/common.utils.ts`:** Shared utilities like regex patterns.
- **`utils/readme.utils.ts`:** Markdown content generation logic.

### Key Dependencies

- **[@inquirer/prompts](https://www.npmjs.com/package/@inquirer/prompts):** For interactive prompts.
- **[webdriverio](https://webdriver.io/):** WebDriver client for Appium.

### How It Works

1. Parses command-line arguments to determine platform and options.
2. Detects active Android foreground app or prompts for iOS app selection.
3. Fetches page source using Appium WebDriver.
4. Filters elements based on provided criteria.
5. Generates and saves a markdown report.

### Example Output

```markdown
# DefaultFileName.tsx

![Component Image](change/Name.png)

| **Element**    | **Description**          | **Test ID**       |
|----------------|--------------------------|-------------------|
| Button         | Clickable button element | login_button      |
| Input Field    | Used for inputting text  | username_input    |
```

## License

This project is licensed under the ISC License.

## Contact

For inquiries or contributions, please create an issue in the repository.

