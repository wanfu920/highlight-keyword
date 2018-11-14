import Highlight from './highlight';

let highlight = new Highlight();

chrome.runtime.onMessage.addListener(function (req, sender) {
    highlight.changeConfig();
});