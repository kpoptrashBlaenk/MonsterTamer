import {BattleMonster} from "./battle-monster.js";

/**
 *
 * @type {Coordinate}
 */
const PLAYER_POSITION = Object.freeze({
    x: 256,
    y: 316
})

export class PlayerBattleMonster extends BattleMonster {
    /** @type {Phaser.GameObjects.Text} */
    #healthBarTextGameObject;

    /**
     *
     * @param {BattleMonsterConfig} config
     */
    constructor(config) {
        super(config, PLAYER_POSITION);
        this._phaserGameObject.setFlipX(true)
        this._phaserHealthBarGameContainer.setPosition(556, 318)

        this.#addHealthBarComponent()
    }

    #setHealthBarText() {
        this.#healthBarTextGameObject.setText(`${this._currentHealth}/${this._maxHealth}`)
    }

    #addHealthBarComponent() {
        this.#healthBarTextGameObject = this._scene.add.text(443, 80, '', {
            color: '#7E3D3F',
            fontSize: '16px'
        }).setOrigin(1, 0);
        this.#setHealthBarText()

        this._phaserHealthBarGameContainer.add(this.#healthBarTextGameObject)
    }

    /**
     *
     * @param {number} damage
     * @param {() => void} [callback]
     */
    takeDamage(damage, callback) {
        super.takeDamage(damage, callback)
        this.#setHealthBarText()
    }
}