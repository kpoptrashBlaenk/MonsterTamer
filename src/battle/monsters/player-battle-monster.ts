import {BattleMonster} from "./battle-monster"
import {CUSTOM_FONTS} from "../../assets/font-keys"
import {BattleMonsterConfig, Coordinate, Monster} from "../../types/typedef"
import {ExpBar} from "../../common/exp-bar"
import {calculateExpBarCurrentValue, handleMonsterGainingExperience, StatChanges} from "../../utils/leveling-utils"

const PLAYER_POSITION: Coordinate = Object.freeze({
    x: 256,
    y: 316
})

export class PlayerBattleMonster extends BattleMonster {
    private healthBarTextGameObject: Phaser.GameObjects.Text
    private expBar: ExpBar

    constructor(config: BattleMonsterConfig) {
        super(config, PLAYER_POSITION)
        this.phaserGameObject.setFlipX(true)
        this.phaserHealthBarGameContainer.setPosition(556, 318)

        this.addHealthBarComponent()
        this.addExpBarComponent()
    }

    private setHealthBarText(): void {
        this.healthBarTextGameObject.setText(`${this.currentHealth}/${this.maxHealth}`)
    }

    private addHealthBarComponent(): void {
        this.healthBarTextGameObject = this.scene.add.text(443, 80, '', {
            fontFamily: CUSTOM_FONTS.POKEROGUE,
            color: '7E3D3F',
            fontSize: '16px'
        }).setOrigin(1, 0)
        this.setHealthBarText()

        this.phaserHealthBarGameContainer.add(this.healthBarTextGameObject)
    }

    public takeDamage(damage: number, callback: () => void): void {
        super.takeDamage(damage, callback)
        this.setHealthBarText()
    }

    public playMonsterAppearAnimation(callback: () => void): void {
        const startXPosition: number = -30 // 1024
        const endXPosition: number = PLAYER_POSITION.x
        this.phaserGameObject.setPosition(startXPosition, PLAYER_POSITION.y)
        this.phaserGameObject.setAlpha(1)

        if (this.skipBattleAnimations) {
            this.phaserGameObject.setX(endXPosition)
            callback()
            return
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
        const startXPosition: number = 800 // 1024
        const endXPosition: number = this.phaserHealthBarGameContainer.x
        this.phaserHealthBarGameContainer.setPosition(startXPosition, this.phaserHealthBarGameContainer.y)
        this.phaserHealthBarGameContainer.setAlpha(1)

        if (this.skipBattleAnimations) {
            this.phaserHealthBarGameContainer.setX(endXPosition)
            callback()
            return
        }

        this.scene.tweens.add({
            delay: 0,
            duration: 500,
            targets: this.phaserHealthBarGameContainer,
            x: endXPosition,
            onComplete: () => {
                callback()
            }
        })
    }

    public playMonsterDeathAnimation(callback: () => void): void {
        const startYPosition = this.phaserGameObject.y
        const endYPosition = startYPosition + 400
        const healthBarStartXPosition = this.phaserGameObject.x
        const healthBarEndXPosition = healthBarStartXPosition + 1200

        if (this.skipBattleAnimations) {
            this.phaserGameObject.setY(endYPosition)
            this.phaserHealthBarGameContainer.setAlpha(0)
            callback()
            return
        }

        this.scene.tweens.add({
            delay: 0,
            duration: 1000,
            targets: this.phaserGameObject,
            y: endYPosition,
            onComplete: () => {
                callback()
            }
        })

        this.scene.tweens.add({
            delay: 0,
            duration: 2000,
            x: healthBarEndXPosition,
            targets: this.phaserHealthBarGameContainer,
            onComplete: () => {
                this.phaserHealthBarGameContainer.setAlpha(0)
                this.phaserHealthBarGameContainer.setX(healthBarStartXPosition)
            },
        })
    }

    public updateMonsterHealth(updatedHp: number): void {
        this.currentHealth = updatedHp
        if (this.currentHealth > this.maxHealth) {
            this.currentHealth = this.maxHealth
        }
        this.healthBar.setMeterPercentageAnimated(this.currentHealth / this.maxHealth, {
            skipBattleAnimations: true,
        })
        this.setHealthBarText()
    }

    private addExpBarComponent() {
        this.expBar = new ExpBar(this.scene, 34, 54)
        this.expBar.setMeterPercentageAnimated(
            calculateExpBarCurrentValue(this.monsterDetails.currentLevel, this.monsterDetails.currentExp),
            {skipBattleAnimations: true}
        )

        const monsterExpText = this.scene.add.text(30, 100, 'EXP', {
            fontFamily: CUSTOM_FONTS.POKEROGUE,
            color: '6505FF',
            fontSize: '14px',
            fontStyle: 'italic',
        })

        this.phaserHealthBarGameContainer.add([monsterExpText, this.expBar.getContainer])
    }

    updateMonsterExp(gainedExp: number): StatChanges | undefined {
        return handleMonsterGainingExperience(this.monsterDetails, gainedExp)
    }

    public updateMonsterExpBar(leveledUp: boolean, skipBattleAnimations: boolean, callback = () => {
    }): void {
        const cb = () => {
            this.setMonsterLevelText()
            this.maxHealth = this.monsterDetails.maxHp
            this.updateMonsterHealth(this.currentHealth)
            callback()
        }

        if (leveledUp) {
            this.expBar.setMeterPercentageAnimated(1, {
                callback: () => {
                    this.scene.time.delayedCall(500, () => {
                        this.expBar.setMeterPercentageAnimated(0, {skipBattleAnimations: true})
                        this.expBar.setMeterPercentageAnimated(
                            calculateExpBarCurrentValue(this.monsterDetails.currentLevel, this.monsterDetails.currentExp),
                            {callback: cb}
                        )
                    })
                }
            })
            return
        }

        this.expBar.setMeterPercentageAnimated(
            calculateExpBarCurrentValue(this.monsterDetails.currentLevel, this.monsterDetails.currentExp),
            {callback: cb}
        )
    }

    switchMonster(monster: Monster): void {
        super.switchMonster(monster)
        this.setHealthBarText()
        this.updateMonsterExpBar(false, true, undefined)
    }
}