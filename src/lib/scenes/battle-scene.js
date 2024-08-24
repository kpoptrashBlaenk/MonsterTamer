import Phaser from '../phaser.js';
import {SCENE_KEYS} from "./scene-keys.js";
import {
    MONSTER_ASSET_KEYS
} from "../../assets/asset-keys.js";
import {BattleMenu} from "../../battle/menu/battle-menu.js";
import {DIRECTION} from "../../common/direction.js";
import {Background} from "../../battle/background.js";
import {EnemyBattleMonster} from "../../battle/monsters/enemy-battle-monster.js";
import {PlayerBattleMonster} from "../../battle/monsters/player-battle-monster.js";

export class BattleScene extends Phaser.Scene {
    /** @type {BattleMenu} */
    #battleMenu;
    /** @type {Phaser.Types.Input.Keyboard.CursorKeys} */
    #cursorKeys;
    /** @type {EnemyBattleMonster} */
    #activeEnemyMonster;
    /** @type {PlayerBattleMonster} */
    #activePlayerMonster;
    /** @type {number} */
    #activePlayerAttackIndex;

    constructor() {
        super({
            key: SCENE_KEYS.BATTLE_SCENE,
        });
        console.log(SCENE_KEYS.BATTLE_SCENE)
    }

    init() {
        this.#activePlayerAttackIndex = -1;
    }

    create() {
        // Background
        const background = new Background(this);
        background.showForest()

        // Monsters
        this.#activeEnemyMonster = new EnemyBattleMonster({
                scene: this,
                monsterDetails: {
                    name: MONSTER_ASSET_KEYS.CARNODUSK,
                    assetKey: MONSTER_ASSET_KEYS.CARNODUSK,
                    assetFrame: 0,
                    currentLevel: 5,
                    currentHp: 25,
                    maxHp: 25,
                    attackIds: [1, 2],
                    baseAttack: 5
                }
            }
        );
        this.#activePlayerMonster = new PlayerBattleMonster({
                scene: this,
                monsterDetails: {
                    name: MONSTER_ASSET_KEYS.IGUANIGNITE,
                    assetKey: MONSTER_ASSET_KEYS.IGUANIGNITE,
                    assetFrame: 0,
                    currentLevel: 5,
                    currentHp: 25,
                    maxHp: 25,
                    attackIds: [1],
                    baseAttack: 5
                }
            }
        );

        // Create Battle Menu
        this.#battleMenu = new BattleMenu(this, this.#activePlayerMonster);
        //this.#battleMenu.showMainBattleMenu() // Commented out because kinda useless because add already shows it

        this.#cursorKeys = this.input.keyboard.createCursorKeys();
    }

    update() {
        const wasSpaceKeyPressed = Phaser.Input.Keyboard.JustDown(this.#cursorKeys.space)
        if (wasSpaceKeyPressed) {
            this.#battleMenu.handlePlayerInput('OK')

            // Check if player selected an attack, then update display text
            if (this.#battleMenu.selectedAttack === undefined) {
                return;
            }
            this.#activePlayerAttackIndex = this.#battleMenu.selectedAttack

            // Check if selected attack exists
            if (!this.#activePlayerMonster.attacks[this.#activePlayerAttackIndex]) {
                return;
            }

            console.log('attack selected: ' + this.#battleMenu.selectedAttack)
            this.#battleMenu.hideMonsterAttackSubMenu()
            this.#handleBattleSequence()
        }
        if (Phaser.Input.Keyboard.JustDown(this.#cursorKeys.shift)) {
            this.#battleMenu.handlePlayerInput('CANCEL')
            return;
        }

        /** @type {Direction} */
        let selectedDirection = DIRECTION.NONE
        if (this.#cursorKeys.left.isDown) {
            selectedDirection = DIRECTION.LEFT
        } else if (this.#cursorKeys.right.isDown) {
            selectedDirection = DIRECTION.RIGHT
        } else if (this.#cursorKeys.up.isDown) {
            selectedDirection = DIRECTION.UP
        } else if (this.#cursorKeys.down.isDown) {
            selectedDirection = DIRECTION.DOWN
        }

        if (selectedDirection !== DIRECTION.NONE) {
            this.#battleMenu.handlePlayerInput(selectedDirection)
        }
    }

    #handleBattleSequence() {
        // show attack used then pause
        // show attack animation then pause
        // show damage animation then pause
        // show health bar animation then pause
        // repeat for other monster

        this.#playerAttack()
    }

    #playerAttack() {
        this.#battleMenu.updateInfoPaneMessagesAndWaitForInput(
            [
                `${this.#activePlayerMonster.name} used ${this.#activePlayerMonster.attacks[this.#activePlayerAttackIndex].name}`
            ],
            () => {
                this.time.delayedCall(500, () => {
                    this.#activeEnemyMonster.takeDamage(5, () => {
                        this.#enemyAttack()
                    })
                })
            })
    }

    #enemyAttack() {
        this.#battleMenu.updateInfoPaneMessagesAndWaitForInput([`${this.#activeEnemyMonster.name} used ${this.#activeEnemyMonster.attacks[0].name}`], () => {
            this.time.delayedCall(500, () => {
                this.#activePlayerMonster.takeDamage(20, () => {
                    this.#battleMenu.showMainBattleMenu()
                })
            })
        })
    }
}