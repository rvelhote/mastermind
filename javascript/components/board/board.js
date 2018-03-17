/*
 * The MIT License (MIT)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import React from 'react';
import AttemptCollection from './attempt-collection';
import ColorSelection from './color-selection';
import ColorDisplay from './color-display';

const GAME_TYPE_HOST = 'host';
const GAME_TYPE_GUEST = 'guest';
const GAME_TYPE_WAITING = 'waiting';

class Board extends React.Component {
    /**
     *
     * @param props
     */
    constructor(props) {
        super(props);

        this.onSecretSubmit = this.onSecretSubmit.bind(this);
        this.onAttemptSubmit = this.onAttemptSubmit.bind(this);

        this.state = {
            attempts: [],
            game: {
                type: GAME_TYPE_WAITING,
                playing: false,
            },
            secret: {
                locked: false,
                code: [],
            },
        };
    }

    onAttemptSubmit(event) {
        event.preventDefault();

        let isValid = true;

        // TODO DRY!
        const formData = new FormData(event.target);
        let jsonFormData = [];

        formData.forEach((v, k) => {
            if (v.length === 0) {
                isValid = false;
            }
            jsonFormData.push(v);
        });

        if (!isValid) {
            alert('Bad attempt!');
            return;
        }

        this.setState(previousState => {
            previousState.attempts.push(jsonFormData);
            return {
                attempts: previousState.attempts,
            }
        });
    }

    onSecretSubmit(event) {
        event.preventDefault();

        if(this.state.secret.code.length > 0) {
            alert('Secret already set');
            return;
        }

        let isValid = true;

        // TODO DRY!
        const formData = new FormData(event.target);
        let jsonFormData = [];

        formData.forEach((v, k) => {
            if (v.length === 0) {
                isValid = false;
            }
            jsonFormData.push(v);
        });

        if (!isValid) {
            alert('Bad secret!');
            return;
        }

        this.setState({
            secret: {
                locked: true,
                code: jsonFormData,
            },
        });
    }

    render() {
        let secret = <ColorSelection submit={this.onSecretSubmit}/>;
        if (this.state.secret.locked) {
            secret = <ColorDisplay colors={this.state.secret.code}/>;
        }

        let play = <ColorSelection submit={this.onAttemptSubmit}/>
        if(this.state.attempts.length >= this.props.maxAttempts) {
            play = <div>game over pal</div>
        }

        return <div>
            <div>Current Attempt: {this.state.attempts.length} max 10</div>

            <AttemptCollection attempts={this.state.attempts}/>

            {play}
            {secret}
        </div>;
    }
}

Board.displayName = 'Board';

Board.propTypes = {};

Board.defaultProps = {};

export default Board;
