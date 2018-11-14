import { getConfigFromStorage } from '../common/storage';
import { commonParentNode, createFragmentFromString, arrayIsEqual } from '../common/util';

const styleConfig = [ "yellow", "deepskyblue", "red", "blue", "cyan", "orange", "deeppink", "magenta" ];

class highlight {
    constructor() {
        this.node = document.body;
        this.config;
        this.keywords;
        this.keywordsReg;
        this.styleConfig = styleConfig;
        this.observer;
        this.init();
    }

    init() {
        console.log('init');
        this._getConfig().then(() => {
            if (this.config.enableHighlight) {
                this._loopHighlight();
                this._startObserve();
            }
        });
    }

    _startObserve() {
        if (this.observer) {
            this.observer.disconnect();
        }
        this.observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.type === 'characterData') {
                    this._textChangeHighlight(mutation.target);
                }
                if (mutation.type === 'childList') {
                    this._loopHighlight(commonParentNode([...mutation.addedNodes]));
                }
            })
        });

        this.observer.observe(this.node, {
            attributes: false,
            childList: true,
            characterData: true,
            subtree: true,
        });
    }

    destory() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        this._removeAllHighlight();
    }

    // 从storage中获取插件配置: highlightWords enableHighlight
    async _getConfig() {
        this.config = await getConfigFromStorage() || {};
        this.keywords = (this.config.highlightWords || '').split(/\s+/);
        this.keywords = this.keywords.filter(keyword => keyword.length > 0);
        if (this.keywords.length) {
            this.keywordsReg = new RegExp(`(${this.keywords.join('|')})`, 'gi');
        }
    }

    // 对文本结点中的文本进行高亮
    _highlight(textNode) {
        // 没有关键词或者不是文本结点, 不高亮
        if (!this.config.enableHighlight || !this.keywords.length || textNode.nodeType !== Node.TEXT_NODE) return;

        let nodeValue = textNode.nodeValue;

        // 文本结点不包含关键词
        if (!this.keywordsReg.test(nodeValue)) return;

        let domString = nodeValue.replace(this.keywordsReg, (match, p1) => {
            let index = this.keywords.findIndex(keyword => keyword.toLowerCase() === p1.toLowerCase());
            if (index > -1) {
                return `<i class="chrome-extensions-multi-highlight chrome-extensions-multi-highlight-${this.styleConfig[index] || 'yellow'}">${p1}</i>`;
            } else {
                return p1;
            }
        });
        let fragment = createFragmentFromString(domString);

        let originTextNode;
        if (textNode._originTextNode) {
            originTextNode = textNode._originTextNode;
        } else {
            textNode._isOriginTextNode = true;
            originTextNode = textNode;
        }
        fragment.childNodes.forEach(childNode => {
            childNode._originTextNode = originTextNode;
            // childNode.parentNode = originTextNode.parentNode;
        });
        textNode.parentNode.insertBefore(fragment, textNode);
        if (textNode._isOriginTextNode) {
            textNode.nodeValue = '';
        } else {
            textNode.parentNode.removeChild(textNode);
        }
    }

    _loopHighlight(nodes = [this.node]) {
        while (nodes.length) {
            let node = nodes.shift();
            if (node && node.nodeType === Node.ELEMENT_NODE) {
                if (!node.classList.contains('chrome-extensions-multi-highlight')) {
                    if (node.childNodes.length) {
                        nodes.push(...node.childNodes)
                    }
                }
            } else if (node && node.nodeType === Node.TEXT_NODE) {
                this._highlight(node);
            }
        }
    }

    _reLoopHighlight() {
        this._removeAllHighlight();
        setTimeout(() => {
            this._loopHighlight();
        }, 100);
    }

    _removeAllHighlight() {
        let highlightNodes = document.querySelectorAll(`.chrome-extensions-multi-highlight`);
        highlightNodes.forEach(highlightNode => {
            let originTextNode = highlightNode._originTextNode;
            let node = originTextNode.previousSibling, deriveNodes = [], nodeValue = originTextNode.nodeValue;
            while (node && node._originTextNode === originTextNode) {
                deriveNodes.push(node);
                nodeValue = (node.nodeValue || node.innerText || '') + nodeValue;
                node = node.previousSibling;
            }
            deriveNodes.forEach(node => node.parentNode.removeChild(node));
            originTextNode.nodeValue = nodeValue;
        });
    }

    _textChangeHighlight(textNode) {
        if (textNode._isOriginTextNode) {
            if (textNode.nodeValue) {
                let node = textNode.previousSibling, deriveNodes = [];
                while (node && node._originTextNode === textNode) {
                    deriveNodes.push(node);
                    node = node.previousSibling;
                }
                deriveNodes.forEach(node => node.parentNode.removeChild(node));
            }
        }
        this._highlight(textNode);
    }

    async changeConfig() {
        let oldKeywords = this.keywords;
        let oldEnableHighlight = this.config.enableHighlight;
        await this._getConfig();
        let newKeywords = this.keywords;
        let newEnableHighlight = this.config.enableHighlight;

        if (oldEnableHighlight !== newEnableHighlight) {
            if (newEnableHighlight) {
                this.init();
            } else {
                this.destory();
            }
        }

        if (!arrayIsEqual(oldKeywords, newKeywords)) {
            this._reLoopHighlight();
        }
    }

}

export default highlight;