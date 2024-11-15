import {CLIArgs, getTagResourceRegex, getTimestamp, parseCLIArgs} from '../utils/common.utils'

describe('getTagResourceRegex', () => {
  const normalizeMatches = (matches: RegExpMatchArray[]) =>
    matches.map((match) => match.slice(0, match.length));

  test('Given the current date and time, When getTimestamp is called, Then it should return the timestamp in the format "Weekday Month Day Year HH:MM:SS"', () => {
    const result = getTimestamp();

    const now = new Date();
    const expectedDate = now.toDateString();
    const expectedTime = now.toTimeString().split(' ')[0];

    expect(result).toBe(`${expectedDate} ${expectedTime}`);
  });

  test('Given an Android platform, When getTagResourceRegex is called, Then it should return a regex to match resource-id attributes', () => {
    const platform = 'android';
    const regex = getTagResourceRegex(platform);

    const htmlString = `
      <Button resource-id="btn123" text="Click Me"></Button>
      <TextView resource-id="txt456"></TextView>
    `.trim();

    const matches = Array.from(htmlString.matchAll(regex));
    const normalizedMatches = normalizeMatches(matches);

    expect(normalizedMatches).toEqual([
      ['<Button resource-id="btn123"', 'Button', 'btn123'],
      ['<TextView resource-id="txt456"', 'TextView', 'txt456'],
    ]);
  });

  test('Given a non-Android platform, When getTagResourceRegex is called, Then it should return a regex to match name or accessibilityLabel attributes', () => {
    const platform = 'ios';
    const regex = getTagResourceRegex(platform);

    const htmlString = `
      <Button name="btnSubmit"></Button>
      <Button accessibilityLabel="Submit Button"></Button>
      <TextView name="txtDescription"></TextView>
    `.trim();

    const matches = Array.from(htmlString.matchAll(regex));
    const normalizedMatches = normalizeMatches(matches);

    expect(normalizedMatches).toEqual([
      ['<Button name="btnSubmit"', 'Button', 'name', 'btnSubmit'],
      ['<Button accessibilityLabel="Submit Button"', 'Button', 'accessibilityLabel', 'Submit Button'],
      ['<TextView name="txtDescription"', 'TextView', 'name', 'txtDescription'],
    ]);
  });

  test('Given a non-Android platform with mixed attributes, When getTagResourceRegex is called, Then it should gracefully handle and match all attributes', () => {
    const platform = 'ios';
    const regex = getTagResourceRegex(platform);

    const htmlString = `
      <Button name="btnSubmit" accessibilityLabel="Submit Button"></Button>
      <TextView name="txtDescription"></TextView>
    `.trim();

    const matches = Array.from(htmlString.matchAll(regex));
    const normalizedMatches = normalizeMatches(matches);

    expect(normalizedMatches).toEqual([
      ['<Button name="btnSubmit" accessibilityLabel="Submit Button"', 'Button', 'accessibilityLabel', 'Submit Button'],
      ['<TextView name="txtDescription"', 'TextView', 'name', 'txtDescription'],
    ]);
  });

  test('should correctly parse CLI arguments when provided', () => {
    const mockArgv = ['node', 'script.js', 'fileName=test-file', 'rootIdContainer=root123', 'platform=ios'];
    Object.defineProperty(process, 'argv', { value: mockArgv, writable: true });
    const args: CLIArgs = parseCLIArgs();

    expect(args.fileName).toBe('test-file');
    expect(args.rootIdContainer).toBe('root123');
    expect(args.platform).toBe('ios');
  });

  test('should use default values when arguments are missing', () => {
    const mockArgv = ['node', 'script.js'];
    Object.defineProperty(process, 'argv', { value: mockArgv, writable: true });

    const args: CLIArgs = parseCLIArgs();

    expect(args.fileName).toBe(undefined);
    expect(args.rootIdContainer).toBe(undefined);
    expect(args.platform).toBe(undefined);
  });

  test('should handle a case where only one argument is passed', () => {
    const mockArgv = ['node', 'script.js', 'fileName=test-file'];
    Object.defineProperty(process, 'argv', { value: mockArgv, writable: true });

    const args: CLIArgs = parseCLIArgs();

    expect(args.fileName).toBe('test-file');
    expect(args.rootIdContainer).toBe(undefined);
    expect(args.platform).toBe(undefined);
  });

  test('should handle cases with malformed arguments gracefully', () => {
    const mockArgv = ['node', 'script.js', 'fileName', 'platform=ios'];
    Object.defineProperty(process, 'argv', { value: mockArgv, writable: true });

    const args: CLIArgs = parseCLIArgs();

    expect(args.fileName).toBe(undefined);
    expect(args.platform).toBe('ios');
  });
});
