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
import PropTypes from 'prop-types';

class NodeConnect extends React.Component {
    /**
     *
     * @param props
     */
    constructor(props) {
        super(props);

        this.state = {connectTo: ''};

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    /**
     *
     * @param event
     */
    handleSubmit(event) {
        this.props.onPeerConnect(this.state.connectTo);
        event.preventDefault();
    }

    /**
     *
     * @param event
     */
    handleChange(event) {
        this.setState({connectTo: event.target.value});
    }

    render() {
        return <form className="inline-form connect-to-form" onSubmit={this.handleSubmit}>
            <div className="form-group">
                        <div className="input-group">
                            <input placeholder="The identifier of the peer that you want to connect to..." disabled={this.props.status !== 0} type="text" className="form-control" value={this.state.value} onChange={this.handleChange}/>
                            <div className="input-group-append">
                                <button disabled={this.state.connectTo.length === 0 || this.props.status !== 0} className="btn btn-primary" type="submit">Connect to another PEER</button>
                            </div>
                        </div>
                    </div>
                </form>;
    }
}

NodeConnect.displayName = 'NodeConnect';

NodeConnect.propTypes = {
    status: PropTypes.number,
    onPeerConnect: PropTypes.func
};

NodeConnect.defaultProps = {};

export default NodeConnect;