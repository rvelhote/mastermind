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

const colors = [
    'red',
    'blue',
    'green',
    'purple',
    'yellow',
    'orange',
];

class ColorSelection extends React.Component {
    /**
     *
     * @param props
     */
    constructor(props) {
        super(props);
        this.onColorClick = this.onColorClick.bind(this);

        this.state = {
            choice: [
                '',
                '',
                '',
                '',
            ],
            allChosen: false,
        }
    }

    onColorClick(event) {
        event.preventDefault();

        if (this.props.isDisabled) {
            return false;
        }

        const target = event.target;

        let selectedColor = this.state.choice[target.dataset.index];
        let selectedColorIndex = selectedColor.length === 0 ? 0 : colors.indexOf(selectedColor) + 1;

        if (selectedColorIndex === colors.length) {
            selectedColorIndex = 0;
        }

        this.setState(prevState => {
            prevState.choice[target.dataset.index] = colors[selectedColorIndex];
            prevState.allChosen = prevState.choice.filter(a => a.length !== 0).length === 4;
            return prevState;
        });
    }

    render() {
        return <form onSubmit={this.props.submit}>
            <div className="row">
                {
                    this.state.choice.map((color, index) =>
                        <div className='col'>
                        <div onClick={this.onColorClick}
                             className={'circle ' + color}
                             data-index={index}
                             key={index}>
                            <input type="hidden" name="choice" value={color}/>
                        </div>
                        </div>
                    )
                }
            </div>
                <div>
                    <br/>
                    <button disabled={!this.state.allChosen} className="btn btn-primary btn-lg btn-block" type="submit">Choose Secret</button>
                </div>

        </form>;
    }
}


ColorSelection.displayName = 'ColorSelection';

ColorSelection.propTypes = {};

ColorSelection.defaultProps = {};

export default ColorSelection;