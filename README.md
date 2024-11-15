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

## Usage Instructions

1. **Setup Appium Environment:**
   Ensure Appium is running and configured for your platform.

2. **Run the Script:**
   Execute the relevant script from the `scripts` section in `package.json`.

3. **Generated Output:**
   The markdown file is saved in the current directory with a timestamped filename.

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

