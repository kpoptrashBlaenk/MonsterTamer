import {BattleMonster} from "./battle-monster.ts";
import {BattleMonsterConfig, Coordinate} from "../../types/typedef.ts";

const ENEMY_POSITION: Coordinate = Object.freeze({
    x: 769,
    y: 144
})

export class EnemyBattleMonster extends BattleMonster {

    constructor(config: BattleMonsterConfig) {
        super({...config, scaleHealthBarBackgroundImageByY: 0.8}, ENEMY_POSITION);
    }

    playMonsterAppearAnimation(callback: () => void): void {
        const startXPosition: number = -100;
        const endXPosition: number = ENEMY_POSITION.x;
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

    playMonsterHealthBarAppearAnimation(callback: () => void): void {
        const startXPosition = -600;
        const endXPosition: number = this._phaserHealthBarGameContainer.x;
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

    playMonsterDeathAnimation(callback: () => void): void {
        const endYPosition: number = this._phaserGameObject.y - 400;

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