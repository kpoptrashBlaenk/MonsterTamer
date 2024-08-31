import Phaser from '../../lib/phaser.js'
import {HealthBar} from "../ui/health-bar.js";
import {BATTLE_ASSET_KEYS} from "../../assets/asset-keys.js";
import {DataUtils} from "../../utils/data-utils.js";
import {CUSTOM_FONTS} from "../../assets/font-keys.js";

export class BattleMonster {
    /** @type {Phaser.Scene} */
    _scene;
    /** @type {Monster} */
    _monsterDetails;
    /** @type {HealthBar} */
    _healthBar;
    /** @type {Phaser.GameObjects.Image} */
    _phaserGameObject;
    /** @type {number} */
    _currentHealth;
    /** @type {number} */
    _maxHealth;
    /** @type {Attack[]} */
    _monsterAttacks;
    /** @type {number} */
    _baseAttack;
    /** @type {Phaser.GameObjects.Container} */
    _phaserHealthBarGameContainer;
    /** @type {boolean} */
    _skipBattleAnimations;

    /**
     *
     * @param {BattleMonsterConfig} config
     * @param {Coordinate} position
     */
    constructor(config, position) {
        this._scene = config.scene;
        this._monsterDetails = config.monsterDetails;
        this._currentHealth = this._monsterDetails.currentHp;
        this._maxHealth = this._monsterDetails.maxHp;
        this._monsterAttacks = [];
        this._skipBattleAnimations = config.skipBattleAnimations || false;

        this._phaserGameObject = this._scene.add.image(
            position.x,
            position.y,
            this._monsterDetails.assetKey,
            this._monsterDetails.assetFrame || 0
        ).setAlpha(0);

        this.#createHealthBarComponent(config.scaleHealthBarBackgroundImageByY)

        this._monsterDetails.attackIds.forEach(attackId => {
            const monsterAttack = DataUtils.getMonsterAttack(this._scene, attackId);
            if(monsterAttack !== undefined) {
                this._monsterAttacks.push(monsterAttack)
            }
        })
    }

    /** @type {boolean} */
    get isFainted() {
        return this._currentHealth <= 0;
    }

    /** @type {string} */
    get name() {
        return this._monsterDetails.name;
    }

    /** @type {Attack[]} */
    get attacks() {
        return [...this._monsterAttacks];
    }

    /** @type {number} */
    get baseAttack() {
        return this._monsterDetails.baseAttack;
    }

    /** @type {number} */
    get level() {
        return this._monsterDetails.currentLevel;
    }

    /**
     *
     * @param {number} damage
     * @param {() => void} [callback]
     */
    takeDamage(damage, callback) {
        // Avoid negative health
        this._currentHealth -= damage;
        if (this._currentHealth < 0) {
            this._currentHealth = 0;
        }
        this._healthBar.setMeterPercentageAnimated(this._currentHealth / this._maxHealth, {callback})
    }

    /**
     *
     * @param {() => void} callback
     * @returns {void}
     */
    playMonsterTakeDamageAnimation(callback) {
        if(this._skipBattleAnimations) {
            this._phaserGameObject.setAlpha(1)
            callback()
            return;
        }

        this._scene.tweens.add({
            delay: 0,
            duration: 150,
            targets: this._phaserGameObject,
            alpha: 0,
            repeat: 10,
            onComplete: () => {
                this._phaserGameObject.setAlpha(1)
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
        throw new Error('playMonsterDeathAnimation is not implemented.')
    }

    #createHealthBarComponent(scaleHealthBarByBackgroundImageByY = 1) {
        this._healthBar = new HealthBar(this._scene, 34, 34);

        const monsterNameGameText = this._scene.add.text(30, 20, this._monsterDetails.name, {
            fontFamily: CUSTOM_FONTS.POKEROGUE,
            color: '#7E3D3F',
            fontSize: '32px'
        });

        const healthBarBackgroundImage = this._scene.add.image(0, 0, BATTLE_ASSET_KEYS.HEALTH_BAR_BACKGROUND)
            .setOrigin(0)
            .setScale(1, scaleHealthBarByBackgroundImageByY);

        const monsterHealthBarLevelText = this._scene.add.text(monsterNameGameText.width + 35, 23, `L${this.level}`, {
            fontFamily: CUSTOM_FONTS.POKEROGUE,
            color: '#ED474B',
            fontSize: '28px',
            fontWeight: 'bold'
        });
        const monsterHpText = this._scene.add.text(30, 58, 'HP', {
            fontFamily: CUSTOM_FONTS.POKEROGUE,
            color: '#FF6505',
            fontSize: '24px',
            fontStyle: 'italic',
            fontWeight: 'bold'
        });

        this._phaserHealthBarGameContainer = this._scene.add.container(0, 0, [
            healthBarBackgroundImage,
            monsterNameGameText,
            this._healthBar.container,
            monsterHealthBarLevelText,
            monsterHpText
        ]).setAlpha(0);
    }
}