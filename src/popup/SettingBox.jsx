import React from 'react';
import css from './SettingBox.css';

export default class Textarea extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div>
                <div className={css['tip']}>
                    <span>Highlight words below </span>
                    <span>(separated by a space)</span>
                    <span className={css['switch']}>
                        Enable
                        <input type="checkbox" onChange={e => this.props.enableHighlightChange(e.target.checked)} checked={this.props.enableHighlight}/>
                    </span>
                </div>
                <div className={css['highlight-words']}>
                    <textarea
                        placeholder="type highlight words here ..."
                        onChange={e => this.props.highlightWordsChange(e.target.value)}
                        value={this.props.highlightWords}
                        disabled={!this.props.enableHighlight}
                    />
                </div>
            </div>
        );
    }
}