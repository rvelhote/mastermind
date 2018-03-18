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
import WebDHT from "../../game/dht";

class NodeCollection extends React.Component {
    /**
     *
     * @param props
     */
    constructor(props) {
        super(props);

        this.state = {
            nodes: props.dht.toJSON().nodes,
            intervalId: null,
        };

        this.updateNodeList = this.updateNodeList.bind(this);
    }

    /**
     *
     */
    componentDidMount() {
        this.setState({
            intervalId: setInterval(this.updateNodeList, 1000),
        });
    }

    /**
     *
     */
    componentWillUnmount() {
        clearInterval(this.state.intervalId);
    }

    /**
     *
     */
    updateNodeList() {
        const nodes = this.props.dht.toJSON().nodes;
        this.setState(p => {
            p.nodes = nodes;
            return p;
        });
    }

    render() {
        return <div className="card bg-light">
            <div className="card-header">Available Players</div>
            <div className="card-body">
                <ul className="list-group list-group-flush">{
                    this.state.nodes.map((n, i) =>
                        <li className="list-group-item" key={i}>
                            <a href="#connect-to" data-host={n.host} onClick={this.props.onPeerConnect}>{n.host}</a>
                        </li>)
                }
                </ul>
            </div>
        </div>;
    }
}

NodeCollection.displayName = 'NodeCollection';

NodeCollection.propTypes = {};

NodeCollection.defaultProps = {};

export default NodeCollection;