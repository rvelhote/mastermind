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
import uuidv4 from 'uuid';
import React from 'react';
import AttemptCollection from './attempt-collection';
import ColorSelection from './color-selection';
import ColorDisplay from './color-display';
import Configurator from './configurator';
import NodeConnect from '../node/node-connect'
import Verifier from '../../game/verifier';
import Peer from "peerjs";

const ROLE_CODEMAKER = 'codemaker';
const ROLE_CODEBREAKER = 'codebreaker';
const ROLE_NONE = 'none';
// const GAME_TYPE_WAITING = 'waiting';

const GameStatus = {
    UNCONNECTED: 0,
    WAITING_FOR_CODEMAKER: 1,
    PLAYING: 2,
};

const OpCode = {
    CONNECT: 0,
    ATTEMPT_VERIFIED: 1,
    SECRET_SET: 2,
    ATTEMPT_VERIFY: 3,
};

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
        this.onPeerOpen = this.onPeerOpen.bind(this);
        this.onPeerConnect = this.onPeerConnect.bind(this);
        this.onRemoteConnection = this.onRemoteConnection.bind(this);
        this.disconnect = this.disconnect.bind(this);

        this.state = {
            connected: false,
            dht: {
                nodes: [],
                values: [],
            },
            configuration: {
                maxAttempts: 10,
                totalHoles: 4,
                totalColors: 4,
            },
            attempts: [],
            game: {
                role: ROLE_NONE,
                status: GameStatus.UNCONNECTED,
                foundSolution: false,
            },
            secret: {
                locked: false,
                code: [],
            },
            peer: null,
        };

        this.me = new Peer(uuidv4(), {key: 'p43mp0yrrmjkyb9'});

        this.me.on('open', this.onPeerOpen);
        this.me.on('connection', this.onRemoteConnection);
    }

    onPeerOpen(id) {
        this.setState({peer: id});
    }

    onPeerConnect(peerId) {
        this.setState({connected: true, game: {role: ROLE_CODEBREAKER, status: GameStatus.WAITING_FOR_CODEMAKER}});

        this.codemaker = this.me.connect(peerId);
        this.codemaker.on('open', (d) => {
            this.codemaker.send({opcode: OpCode.CONNECT});
        });

        this.codemaker.on('data', d => {
            if (d.opcode === OpCode.ATTEMPT_VERIFIED) {
                this.setState(previousState => {
                    previousState.game.foundSolution = Verifier.isCorrect(d.feedback);
                    previousState.attempts.push({attempt: d.attempt, feedback: d.feedback});
                    return previousState;
                });
            }

            if (d.opcode === OpCode.SECRET_SET) {
                this.setState(p => {
                    p.game.status = GameStatus.PLAYING;
                    return p;
                });
            }
        })
    }

    /**
     *
     * @param conn
     */
    onRemoteConnection(conn) {
        this.codebreaker = conn;

        this.codebreaker.on('data', d => {
            if (d.opcode === OpCode.CONNECT) {
                this.setState(p => {
                    p.connected = true;
                    p.game.role = ROLE_CODEMAKER;
                    p.game.status = GameStatus.WAITING_FOR_CODEMAKER;
                    return p;
                });
            }

            if (d.opcode === OpCode.ATTEMPT_VERIFY) {
                const feedback = Verifier.verify(this.state.secret.code, d.attempt);

                this.setState(p => {
                    p.attempts.push({attempt: d.attempt, feedback});
                    return p;
                });

                this.codebreaker.send({
                    opcode: OpCode.ATTEMPT_VERIFIED,
                    attempt: d.attempt,
                    feedback,
                });
            }
        });
    }

    /**
     *
     */
    disconnect() {
        if (this.codebreaker) {
            this.codebreaker.close();
        }

        if (this.codemaker) {
            this.codemaker.close();
        }

        this.setState({connected: false})
    }

    /**
     *
     * @param event
     */
    onAttemptSubmit(event) {
        event.preventDefault();

        if (this.state.attempts.length >= this.state.configuration.maxAttempts) {
            alert(`No more attempts for you. Only ${this.state.configuration.maxAttempts}!`);
            return;
        }

        const form = new FormData(event.target);
        const attempt = form.getAll('choice');

        if (attempt.length !== this.state.configuration.totalHoles) {
            alert(`Bad attempt! Must choose all ${this.state.configuration.totalHoles} colors!`);
            return;
        }

        this.codemaker.send({opcode: OpCode.ATTEMPT_VERIFY, attempt});
    }

    /**
     *
     * @param event
     */
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

    /**
     *
     * @param event
     */
    onSecretSubmit(event) {
        event.preventDefault();

        if (this.state.secret.locked) {
            alert('Secret already set');
            return;
        }

        const form = new FormData(event.target);
        const secret = form.getAll('choice');

        if (secret.length !== this.state.configuration.totalHoles) {
            alert(`Bad secret! Must choose all ${this.state.configuration.totalHoles} colors!`);
            return;
        }

        this.codebreaker.send({opcode: OpCode.SECRET_SET});
        this.setState(p => {
            p.game.status = GameStatus.PLAYING;
            p.secret.locked = true;
            p.secret.code = secret;
            return p;
        });
    }

    /**
     *
     * @returns {*}
     */
    render() {
        let secret = null;

        if (this.state.game.role === ROLE_CODEMAKER && this.state.game.status !== GameStatus.UNCONNECTED) {
            if (!this.state.secret.locked) {
                secret = <div className="card border-light"><div className="card-header">Secret</div><div className="card-body"><ColorSelection submit={this.onSecretSubmit}/></div></div>;
            } else {
                secret = <div className="card border-light"><div className="card-header">Secret</div><div className="card-body"><ColorDisplay colors={this.state.secret.code}/></div></div>;
            }
        }

        let play = null;

        if (this.state.game.role === ROLE_CODEBREAKER && this.state.game.status !== GameStatus.UNCONNECTED) {
            if (this.state.attempts.length >= this.state.configuration.maxAttempts) {
                play = <div>game over pal</div>;
            } else if (this.state.game.status === GameStatus.PLAYING) {
                play = <div className="card border-light"><div className="card-header">Attempt</div><div className="card-body"><ColorSelection submit={this.onAttemptSubmit}/></div></div>;
            }
        }

        let statusMessage = null;
        let lineBreak = <hr />;
        if (this.state.game.status === GameStatus.UNCONNECTED) {
            lineBreak = null;
            statusMessage =
                <div className="alert alert-info" role="alert">You are currently not connected to anyone!</div>;
        }

        if (this.state.game.status === GameStatus.WAITING_FOR_CODEMAKER) {
            if (this.state.game.role === ROLE_CODEMAKER) {
                statusMessage = <div className="alert alert-warning" role="alert">Set the secret!</div>;
            } else {
                statusMessage =
                    <div className="alert alert-warning" role="alert">Waiting for the codemaker to set a secret!</div>;
            }
        }

        let foundSolution = '';
        if (this.state.game.foundSolution) {
            foundSolution = <div>Solution found!</div>
        }

        return <div>
            <header className="navbar navbar-expand-lg navbar-light bg-light">
                <div className="container">
                    <div className="col-lg-12">
                        <h1>
                            <img alt="Mastermind Logo" src="//i.imgur.com/rN1zILE.png"/>
                            <span>mastermind</span>
                        </h1>
                        <small>is a code-breaking game for two players invented in 1970 by Mordecai Meirowitz.</small>
                    </div>
                    <div className="col-sm">
                        {/*<button disabled={!this.state.connected} type="button" className="btn btn-danger"*/}
                                {/*onClick={this.disconnect}>Disconnect*/}
                        {/*</button>*/}
                    </div>
                </div>
            </header>

            <br/>

            <div className="container">
                <div className="row">
                    <div className="col-xl">{statusMessage}</div>
                </div>
                <div className="row">
                    <div className="col-xl">
                        <AttemptCollection max={this.state.configuration.maxAttempts} attempts={this.state.attempts}/>
                        {foundSolution}

                        {lineBreak}

                        {play}

                        {lineBreak}

                        {secret}
                    </div>
                    <div className="col-xl-5">
                        <div className="card bg-light">
                            <div className="card-header">My ID</div>
                            <div className="card-body">
                                <code>{this.me.id}</code>
                            </div>
                        </div>

                        <br/>

                        <NodeConnect onPeerConnect={this.onPeerConnect}/>

                        <br/>

                        <div className="card bg-light">
                            <div className="card-header">Chat</div>
                            <div className="card-body">
                                <div className="alert alert-warning" role="alert">
                                    Under Development
                                </div>
                            </div>
                        </div>

                        <br/>

                        <div className="card bg-light">
                            <div className="card-header">Score</div>
                            <div className="card-body">
                                <div className="alert alert-warning" role="alert">
                                    Under Development
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>;
    }
}

Board.displayName = 'Board';

Board.propTypes = {};

Board.defaultProps = {};

export default Board;
