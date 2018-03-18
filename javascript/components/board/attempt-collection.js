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
import ColorDisplay from './color-display';
import FeedbackDisplay from './feedback-display';

const style1 = {
    display: 'inline-block',
};

const AttemptCollection = props =>
    <div className="card border-secondary">
        <div className="card-header">{props.attempts.length}/{props.max} attempts</div>
        <div className="card-body">
            {
                props.attempts.map((attempt, index) =>
                    <div key={index}>
                        <div style={style1}>
                            <ColorDisplay colors={attempt.attempt}/>
                        </div>
                        <div style={style1}>
                            <FeedbackDisplay feedback={attempt.feedback}/>
                        </div>

                        <hr />
                    </div>
                )
            }
        </div>
    </div>;

AttemptCollection.displayName = 'AttemptCollection';

AttemptCollection.propTypes = {};

AttemptCollection.defaultProps = {};

export default AttemptCollection;