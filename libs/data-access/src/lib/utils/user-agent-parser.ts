export interface UserAgentInfo {
  os: string;
  osVersion: string;
  browser: string;
  browserVersion: string;
  deviceType: string;
}

export function parseUserAgent(userAgentString: string): UserAgentInfo {
  const userAgent = userAgentString.toLowerCase();
  const result: UserAgentInfo = {
    os: 'Unknown',
    osVersion: 'Unknown',
    browser: 'Unknown',
    browserVersion: 'Unknown',
    deviceType: 'Unknown',
  };

  // Operating System
  if (userAgent.includes('windows nt')) {
    result.os = 'Windows';
    if (userAgent.includes('windows nt 10.0')) {
      result.osVersion = '10';
    } else if (userAgent.includes('windows nt 6.3')) {
      result.osVersion = '8.1';
    } else if (userAgent.includes('windows nt 6.2')) {
      result.osVersion = '8';
    } else if (userAgent.includes('windows nt 6.1')) {
      result.osVersion = '7';
    } else if (userAgent.includes('windows nt 6.0')) {
      result.osVersion = 'Vista';
    } else if (userAgent.includes('windows nt 5.1')) {
      result.osVersion = 'XP';
    } else if (userAgent.includes('windows nt 5.0')) {
      result.osVersion = '2000';
    }
  } else if (userAgent.includes('mac os x')) {
    result.os = 'macOS';
    const versionMatch = userAgent.match(/mac os x ([\d_]+)/);
    if (versionMatch) {
      result.osVersion = versionMatch[1].replace(/_/g, '.');
    }
  } else if (userAgent.includes('android')) {
    result.os = 'Android';
  } else if (userAgent.includes('linux')) {
    result.os = 'Linux';
    const versionMatch = userAgent.match(/android ([\d.]+)/);
    if (versionMatch) {
      result.osVersion = versionMatch[1];
    }
  } else if (userAgent.includes('ios')) {
    result.os = 'iOS';
    const versionMatch = userAgent.match(/version\/([\d._]+) mobile/);
    if (versionMatch) {
      result.osVersion = versionMatch[1].replace(/_/g, '.');
    } else {
      const versionMatchWebKit = userAgent.match(/applewebkit\/([\d._]+)/);
      if (versionMatchWebKit) {
        result.osVersion = versionMatchWebKit[1].split('.')[0];
      }
    }
  }

  // Browser
  if (userAgent.includes('chrome')) {
    result.browser = 'Chrome';
    const versionMatch = userAgent.match(/chrome\/([\d.]+)/);
    if (versionMatch) result.browserVersion = versionMatch[1];
  } else if (userAgent.includes('firefox')) {
    result.browser = 'Firefox';
    const versionMatch = userAgent.match(/firefox\/([\d.]+)/);
    if (versionMatch) result.browserVersion = versionMatch[1];
  } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
    result.browser = 'Safari';
    const versionMatch = userAgent.match(/version\/([\d.]+)/);
    if (versionMatch) result.browserVersion = versionMatch[1];
  } else if (userAgent.includes('edge')) {
    result.browser = 'Edge';
    const versionMatch = userAgent.match(/edge\/([\d.]+)/);
    if (versionMatch) result.browserVersion = versionMatch[1];
  } else if (userAgent.includes('msie') || userAgent.includes('trident')) {
    result.browser = 'Internet Explorer';
    let versionMatch;
    if (userAgent.includes('msie')) {
      versionMatch = userAgent.match(/msie ([\d.]+)/);
    } else if (userAgent.includes('trident')) {
      versionMatch = userAgent.match(/rv:([\d.]+)/);
    }
    if (versionMatch) result.browserVersion = versionMatch[1];
  }

  // Device Type
  if (
    userAgent.includes('mobile') ||
    userAgent.includes('android') ||
    userAgent.includes('ios')
  ) {
    result.deviceType = 'Mobile';
  } else {
    result.deviceType = 'Desktop';
  }

  return result;
}
