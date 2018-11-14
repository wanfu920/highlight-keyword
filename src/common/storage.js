export async function getConfigFromStorage(key) {
    return await new Promise((resolve, reject) => {
        chrome.storage.sync.get(key, data => {
            resolve(data || {});
        });
    })
}

export async function setConfigToStorage(config = {}) {
    return await new Promise((resolve, reject) => {
        chrome.storage.sync.set(config, resolve);
    })
}