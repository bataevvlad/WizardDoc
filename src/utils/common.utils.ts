export interface CLIArgs {
  fileName?: string;
  rootIdContainer?: string;
  platform?: string;
}

export const getTimestamp = (): string => {
  const now = new Date();
  return now.toDateString() + ' ' + now.toTimeString().split(' ')[0];
};

export const getTagResourceRegex = (platform: string): RegExp => {
  return platform === 'android'
    ? /<([\w.]+)[^>]*resource-id="([^"]+)"/g
    : /<([\w.]+)[^>]*\b(name|accessibilityLabel)="([^"]+)"/g;
};

export const parseCLIArgs = (): CLIArgs => {
  return process.argv.slice(2).reduce((acc: CLIArgs, curr: string) => {
    const [key, value] = curr.split('=');
    acc[key as keyof CLIArgs] = value;
    return acc;
  }, {});
};
