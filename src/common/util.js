export function debounce(fn, timeout = 200) {
    let timeId;
    return (...rest) => {
        if (timeId) {
            clearTimeout(timeId);
        }
        timeId = setTimeout(() => {
            clearTimeout(timeId);
            timeId = null;
            fn(...rest);
        }, timeout);
    }
}

export function commonParentNode(nodes = []) {
    let parentNodes = [], parentNode;
    if (nodes.length > 0) {
        parentNode = nodes.shift();
        while (nodes.length) {
            let nextNode = nodes.shift();
            if (parentNode.contains(nextNode)) {
                continue;
            } else if (nextNode.contains(parentNode)) {
                parentNode = nextNode;
            } else {
                parentNode = nextNode;
                if (parentNode.parentNode) {
                    nodes.push(parentNode.parentNode);
                } else {
                    parentNodes.push(parentNode);
                }
            }
        }
    }
    if (parentNode) {
        parentNodes.push(parentNode);
    }
    return parentNodes;
}

export function createFragmentFromString(domString) {
    let el = document.createElement('div');
    el.innerHTML = domString;
    let fragment = document.createDocumentFragment();
    el.childNodes.forEach(childNode => fragment.appendChild(childNode.cloneNode(true)));
    return fragment;
}

export function arrayIsEqual(arr1 = [], arr2 = []) {
    if (arr1.length !== arr2.length) {
        return false;
    } else {
        for(let i = 0; i < arr1.length; i++) {
            if (arr1[i] !== arr2[i]) {
                return false;
            }
        }
        return true;
    }
}