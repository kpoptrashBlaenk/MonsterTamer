import {HealthBar} from "../ui/health-bar"
import {BATTLE_ASSET_KEYS} from "../../assets/asset-keys"
import {DataUtils} from "../../utils/data-utils"
import {CUSTOM_FONTS} from "../../assets/font-keys"
import {BattleMonsterConfig, Coordinate, Monster, Attack} from "../../types/typedef"

export class BattleMonster {
    protected scene: Phaser.Scene
    protected monsterDetails: Monster
    protected healthBar: HealthBar
    protected phaserGameObject: Phaser.GameObjects.Image
    protected currentHealth: number
    protected maxHealth: number
    protected monsterAttacks: Attack[]
    protected phaserHealthBarGameContainer: Phaser.GameObjects.Container
    protected skipBattleAnimations: boolean

    constructor(config: BattleMonsterConfig, position: Coordinate) {
        this.scene = config.scene
        this.monsterDetails = config.monsterDetails
        this.currentHealth = this.monsterDetails.currentHp
        this.maxHealth = this.monsterDetails.maxHp
        this.monsterAttacks = []
        this.skipBattleAnimations = config.skipBattleAnimations || false

        this.phaserGameObject = this.scene.add.image(
            position.x,
            position.y,
            this.monsterDetails.assetKey,
            this.monsterDetails.assetFrame ?? 0
        ).setAlpha(0)

        this.createHealthBarComponent(config.scaleHealthBarBackgroundImageByY)
        this.healthBar.setMeterPercentage(this.currentHealth / this.maxHealth)

        this.monsterDetails.attackIds.forEach(attackId => {
            const monsterAttack = DataUtils.getMonsterAttack(this.scene, attackId)
            if (monsterAttack !== undefined) {
                this.monsterAttacks.push(monsterAttack)
            }
        })
    }

    public get isFainted(): boolean {
        return this.currentHealth <= 0
    }

    public get name(): string {
        return this.monsterDetails.name
    }

    public get attacks(): Attack[] {
        return [...this.monsterAttacks]
    }

    public get baseAttack(): number {
        return this.monsterDetails.baseAttack
    }

    public get level(): number {
        return this.monsterDetails.currentLevel
    }

    public takeDamage(damage: number, callback: () => void): void {
        // Avoid negative health
        this.currentHealth -= damage
        if (this.currentHealth < 0) {
            this.currentHealth = 0
        }
        this.healthBar.setMeterPercentageAnimated(this.currentHealth / this.maxHealth, {callback})
    }

    public playMonsterTakeDamageAnimation(callback: () => void): void {
        if (this.skipBattleAnimations) {
            this.phaserGameObject.setAlpha(1)
            callback()
            return
        }

        this.scene.tweens.add({
            delay: 0,
            duration: 150,
            targets: this.phaserGameObject,
            alpha: 0,
            repeat: 5,
            onComplete: () => {
                this.phaserGameObject.setAlpha(1)
                callback()
            }
        })
    }

    public playMonsterDeathAnimation(callback: () => void): void {
        // probably going to do a fade out
        console.log(callback)
        throw new Error('playMonsterDeathAnimation is not implemented.')
    }

    private createHealthBarComponent(scaleHealthBarByBackgroundImageByY: number = 1): void {
        this.healthBar = new HealthBar(this.scene, 34, 34)

        const monsterNameGameText = this.scene.add.text(30, 20, this.monsterDetails.name, {
            fontFamily: CUSTOM_FONTS.POKEROGUE,
            color: '#7E3D3F',
            fontSize: '32px'
        })

        const healthBarBackgroundImage = this.scene.add.image(0, 0, BATTLE_ASSET_KEYS.HEALTH_BAR_BACKGROUND)
            .setOrigin(0)
            .setScale(1, scaleHealthBarByBackgroundImageByY)

        const monsterHealthBarLevelText = this.scene.add.text(monsterNameGameText.width + 35, 23, `L${this.level}`, {
            fontFamily: CUSTOM_FONTS.POKEROGUE,
            color: '#ED474B',
            fontSize: '28px'
        })
        const monsterHpText = this.scene.add.text(30, 54, 'HP', {
            fontFamily: CUSTOM_FONTS.POKEROGUE,
            color: '#FF6505',
            fontSize: '24px',
            fontStyle: 'italic'
        })

        this.phaserHealthBarGameContainer = this.scene.add.container(0, 0, [
            healthBarBackgroundImage,
            monsterNameGameText,
            this.healthBar.container,
            monsterHealthBarLevelText,
            monsterHpText
        ]).setAlpha(0)
    }
}