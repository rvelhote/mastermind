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
import Identifier from './identifier';
import Header from '../page/header';
import Alert from '../page/Alert';
import Player from '../../game/player';

// const ROLE_CODEMAKER = 'codemaker';
// const ROLE_CODEBREAKER = 'codebreaker';
// const ROLE_NONE = 'none';

const Role = {
    NONE: 0,
    CODE_MAKER: 1,
    CODE_BREAKER: 2,
};

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
    RESET: 4,
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
        // this.onPeerOpen = this.onPeerOpen.bind(this);
        this.onPeerConnect = this.onPeerConnect.bind(this);
        this.onConnectionEstablished = this.onConnectionEstablished.bind(this);
        this.onDataReceived = this.onDataReceived.bind(this);
        // this.onDataReceived = this.onDataReceived.bind(this);
        // this.disconnect = this.disconnect.bind(this);

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
                role: Role.NONE,
                status: GameStatus.UNCONNECTED,
                foundSolution: false,
            },
            secret: {
                locked: false,
                code: [],
            },
            peer: null,
        };

        this.me = new Player();

        this.me.subscribe('onConnectionEstablished', this.onConnectionEstablished);
        this.me.subscribe('onDataReceived', this.onDataReceived);
        // this.me.subscribe('onDataReceivedFromPlayer2', this.onDataReceived);
    }

    onDataReceived(data) {
        if (data.opcode === OpCode.CONNECT) {
            this.setState(p => {
                p.connected = true;
                p.game.status = GameStatus.WAITING_FOR_CODEMAKER;
                p.game.role = Role.CODE_MAKER;
                return p;
            });
        }

        if (data.opcode === OpCode.ATTEMPT_VERIFY) {
            const feedback = Verifier.verify(this.state.secret.code, data.attempt);

            this.setState(p => {
                p.attempts.push({attempt: data.attempt, feedback});
                return p;
            });

            this.me.send({
                opcode: OpCode.ATTEMPT_VERIFIED,
                attempt: data.attempt,
                feedback,
            });
        }

        if (data.opcode === OpCode.ATTEMPT_VERIFIED) {
            this.setState(previousState => {
                previousState.game.foundSolution = Verifier.isCorrect(data.feedback);
                previousState.attempts.push({attempt: data.attempt, feedback: data.feedback});
                return previousState;
            });
        }

        if (data.opcode === OpCode.SECRET_SET) {
            this.setState(p => {
                p.game.status = GameStatus.PLAYING;
                return p;
            });
        }
    }

    /**
     * Connects to the specified peer for a game of Mastermind. By default the
     * person connecting will go first as the code breaker.
     * @param {string} peerId The peer that we want to connect to
     */
    onPeerConnect(peerId) {
        if(this.me.id === peerId) {
            alert('You cannot connect to yourself');
            return;
        }

        this.setState(previousState => {
            previousState.game.role = Role.CODE_BREAKER;
            return previousState;
        });

        this.me.connect(peerId);
    }

    /**
     * This event means that the peer that initiated the connection has
     * established the connection and that the receiving end of the connection
     * has also received the connection. The game can now start.
     */
    onConnectionEstablished() {
        this.setState(previousState => {
            previousState.connected = true;
            previousState.game.status = GameStatus.WAITING_FOR_CODEMAKER;
            return previousState;
        });
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

        this.me.send({opcode: OpCode.ATTEMPT_VERIFY, attempt});
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

        this.me.send({opcode: OpCode.SECRET_SET});

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

        if (this.state.game.role === Role.CODE_MAKER && this.state.game.status !== GameStatus.UNCONNECTED) {
            if (!this.state.secret.locked) {
                secret = <ColorSelection submit={this.onSecretSubmit}/>;
            } else {
                secret = <ColorDisplay colors={this.state.secret.code}/>;
            }
        }

        let play = null;

        if (this.state.game.role === Role.CODE_BREAKER && this.state.game.status !== GameStatus.UNCONNECTED) {
            if (this.state.attempts.length >= this.state.configuration.maxAttempts) {
                statusMessage = <Alert type="danger" message="You have exhausted all the available attempts without finding the secret!" />;
                play = null;
            } else if (this.state.game.status === GameStatus.PLAYING) {
                play = <div className="card border-light"><div className="card-header">Attempt</div><div className="card-body"><ColorSelection submit={this.onAttemptSubmit}/></div></div>;
            }
        }

        let statusMessage = null;
        let lineBreak = <hr />;
        if (this.state.game.status === GameStatus.UNCONNECTED) {
            lineBreak = null;
            statusMessage =
                <Alert type="danger" message="You are currently not connected to anyone!" />;
        }

        if (this.state.game.status === GameStatus.WAITING_FOR_CODEMAKER) {
            if (this.state.game.role === Role.CODE_MAKER) {
                statusMessage = <Alert type="info" message="Please set a secret combination for the CODEBREAKER!" />;
            } else {
                statusMessage = <Alert type="info" message="Waiting for the CODEMAKER to set a secret combination!" />;
            }
        }

        if (this.state.game.foundSolution) {
            statusMessage = <Alert type="success" message="Congratulations! You have found the secret!" />;
        }

        return <div>
            <header className="mastermind-navbar navbar-light bg-light">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-xl-8 col-12">
                            <Header/>
                        </div>
                        <div className="col">
                            <Identifier id={this.me.id} />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">

                            {this.state.game.status === GameStatus.UNCONNECTED &&
                                <NodeConnect status={this.state.game.status}
                                         onPeerConnect={this.onPeerConnect}/>
                            }

                            {this.state.game.status !== GameStatus.UNCONNECTED &&
                            <div>playing</div>
                            }
                        </div>
                    </div>
                </div>
            </header>

            <div className="container">
                <div className="row">
                    <div className="col">{statusMessage}</div>
                </div>

                {this.state.game.status !== GameStatus.UNCONNECTED &&
                    <div className="row">
                        <div className="col">
                            {secret}


                            {this.state.game.status === GameStatus.PLAYING &&
                            <AttemptCollection
                                max={this.state.configuration.maxAttempts}
                                attempts={this.state.attempts}/>
                            }




                            {play}


                        </div>
                    </div>
                }
            </div>
        </div>;
    }
}

Board.displayName = 'Board';

Board.propTypes = {};

Board.defaultProps = {};

export default Board;
