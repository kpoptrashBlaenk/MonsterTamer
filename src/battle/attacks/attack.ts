import Phaser from '../../lib/phaser.ts';

export class Attack {
    /** @type {Phaser.Scene} */
     _scene;
    /** @type {Coordinate} */
    _position;
    /** @type {boolean} */
    _isAnimationPlaying;
    /** @type {Phaser.GameObjects.Sprite | Phaser.GameObjects.Container | undefined} */
    _attackGameObject;

     /**
     * @param {Phaser.Scene} scene
     * @param {Coordinate} position
     */
    constructor(scene, position) {
        this._scene = scene;
        this._position = position;
        this._isAnimationPlaying = false;
        this._attackGameObject = undefined;
    }

    /**
     *
     * @returns {Phaser.GameObjects.Sprite|Phaser.GameObjects.Container|undefined}
     */
    getGameObject() {
        return this._attackGameObject;
    }

    /**
     *
     * @param {() => void} [callback]
     * @returns {void}
     */
    playAnimation(callback) {
        throw new Error("Parent class can't have animations")
    }
}