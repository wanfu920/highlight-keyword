import React from 'react'
import ReactDom from 'react-dom'
import SettingBox from './SettingBox'
import { getConfigFromStorage, setConfigToStorage } from '../common/storage'
import { debounce } from '../common/util'

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            highlightWords: '',
            enableHighlight: true,
        };
        this.debounceSendMessage = debounce(() => {
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, '');
            });
        }, 500);
    }
    componentDidMount() {
        getConfigFromStorage().then(config => {
            this.setState({
                highlightWords: config.highlightWords || '',
                enableHighlight: config.enableHighlight === undefined ? true : config.enableHighlight,
            })
        });
    }
    highlightWordsChange = value => {
        this.changeConfig({ highlightWords: value, })
    }
    enableHighlightChange = checked => {
        this.changeConfig({ enableHighlight: checked, })
    }
    changeConfig(config) {
        return this.setState(config, () => {
            setConfigToStorage(this.state).then(this.debounceSendMessage);
        });
    }
    render() {
        const props = {
            highlightWords: this.state.highlightWords,
            enableHighlight: this.state.enableHighlight,
            highlightWordsChange: this.highlightWordsChange,
            enableHighlightChange: this.enableHighlightChange,
        }
        return (<SettingBox {...props}/>);
    }
}

ReactDom.render(<App />, document.getElementById('app'))
