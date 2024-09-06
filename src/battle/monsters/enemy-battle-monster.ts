import {BattleMonster} from "./battle-monster.ts";

/** @type {Coordinate} */
const ENEMY_POSITION = Object.freeze({
    x: 769,
    y: 144
})

export class EnemyBattleMonster extends BattleMonster {
    /**
     *
     * @param {BattleMonsterConfig} config
     */
    constructor(config) {
        super({...config, scaleHealthBarBackgroundImageByY: 0.8}, ENEMY_POSITION);
    }

    /**
     *
     * @param {() => void} callback
     * @returns {void}
     */
    playMonsterAppearAnimation(callback) {
        const startXPosition = -100;
        const endXPosition = ENEMY_POSITION.x;
        this._phaserGameObject.setPosition(startXPosition, ENEMY_POSITION.y)
        this._phaserGameObject.setAlpha(1)

        if (this._skipBattleAnimations) {
            this._phaserGameObject.setX(endXPosition)
            callback()
            return;
        }

        this._scene.tweens.add({
            delay: 0,
            duration: 1000,
            targets: this._phaserGameObject,
            // Note: For some reason x can't be an Object with {from, start, end}
            x: endXPosition,
            onComplete: () => {
                callback()
            }
        })
    }

    /**
     *
     * @param {() => void} callback
     * @returns {void}
     */
    playMonsterHealthBarAppearAnimation(callback) {
        const startXPosition = -600;
        const endXPosition = this._phaserHealthBarGameContainer.x;
        this._phaserHealthBarGameContainer.setPosition(startXPosition, this._phaserHealthBarGameContainer.y)
        this._phaserHealthBarGameContainer.setAlpha(1)

        if (this._skipBattleAnimations) {
            this._phaserHealthBarGameContainer.setX(endXPosition)
            callback()
            return;
        }

        this._scene.tweens.add({
            delay: 0,
            duration: 500,
            targets: this._phaserHealthBarGameContainer,
            // Note: For some reason x can't be an Object with {from, start, end}
            x: endXPosition,
            onComplete: () => {
                callback()
            }
        })
    }

    /**
     *
     * @param {() => void} callback
     * @returns {void}
     */
    playMonsterDeathAnimation(callback) {
        const endYPosition = this._phaserGameObject.y - 400;

        if (this._skipBattleAnimations) {
            this._phaserGameObject.setY(endYPosition)
            callback()
            return;
        }

        this._scene.tweens.add({
            delay: 0,
            duration: 1000,
            targets: this._phaserGameObject,
            // Note: For some reason y can't be an Object with {from, start, end}
            y: endYPosition,
            onComplete: () => {
                callback()
            }
        })
    }
}