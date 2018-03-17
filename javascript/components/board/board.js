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
import Configurator from './configurator';
import Verifier from '../../game/verifier';

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
        this.onSubmitConfiguration = this.onSubmitConfiguration.bind(this);

        this.state = {
            configuration: {
                maxAttempts: 10,
                totalHoles: 4,
                totalColors: 4,
            },
            attempts: [],
            game: {
                type: GAME_TYPE_WAITING,
                playing: false,
                foundSolution: false,
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
        let isCorrect = true;

        // TODO DRY!
        const formData = new FormData(event.target);
        let attempt = [];

        formData.forEach((v, k) => {
            if (v.length === 0) {
                isValid = false;
            }
            attempt.push(v);
        });

        if (!isValid) {
            alert('Bad attempt!');
            return;
        }

        const feedback = Verifier.verify(this.state.secret.code, attempt);
        const foundSolution = Verifier.isCorrect(feedback);

        this.setState(previousState => {
            previousState.attempts.push({ attempt, feedback });
            return {
                game: {
                    foundSolution
                },
                attempts: previousState.attempts,
            }
        });
    }

    onSubmitConfiguration(event) {
        event.preventDefault();

        const formData = new FormData(event.target);

        this.setState({
            configuration: {
                totalColors: parseInt(formData.get('totalColors')),
                totalHoles: parseInt(formData.get('totalHoles')),
                maxAttempts: parseInt(formData.get('maxAttempts')),
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
        if(this.state.attempts.length >= 55+this.state.configuration.maxAttempts && !this.state.game.foundSolution) {
            play = <div>game over pal</div>
        }

        let foundSolution = '';
        if(this.state.game.foundSolution) {
            foundSolution = <div>Solution found!</div>
        }

        return <div>
            <div>Current Attempt: {this.state.attempts.length} max {this.state.configuration.maxAttempts}</div>

            <Configurator configuration={this.state.configuration} onSubmitConfiguration={this.onSubmitConfiguration}/>

            <AttemptCollection attempts={this.state.attempts}/>

            {foundSolution}
            {play}
            {secret}
        </div>;
    }
}

Board.displayName = 'Board';

Board.propTypes = {};

Board.defaultProps = {};

export default Board;
