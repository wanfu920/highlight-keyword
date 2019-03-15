 const interceptWeexKaolaDomainPaths = [
  [/(https:\/\/community\.kaola\.com\/api)(\/good-thing\/\d+)$/, '$1/manage$2'],
  [/(https:\/\/community\.kaola\.com)(\/idea\/\d+\.html\?isPreview=1)$/, '$1/manage$2'],
  [/(https:\/\/community\.kaola\.com)(\/discussion\/\d+\.html\?isPreview=1)$/, '$1/manage$2'],
  [/(https:\/\/community\.kaola\.com)(\/novels\/\d+\.html\?isPreview=1)$/, '$1/manage$2'],
  [/(https:\/\/community\.kaola\.com)(\/album\/\d+\.html\?isPreview=1)$/, '$1/manage$2'],
  [/(https:\/\/community\.kaola\.com)(\/video\/\d+\.html\?isPreview=1)$/, '$1/manage$2'],
  [/(https:\/\/community\.kaola\.com)(\/billboard\/\d+\.html\?isPreview=1)$/, '$1/manage$2'],
  [/(https:\/\/community\.kaola\.com)(\/topic\/\d+\.html\?isPreview=1)$/, '$1/manage$2'],
];
function interceptWeexKaolaDomain(details) {
  if (
    details.method !== 'OPTIONS' &&
    details.frameId !== 0 &&
    details.parentFrameId === 0
  ) {
    for (const [originPath, repalcePath] of interceptWeexKaolaDomainPaths) {
      if (originPath.test(details.url)) {
        return {
          redirectUrl: details.url.replace(originPath, repalcePath)
        }
      }
    }
  }
}

chrome.webRequest.onBeforeRequest.addListener(
  function (details) {
    let result;
    result = interceptWeexKaolaDomain(details);
    return result || {};
  },
  { urls: [ "*://*/*", ] },
  ["blocking", "requestBody"]
);

function setRequestHeaders(requestHeaders, headers = {}) {
  Object.entries(headers).forEach(([name, value]) => {
    let isFind = false;
    for (let i = 0; i < requestHeaders.length; ++i) {
      isFind = requestHeaders[i].name.toLowerCase() == name.toLowerCase();
      if(isFind){
        requestHeaders[i].value = value;
        break;
      }
    }
    if(!isFind){
      requestHeaders.push({name, value});
    }
  });
  return requestHeaders;
}
const interceptUrlHeaders = [
  [/https?:\/\/(community|zone)\.kaola\.com.*$/, {
    Referer: 'https://kol-ms.kaola.com'
  }],
];
function setInterceptUrlHeaders(details) {
  if (
    details.method !== 'OPTIONS' &&
    details.frameId !== 0 &&
    details.parentFrameId === 0
  ) {
    for (const [path, headers = {}] of interceptUrlHeaders) {
      if (path.test(details.url)) {
        return {
          requestHeaders: setRequestHeaders(details.requestHeaders, headers)
        }
      }
    }
  }
}

chrome.webRequest.onBeforeSendHeaders.addListener(
  function(details) {
    let result;
    result = setInterceptUrlHeaders(details);
    return result || {};
    // var category = 'requestHeaders';
    // // If the request is from us..
    // if (chrome.runtime.getURL('').slice(0,-1) == info.initiator) {
    //   for (var i = 0; i < info.requestHeaders.length; ++i) {
    //     if (info.requestHeaders[i].name === 'x-tamperchrome-origin') {
    //       info.requestHeaders[i].name = 'origin';
    //       return {requestHeaders: info.requestHeaders};
    //     }
    //   }
    // }
    // if (skipRequest(info, category)) {
    //   return {};
    // }
    // var res = askUser(category, info);
    // return res;
  },
  { urls: [ "*://*/*", ] },
  ["blocking", "requestHeaders", "extraHeaders"]
);