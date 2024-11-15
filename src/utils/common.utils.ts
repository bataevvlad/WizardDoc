export const getTimestamp = (): string => {
  const now = new Date();
  return now.toDateString() + ' ' + now.toTimeString().split(' ')[0];
};

export const getTagResourceRegex = (platform: string): RegExp => {
  return platform === 'android'
    ? /<([\w.]+)[^>]*resource-id="([^"]+)"/g
    : /<([\w.]+)[^>]*\b(name|accessibilityLabel)="([^"]+)"/g;
};
