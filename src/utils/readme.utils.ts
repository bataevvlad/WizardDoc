interface Match {
    component: string;
    testIdName: string;
}

export const generateMarkdownContent = (matches: Match[], componentName: string): string => {
  let content = `# ${componentName}.tsx\n\n`;
  content += `![Component Image](change/Name.png)\n\n`;
  content += `| **Element**    | **Description**          | **Test ID**       |\n`;
  content += `|----------------|--------------------------|-------------------|\n`;

  matches.forEach((match) => {
    const elementName = getElementType(match.component);
    const description = getDescriptionForComponent(match.component);
    content += `| ${elementName}    | ${description}          | ${match.testIdName}       |\n`;
  });

  return content;
};

const getDescriptionForComponent = (component: string): string => {
  const descriptions: Record<string, string> = {
    'android.widget.EditText': 'Used for inputting text',
    'android.widget.Button': 'Clickable button element',
    'android.widget.TextView': 'Displays text',
    'android.view.View': 'Generic view component',
    'android.view.ViewGroup': 'Container for other views',
    'com.horcrux.svg.SvgView': 'SVG image',
    'android.widget.ScrollView': 'Scrollable view',
    'android.widget.CheckBox': 'Checkbox',
    'android.widget.Image': 'Image',
    'android.widget.FrameLayout': 'Webview',
    'XCUIElementTypeTextField': 'Input field (iOS)',
    'XCUIElementTypeButton': 'Button (iOS)',
    'XCUIElementTypeStaticText': 'Displays static text (iOS)',
    'XCUIElementTypeImage': 'Image (iOS)',
    'XCUIElementTypeOther': 'Generic view component (iOS)',
    'XCUIElementTypeApplication': 'Application container (iOS)',
  };
  return descriptions[component] || 'No description available';
};

const getElementType = (component: string): string => {
  const typeMappings: Record<string, string> = {
    EditText: 'Input Field',
    TextField: 'Input Field',
    Button: 'Button',
    TextView: 'Text',
    StaticText: 'Text',
    ViewGroup: 'View Group',
    View: 'View',
    SvgView: 'SVG View',
    ScrollView: 'Scroll View',
    CheckBox: 'Checkbox',
    Image: 'Image',
    FrameLayout: 'Webview',
    XCUIElementTypeApplication: 'Application',
    XCUIElementTypeOther: 'Container',
  };

  for (const key in typeMappings) {
    if (component.includes(key)) {
      return typeMappings[key];
    }
  }
  return 'Unknown Type';
};
