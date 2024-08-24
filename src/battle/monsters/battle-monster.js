import Phaser from '../../lib/phaser.js'
import {HealthBar} from "../ui/health-bar.js";

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

        this._healthBar = new HealthBar(this._scene, 34, 34);

        this._phaserGameObject = this._scene.add.image(
            position.x,
            position.y,
            this._monsterDetails.assetKey,
            this._monsterDetails.assetFrame || 0
        );
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
        return this._baseAttack;
    }

    /**
     *
     * @param {number} damage
     * @param {() => void} [callback]
     */
    takeDamage(damage, callback) {
        // Avoid negative health
        this._currentHealth -= damage;
        if(this._currentHealth < 0) {
            this._currentHealth = 0;
        }
        this._healthBar.setMeterPercentageAnimated(this._currentHealth / this._maxHealth, {callback})
    }
}