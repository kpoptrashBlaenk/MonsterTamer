import Phaser from '../../lib/phaser.js'
import {HEALTH_BAR_ASSET_KEYS} from "../../assets/asset-keys.js";

export class HealthBar {
    /** @type {Phaser.Scene} */
    #scene;
    /** @type {Phaser.GameObjects.Container} */
    #healthBarContainer
    /** @type {number} */
    #fullWidth;
    /** @type {number} */
    #scaleY;

    /**
     *
     * @param scene The scene to be added
     * @param x x position of the component
     * @param y <> position of the component
     */
    constructor(scene, x, y) {
        this.#scene = scene;
        this.#fullWidth = 360;
        this.#scaleY = 0.7

        this.#healthBarContainer = this.#scene.add.container(x, y, []);
        this.#createHealthBarImages(x, y)
    }

    get container() {
        return this.#healthBarContainer
    }

    /**
     *
     * @param {number} x x position of Health Bar Container
     * @param {number} y y position of Health Bar Container
     * @returns {void}
     */
    #createHealthBarImages(x, y) {
        const leftCap = this.#scene.add.image(x, y, HEALTH_BAR_ASSET_KEYS.LEFT_CAP)
            .setOrigin(0, 0.5)
            .setScale(1, this.#scaleY)
        const middle = this.#scene.add.image(leftCap.x + leftCap.width, y, HEALTH_BAR_ASSET_KEYS.MIDDLE)
            .setOrigin(0, 0.5)
            .setScale(1, this.#scaleY)
        middle.displayWidth = this.#fullWidth
        const rightCap = this.#scene.add.image(middle.x + middle.displayWidth, y, HEALTH_BAR_ASSET_KEYS.RIGHT_CAP)
            .setOrigin(0, 0.5)
            .setScale(1, this.#scaleY)

        this.#healthBarContainer.add([leftCap, middle, rightCap])
    }
}