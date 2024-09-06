import {BattleMonster} from "./battle-monster.ts";
import {CUSTOM_FONTS} from "../../assets/font-keys.ts";
import {BattleMonsterConfig, Coordinate} from "../../types/typedef.ts";

const PLAYER_POSITION: Coordinate = Object.freeze({
    x: 256,
    y: 316
})

export class PlayerBattleMonster extends BattleMonster {
    private healthBarTextGameObject: Phaser.GameObjects.Text;

    constructor(config: BattleMonsterConfig) {
        super(config, PLAYER_POSITION);
        this._phaserGameObject.setFlipX(true)
        this._phaserHealthBarGameContainer.setPosition(556, 318)

        this.addHealthBarComponent()
    }

    playMonsterAppearAnimation(callback: () => void): void {
        const startXPosition: number = 1024;
        const endXPosition: number = PLAYER_POSITION.x;
        this._phaserGameObject.setPosition(startXPosition, PLAYER_POSITION.y)
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
        const startXPosition: number = 1024;
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
        const endYPosition: number = this._phaserGameObject.y + 400;

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

    private setHealthBarText(): void {
        this.healthBarTextGameObject.setText(`${this._currentHealth}/${this._maxHealth}`)
    }

    private addHealthBarComponent(): void {
        this.healthBarTextGameObject = this._scene.add.text(443, 80, '', {
            fontFamily: CUSTOM_FONTS.POKEROGUE,
            color: '7E3D3F',
            fontSize: '16px'
        }).setOrigin(1, 0);
        this.setHealthBarText()

        this._phaserHealthBarGameContainer.add(this.healthBarTextGameObject)
    }

    takeDamage(damage: number, callback: () => void): void {
        super.takeDamage(damage, callback)
        this.setHealthBarText()
    }
}