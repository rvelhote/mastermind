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

const FEEDBACK_CORRECT = 'correct';
const FEEDBACK_EXISTS = 'exists';
const FEEDBACK_EMPTY = 'failure';

/**
 * Each guess is made by placing a row of code pegs on the decoding board. Once placed, the codemaker provides
 * feedback by placing from zero to four key pegs in the small holes of the row with the guess. A colored or black
 * key peg is placed for each code peg from the guess which is correct in both color and position. A white key peg
 * indicates the existence of a correct color code peg placed in the wrong position.
 *
 * If there are duplicate colours in the guess, they cannot all be awarded a key peg unless they correspond to the
 * same number of duplicate colours in the hidden code. For example, if the hidden code is white-white-black-black
 * and the player guesses white-white-white-black, the codemaker will award two colored key pegs for the two
 * correct whites, nothing for the third white as there is not a third white in the code, and a colored key peg
 * for the black. No indication is given of the fact that the code also includes a second black.
 *
 * @param secret
 * @param attempt
 * @returns {{}}
 */
function verify(secret, attempt) {
    const feedback = [];

    const maximums = {
        red: 0,
        blue: 0,
        green: 0,
        purple: 0,
        yellow: 0,
        orange: 0,
    };

    const collected = {
        red: 0,
        blue: 0,
        green: 0,
        purple: 0,
        yellow: 0,
        orange: 0,
    };

    secret.forEach((s, i) => {
        maximums[s]++;
    });

    attempt.forEach((s, i) => {
        if(s === secret[i]) {
            feedback.push(FEEDBACK_CORRECT);
        } else if(secret.indexOf(s) !== -1 && collected[s] < maximums[s]) {
            feedback.push(FEEDBACK_EXISTS);
        } else {
            feedback.push(FEEDBACK_EMPTY);
        }

        collected[s]++;
    });

    return feedback.sort();
}

/**
 *
 * @param feedback
 * @returns {boolean}
 */
function isCorrect(feedback) {
    return feedback.length === 4 && feedback.filter((value, index, self) => self.indexOf(value) === index).length === 1;
}

export default { verify, isCorrect }