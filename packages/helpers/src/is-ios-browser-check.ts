// https://stackoverflow.com/questions/9038625/detect-if-device-is-ios

const isIOSBrowser = (): boolean => {
  return (
    [
      'iPad Simulator',
      'iPhone Simulator',
      'iPod Simulator',
      'iPad',
      'iPhone',
      'iPod',
    ].includes(navigator.platform) ||
    // iPad on iOS 13 detection
    (navigator.userAgent.includes('Mac') && 'ontouchend' in document)
  );
};

export default isIOSBrowser;
