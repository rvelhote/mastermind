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
import WebDHT from "../../game/dht";
import NodeCollection from "../dht/node-collection";
import Peer from "peerjs";

const ROLE_CODEMAKER = 'codemaker';
const ROLE_CODEBREAKER = 'codebreaker';
const ROLE_NONE = 'none';
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
        this.onPeerOpen = this.onPeerOpen.bind(this);
        this.onPeerConnect = this.onPeerConnect.bind(this);
        this.onRemoteConnection = this.onRemoteConnection.bind(this);
        this.disconnect = this.disconnect.bind(this);

        this.state = {
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
                type: GAME_TYPE_WAITING,
                playing: false,
                foundSolution: false,
            },
            secret: {
                locked: false,
                code: [],
            },
            peer: null,
        };

        this.webDHT = WebDHT.start({
            bootstrap: ['ws://localhost:8000']
        });

        this.me = new Peer(this.webDHT.nodeId.toString('hex'), {key: 'p43mp0yrrmjkyb9'});

        this.me.on('open', this.onPeerOpen);
        this.me.on('connection', this.onRemoteConnection);
        // this.me.on('data', this.onRemoteConnection);

        // this.conn = null;

        this.remote = null;
    }

    onPeerOpen(id) {
        this.setState({peer: id});
    }

    onPeerConnect(event) {
        event.preventDefault();

        this.setState({ game: { role: ROLE_CODEBREAKER } });

        this.codemaker = this.me.connect(event.target.dataset.host);
        this.codemaker.on('open', () => { console.log('sending connection to remote'); this.codemaker.send({ opcode: 'CONNECT' }); });

        this.codemaker.on('data', d => {


            console.log('Data Received from the codemaker');
            console.log(d);

            // if(data.opcode === 'VERIFY') {
            //     console.log('VERIFY THIS');
            //
            //     this.remoteConn.send({ opcode: 'VERIFY_RES', feedback: 'verification result' });
            // }
            //
            // if(data.opcode === 'SECRET_SET') {
            //     console.log('START GAME. SECRET WAS SET');
            // }
            //
            // if(data.opcode === 'VERIFY_RES') {
            //     console.log('RESULT VERIFIED CONTINUE WITH THE RESULT');
            // }


        })
    }

    onRemoteConnection(conn) {
        // console.log()
        // console.log(this.conn.id);
        // console.log(conn.id);

        // console.log('Someone connected to me');
        this.codebreaker = conn;
        //
        this.codebreaker.on('data', d => {
           console.log('data received from the codebreaker');
           console.log(d);

            this.codebreaker.send({opcode: 'SOL_VERIFIED'});
        });

        //
        // this.remoteConn = conn;
        //
        // this.remoteConn.on('data', data => {
        //
        //     console.log(data);
        //
        //     if(data.opcode === 'CONNECT') {
                this.setState({ game: { role: ROLE_CODEMAKER } });
        //     }

            // if(data.opcode === 'VERIFY') {
            //     console.log('VERIFY THIS');
            //
            //     this.remoteConn.send({ opcode: 'VERIFY_RES', feedback: 'verification result' });
            // }
            //
            // if(data.opcode === 'SECRET_SET') {
            //     console.log('START GAME. SECRET WAS SET');
            // }
            //
            // if(data.opcode === 'VERIFY_RES') {
            //     console.log('RESULT VERIFIED CONTINUE WITH THE RESULT');
            // }
            //
            //
            //
            // console.log('Received data');
            // console.log(data);
        // });
    }

    disconnect() {
        console.log(this.webDHT);


    }


    componentDidMount() {
        this.setState({
            intervalId: setInterval(this.updateNodeList.bind(this), 1000),
        });
    }

    componentWillUnmount() {
        clearInterval(this.state.intervalId);
    }

    updateNodeList() {
        this.setState({
            dht: this.webDHT.toJSON(),
        });
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

        console.log('VERIFY THIS');
        this.codemaker.send({ opcode: 'VERIFY', attempt });


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

        // console.log(this.remoteConn);

        this.codebreaker.send({ opcode: 'SECRET_SET' });

        this.setState({
            secret: {
                locked: true,
                code: jsonFormData,
            },
        });
    }

    render() {
        let secret = '<div>Not the codemaker</div>';

        if(this.state.game.role === ROLE_CODEMAKER) {
            if(!this.state.secret.locked) {
                secret = <ColorSelection submit={this.onSecretSubmit}/>;
            } else {
                secret = <ColorDisplay colors={this.state.secret.code}/>;
            }
        }



        let play = <div>Not the codebreaker</div>;

        if(this.state.game.role === ROLE_CODEBREAKER) {

            if(this.state.attempts.length >= 55+this.state.configuration.maxAttempts && !this.state.game.foundSolution) {
                play = <div>game over pal</div>
            } else {
                play = <ColorSelection submit={this.onAttemptSubmit}/>
            }
        }




        let foundSolution = '';
        if(this.state.game.foundSolution) {
            foundSolution = <div>Solution found!</div>
        }

        return <div>
            <header className="navbar navbar-expand-lg navbar-light bg-light">
                <div className="container">
                    <div className="col-sm">
                        <h1>
                            <img alt="Mastermind Logo" src="//i.imgur.com/rN1zILE.png" />
                            <span>mastermind</span>
                        </h1>
                        <small>is a code-breaking game for two players invented in 1970 by Mordecai Meirowitz.</small>

                    </div>
                    <div className="col-sm">
                        <code>{ this.webDHT.nodeId.toString('hex') }</code>
                        <button type="button" className="btn btn-danger" onClick={this.disconnect}>Disconnect</button>
                    </div>
                </div>
            </header>

            <br />

            <div className="container">
                <div className="row">
                    <div className="col-xl">
                        <div className="alert alert-dismissible alert-info">
                            Choose someone to play with from the list on your right. When you connect to someone you
                            will be the <strong>codebreaker</strong> and the other player will be the <strong>codemaker</strong>.
                        </div>
                    </div>
                </div>
                <div className="row">

                <div className="col-xl">
                    <div>Current Attempt: {this.state.attempts.length} max {this.state.configuration.maxAttempts}</div>

                    <Configurator configuration={this.state.configuration} onSubmitConfiguration={this.onSubmitConfiguration}/>

                    <AttemptCollection attempts={this.state.attempts}/>

                    {foundSolution}
                    {play}
                    {secret}
                </div>
                    <div className="col-xl-5">
                        <NodeCollection onPeerConnect={this.onPeerConnect} nodes={this.state.dht.nodes}/>
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
