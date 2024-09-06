import Phaser from "../lib/phaser.ts";
import {DIRECTION} from "../common/direction.ts";

export class Controls {
    /** @type {Phaser.Scene} */
    #scene;
    /** @type {Phaser.Types.Input.Keyboard.CursorKeys} */
    #cursorKeys;
    /** @type {boolean} */
    #lockPlayerInput;

    /**
     *
     * @param {Phaser.Scene} scene
     */
    constructor(scene) {
        this.#scene = scene;
        this.#cursorKeys = this.#scene.input.keyboard.createCursorKeys();
        this.#lockPlayerInput = false;
    }

    getIsInputLocked() {
        return this.#lockPlayerInput;
    }

    /**
     *
     * @param {boolean} value
     * @returns {() => void}
     */
    setLockInput(value) {
        this.#lockPlayerInput = value;
    }

    /**
     *
     * @returns {boolean}
     */
    wasSpaceKeyPressed() {
        if (this.#cursorKeys === undefined) {
            return false;
        }
        return Phaser.Input.Keyboard.JustDown(this.#cursorKeys.space);
    }

    /**
     *
     * @returns {boolean}
     */
    wasBackKeyPressed() {
        if (this.#cursorKeys === undefined) {
            return false;
        }
        return Phaser.Input.Keyboard.JustDown(this.#cursorKeys.shift);
    }

    /**
     *
     * @returns {DIRECTION}
     */
    getDirectionKeyPressedDown() {
        if (this.#cursorKeys === undefined) {
            return DIRECTION.NONE;
        }

        /** @type {Direction} */
        let selectedDirection = DIRECTION.NONE
        if (this.#cursorKeys.left.isDown) {
            selectedDirection = DIRECTION.LEFT
        } else if (this.#cursorKeys.right.isDown) {
            selectedDirection = DIRECTION.RIGHT
        } else if (this.#cursorKeys.up.isDown) {
            selectedDirection = DIRECTION.UP
        } else if (this.#cursorKeys.down.isDown) {
            selectedDirection = DIRECTION.DOWN
        }

        return selectedDirection;
    }

    /**
     *
     * @returns {DIRECTION}
     */
    getDirectionKeyJustDown() {
        if (this.#cursorKeys === undefined) {
            return DIRECTION.NONE;
        }

        /** @type {Direction} */
        let selectedDirection = DIRECTION.NONE
        if (Phaser.Input.Keyboard.JustDown(this.#cursorKeys.left)) {
            selectedDirection = DIRECTION.LEFT
        } else if (Phaser.Input.Keyboard.JustDown(this.#cursorKeys.right)) {
            selectedDirection = DIRECTION.RIGHT
        } else if (Phaser.Input.Keyboard.JustDown(this.#cursorKeys.up)) {
            selectedDirection = DIRECTION.UP
        } else if (Phaser.Input.Keyboard.JustDown(this.#cursorKeys.down)) {
            selectedDirection = DIRECTION.DOWN
        }

        return selectedDirection;
    }


}