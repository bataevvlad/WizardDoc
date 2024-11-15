import { generateMarkdownContent, getDescriptionForComponent, getElementType } from '../utils/readme.utils';

describe('All tests', () => {
  describe('generateMarkdownContent', () => {
    test('Given a list of matches and a component name, When markdown content is generated, Then it should produce the expected markdown', () => {
      const matches = [
        { component: 'android.widget.EditText', testIdName: 'input-text' },
        { component: 'android.widget.Button', testIdName: 'submit-button' },
        { component: 'XCUIElementTypeTextField', testIdName: 'ios-text-field' },
        { component: 'XCUIElementTypeButton', testIdName: 'ios-button' },
      ];
      const componentName = 'TestComponent';
      const result = generateMarkdownContent(matches, componentName);

      const expectedContent = `# TestComponent.tsx

![Component Image](change/Name.png)

| **Element**    | **Description**          | **Test ID**       |
|----------------|--------------------------|-------------------|
| Input Field    | Used for inputting text          | input-text       |
| Button    | Clickable button element          | submit-button       |
| Input Field    | Input field (iOS)          | ios-text-field       |
| Button    | Button (iOS)          | ios-button       |
`;

      expect(result).toBe(expectedContent);
    });

    test('Given an empty matches list and a component name, When markdown content is generated, Then it should produce markdown with just headers', () => {
      const matches: any = [];
      const componentName = 'EmptyComponent';
      const result = generateMarkdownContent(matches, componentName);

      const expectedContent = `# EmptyComponent.tsx

![Component Image](change/Name.png)

| **Element**    | **Description**          | **Test ID**       |
|----------------|--------------------------|-------------------|
`;

      expect(result).toBe(expectedContent);
    });

    test('Given a list of matches with unknown component types, When markdown content is generated, Then it should handle unknown types gracefully', () => {
      const matches = [
        { component: 'unknown.widget.Component', testIdName: 'unknown-test-id' },
      ];
      const componentName = 'UnknownComponent';
      const result = generateMarkdownContent(matches, componentName);

      const expectedContent = `# UnknownComponent.tsx

![Component Image](change/Name.png)

| **Element**    | **Description**          | **Test ID**       |
|----------------|--------------------------|-------------------|
| Unknown Type    | No description available          | unknown-test-id       |
`;

      expect(result).toBe(expectedContent);
    });
  });

  describe('getDescriptionForComponent', () => {
    test('Given a known component, When getting its description, Then it should return the correct description', () => {
      expect(getDescriptionForComponent('android.widget.EditText')).toBe('Used for inputting text');
      expect(getDescriptionForComponent('XCUIElementTypeButton')).toBe('Button (iOS)');
    });

    test('Given an unknown component, When getting its description, Then it should return a default description', () => {
      expect(getDescriptionForComponent('unknown.widget.Component')).toBe('No description available');
    });
  });

  describe('getElementType', () => {
    test('Given a known component, When getting its type, Then it should return the correct type', () => {
      expect(getElementType('android.widget.EditText')).toBe('Input Field');
      expect(getElementType('XCUIElementTypeButton')).toBe('Button');
    });

    test('Given an unknown component, When getting its type, Then it should return "Unknown Type"', () => {
      expect(getElementType('unknown.widget.Component')).toBe('Unknown Type');
    });

    test('Given a component name containing known partial matches, When getting its type, Then it should match correctly and return the type', () => {
      expect(getElementType('CustomButtonComponent')).toBe('Button');
      expect(getElementType('SpecialTextView')).toBe('Text');
    });
  });
});
