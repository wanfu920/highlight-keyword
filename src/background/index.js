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
        console.log(details);
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

function setRequestHeaders(requestHeaders, headers) {
  for (let i = 0; i < requestHeaders.length; ++i) {
    const { name } = requestHeaders[i];
    if (headers[name] !== undefined) {
      requestHeaders[i].value = headers[name];
    }
  }
  return requestHeaders;
}
const interceptUrlHeaders = [
  [/https:\/\/community\.kaola\.com\/api\/manage\/good-thing\/\d+$/, {
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
  ["blocking", "requestHeaders"]
);