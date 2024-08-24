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
    /** @type {Phaser.GameObjects.Image} */
    #leftCap;
    /** @type {Phaser.GameObjects.Image} */
    #middle;
    /** @type {Phaser.GameObjects.Image} */
    #rightCap;


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
        this.setMeterPercentage(1)
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
        this.#leftCap = this.#scene.add.image(x, y, HEALTH_BAR_ASSET_KEYS.LEFT_CAP)
            .setOrigin(0, 0.5)
            .setScale(1, this.#scaleY)
        this.#middle = this.#scene.add.image(this.#leftCap.x + this.#leftCap.width, y, HEALTH_BAR_ASSET_KEYS.MIDDLE)
            .setOrigin(0, 0.5)
            .setScale(1, this.#scaleY)
        this.#middle.displayWidth = this.#fullWidth
        this.#rightCap = this.#scene.add.image(this.#middle.x + this.#middle.displayWidth, y, HEALTH_BAR_ASSET_KEYS.RIGHT_CAP)
            .setOrigin(0, 0.5)
            .setScale(1, this.#scaleY)

        this.#healthBarContainer.add([this.#leftCap, this.#middle, this.#rightCap])
    }

    setMeterPercentage(percent = 1) {
        // noinspection UnnecessaryLocalVariableJS
        const width = this.#fullWidth * percent;

        this.#middle.displayWidth = width;
        this.#rightCap.x = this.#middle.x + this.#middle.displayWidth;
    }

    setMeterPercentageAnimated(percent = 1, options) {
        const width = this.#fullWidth * percent;

        this.#scene.tweens.add({
            targets: this.#middle,
            displayWidth: width,
            duration: options?.duration || 1000,
            ease: Phaser.Math.Easing.Sine.Out,
            onUpdate: () => {
                this.#rightCap.x = this.#middle.x + this.#middle.displayWidth;
                const isVisible = this.#middle.displayWidth > 0;
                this.#leftCap.visible = isVisible;
                this.#rightCap.visible = isVisible;
            },
            onComplete: options?.callback
        })
    }
}