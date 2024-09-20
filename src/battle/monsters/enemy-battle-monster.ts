import {BattleMonster} from "./battle-monster";
import {BattleMonsterConfig, Coordinate} from "../../types/typedef";

const ENEMY_POSITION: Coordinate = Object.freeze({
    x: 769,
    y: 144
})

export class EnemyBattleMonster extends BattleMonster {

    constructor(config: BattleMonsterConfig) {
        super({...config, scaleHealthBarBackgroundImageByY: 0.8}, ENEMY_POSITION);
    }

    public playMonsterAppearAnimation(callback: () => void): void {
        const startXPosition: number = -100;
        const endXPosition: number = ENEMY_POSITION.x;
        this.phaserGameObject.setPosition(startXPosition, ENEMY_POSITION.y)
        this.phaserGameObject.setAlpha(1)

        if (this.skipBattleAnimations) {
            this.phaserGameObject.setX(endXPosition)
            callback()
            return;
        }

        this.scene.tweens.add({
            delay: 0,
            duration: 1000,
            targets: this.phaserGameObject,
            // Note: For some reason x can't be an Object with {from, start, end}
            x: endXPosition,
            onComplete: () => {
                callback()
            }
        })
    }

    public playMonsterHealthBarAppearAnimation(callback: () => void): void {
        const startXPosition = -600;
        const endXPosition: number = this.phaserHealthBarGameContainer.x;
        this.phaserHealthBarGameContainer.setPosition(startXPosition, this.phaserHealthBarGameContainer.y)
        this.phaserHealthBarGameContainer.setAlpha(1)

        if (this.skipBattleAnimations) {
            this.phaserHealthBarGameContainer.setX(endXPosition)
            callback()
            return;
        }

        this.scene.tweens.add({
            delay: 0,
            duration: 500,
            targets: this.phaserHealthBarGameContainer,
            // Note: For some reason x can't be an Object with {from, start, end}
            x: endXPosition,
            onComplete: () => {
                callback()
            }
        })
    }

    public playMonsterDeathAnimation(callback: () => void): void {
        const endYPosition: number = this.phaserGameObject.y - 400;

        if (this.skipBattleAnimations) {
            this.phaserGameObject.setY(endYPosition)
            callback()
            return;
        }

        this.scene.tweens.add({
            delay: 0,
            duration: 1000,
            targets: this.phaserGameObject,
            // Note: For some reason y can't be an Object with {from, start, end}
            y: endYPosition,
            onComplete: () => {
                callback()
            }
        })
    }
}