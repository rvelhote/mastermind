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

const style = {
    'display': 'inline-block',
    'border': '1px solid #888',
    'width': '50px',
    'height': '50px'
};


class Configurator extends React.Component {
    /**
     *
     * @param props
     */
    constructor(props) {
        super(props);

        this.state = {
            totalHoles: props.totalHoles,
            totalColors: props.totalColors,
            maxAttempts: props.maxAttempts,
        };

        this.handleChange = this.handleChange.bind(this);
    }

    /**
     *
     * @param event
     */
    handleChange(event) {
        const name = event.target.name;
        const value = event.target.value;

        console.log(name);console.log(value);

        this.setState(previousState => {
            previousState[name] = value;
            return previousState;
        });
    }

    /**
     *
     * @returns {*}
     */
    render() {
        return (
            <form id='configurator' onSubmit={this.props.onSubmitConfiguration}>
                <div>
                    <label htmlFor="total-colors">Colors</label>
                    <select id='total-colors' name='totalColors' value={this.state.totalColors} onChange={this.handleChange}>
                        {
                            [4, 5, 6, 7, 8, 9, 10].map(i => <option key={i} value={i}>{i}</option>)
                        }
                    </select>
                </div>
                <div>
                    <label htmlFor="total-holes">Holes:</label>
                    <select id='total-holes' name='totalHoles' value={this.state.totalHoles} onChange={this.handleChange}>
                        {
                            [4, 5, 6].map(i => <option key={i} value={i}>{i}</option>)
                        }
                    </select>
                </div>
                <div>
                    <label htmlFor="max-attempts">Max. Attempts:</label>
                    <select id='max-attempts' name='maxAttempts' value={this.state.maxAttempts} onChange={this.handleChange}>
                        {
                            [5, 6, 7, 8, 9, 10].map(i => <option key={i} value={i}>{i}</option>)
                        }
                    </select>
                </div>
                <button type='submit'>Configure</button>
            </form>
        );
    }
}

Configurator.displayName = 'Configurator';

Configurator.propTypes = {};

Configurator.defaultProps = {};

export default Configurator;