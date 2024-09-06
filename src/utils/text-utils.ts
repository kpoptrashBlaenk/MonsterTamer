import Phaser from '../lib/phaser.ts'

/**
 * @typedef AnimateTextConfig
 * @type {Object}
 * @property {() => void} [callback]
 * @property {number} [delay=100]
 */

/**
 *
 * @param {Phaser.Scene} scene Scene to pass on
 * @param {Phaser.GameObjects.Text} target Where to put the text
 * @param {string} text The text to animate
 * @param {AnimateTextConfig} [config]
 */
export function animateText(scene, target, text, config) {
    const length = text.length;
    let i = 0;
    scene.time.addEvent({
        callback: () => {
            target.text += text[i];
            i++;
            if(i === length - 1 && config?.callback) {
                config.callback()
            }
        },
        repeat: length - 1,
        delay: config.delay || 50,
    })
}