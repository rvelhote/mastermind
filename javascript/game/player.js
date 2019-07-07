/**
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
import Peer from 'peerjs';
import uuidv4 from 'uuid';

const Role = {
  CODEMAKER: 'codemaker',
  CODEBREAKER: 'codebreaker',
  NONE: 'none',
};

const OpCode = {
  CONNECT: 0,
  ATTEMPT_VERIFIED: 1,
  SECRET_SET: 2,
  ATTEMPT_VERIFY: 3,
};

/**
 *
 */
class Player extends Peer {
  /**
   *
   */
  constructor() {
    super(uuidv4(), {key: 'p43mp0yrrmjkyb9'});

    this.onRemoteConnection = this.onRemoteConnection.bind(this);
    this.onDataReceived = this.onDataReceived.bind(this);

    this.on('connection', this.onRemoteConnection);

    this.observers = [];
    this.connection = null;
  }

  /**
   *
   * @param event
   * @param observer
   */
  subscribe(event, observer) {
    if (!this.observers[event]) {
      this.observers[event] = [];
    }
    this.observers[event].push(observer);
  }

  /**
   * Initiate a connection to a certain Peer identified by an unique ID
   * @param {string} peerId The ID of the peer we are connecting to
   * @param {Peer.PeerConnectOption} options Additional connection options to
   * be used during this specific connection
   * @return {Peer.DataConnection}
   */
  connect(peerId, options) {
    this.connection = super.connect(peerId, options);

    this.connection.on('open', () => {
      this.connection.send({opcode: OpCode.CONNECT});
      this.afterConnectionEstablished();
    });

    return this.connection;
  }

  /**
   * Player received a connection from another Peer
   * @param {Peer.DataConnection} connection
   */
  onRemoteConnection(connection) {
    this.connection = connection;
    this.afterConnectionEstablished();
  }

  /**
   *
   */
  afterConnectionEstablished() {
    this.connection.on('data', this.onDataReceived);
    this.observers['onConnectionEstablished'].forEach(observer => {
      observer();
    });
  }

  /**
   *
   * @param {Object} data
   */
  onDataReceived(data) {
    this.observers['onDataReceived'].forEach(observer => {
      observer(data);
    });
  }

  /**
   *
   * @param {Object} message
   */
  send(message) {
    this.connection.send(message);
  }
}

export default Player;