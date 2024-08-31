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
import {StateMachine} from "../../utils/state-machine.js";
import {SKIP_BATTLE_ANIMATIONS} from "../../config.js";
import {IceShard} from "../../battle/attacks/ice-shard.js";
import {Slash} from "../../battle/attacks/slash.js";

const BATTLE_STATES = Object.freeze({
    INTRO: 'INTRO',
    PRE_BATTLE_INFO: 'PRE_BATTLE_INFO',
    BRING_OUT_MONSTER: 'BRING_OUT_MONSTER',
    PLAYER_INPUT: 'PLAYER_INPUT',
    ENEMY_INPUT: 'ENEMY_INPUT',
    BATTLE: 'BATTLE',
    POST_ATTACK_CHECK: 'POST_ATTACK_CHECK',
    FINISHED: 'FINISHED',
    FLEE_ATTEMPT: 'FLEE_ATTEMPT'
})

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
    /** @type {StateMachine} */
    #battleStateMachine

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
                    baseAttack: 25
                }, skipBattleAnimations: SKIP_BATTLE_ANIMATIONS
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
                    attackIds: [1, 2],
                    baseAttack: 15
                }, skipBattleAnimations: SKIP_BATTLE_ANIMATIONS
            }
        );

        // Create Battle Menu
        this.#battleMenu = new BattleMenu(this, this.#activePlayerMonster);
        this.#battleMenu.hideMonsterAttackSubMenu()
        this.#battleMenu.hideMainBattleMenu()

        // Add and then Set State Machine
        this.#createBattleStateMachine()

        this.#cursorKeys = this.input.keyboard.createCursorKeys();

        const atk = new Slash(this, {x: 745, y: 140})
        atk.playAnimation()
    }

    update() {
        this.#battleStateMachine.update()

        const wasSpaceKeyPressed = Phaser.Input.Keyboard.JustDown(this.#cursorKeys.space)

        if (wasSpaceKeyPressed && (
            this.#battleStateMachine.currentStateName === BATTLE_STATES.PRE_BATTLE_INFO ||
            this.#battleStateMachine.currentStateName === BATTLE_STATES.POST_ATTACK_CHECK ||
            this.#battleStateMachine.currentStateName === BATTLE_STATES.BRING_OUT_MONSTER ||
            this.#battleStateMachine.currentStateName === BATTLE_STATES.FLEE_ATTEMPT
        )) {
            this.#battleMenu.handlePlayerInput('OK')
            return;
        }

        if (this.#battleStateMachine.currentStateName !== BATTLE_STATES.PLAYER_INPUT) {
            return;
        }

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

            console.log('Attack selected: ' + this.#battleMenu.selectedAttack)
            this.#battleMenu.hideMonsterAttackSubMenu()
            this.#battleStateMachine.setState(BATTLE_STATES.ENEMY_INPUT)
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

    #playerAttack() {
        if (this.#activePlayerMonster.isFainted) {
            return;
        }

        this.#battleMenu.updateInfoPaneMessagesNoInputRequired(
            `${this.#activePlayerMonster.name} used ${this.#activePlayerMonster.attacks[this.#activePlayerAttackIndex].name}`,
            () => {
                this.time.delayedCall(1200, () => {
                    this.#activeEnemyMonster.playMonsterTakeDamageAnimation(() => {
                        this.#activeEnemyMonster.takeDamage(this.#activePlayerMonster.baseAttack, () => {
                            this.#enemyAttack()
                        })
                    })
                })
            }, SKIP_BATTLE_ANIMATIONS)
    }

    #enemyAttack() {
        if (this.#activeEnemyMonster.isFainted) {
            this.#battleStateMachine.setState(BATTLE_STATES.POST_ATTACK_CHECK)
            return;
        }

        this.#battleMenu.updateInfoPaneMessagesNoInputRequired(
            `${this.#activeEnemyMonster.name} used ${this.#activeEnemyMonster.attacks[0].name}`,
            () => {
                this.time.delayedCall(1200, () => {
                    this.#activePlayerMonster.playMonsterTakeDamageAnimation(() => {
                        this.#activePlayerMonster.takeDamage(this.#activeEnemyMonster.baseAttack, () => {
                            this.#battleStateMachine.setState(BATTLE_STATES.POST_ATTACK_CHECK)
                        })
                    })
                })
            }, SKIP_BATTLE_ANIMATIONS)
    }

    #postBattleSequenceCheck() {
        if (this.#activeEnemyMonster.isFainted) {
            this.#battleMenu.updateInfoPaneMessagesAndWaitForInput([`Wild ${this.#activeEnemyMonster.name} fucking died.`, `${this.#activeEnemyMonster.name} gained experience`], () => {
                this.time.delayedCall(500, () => {
                    this.#activeEnemyMonster.playMonsterDeathAnimation(() => {
                        this.#battleStateMachine.setState(BATTLE_STATES.FINISHED)
                    })
                })
            }, SKIP_BATTLE_ANIMATIONS)
            return;
        }

        if (this.#activePlayerMonster.isFainted) {
            this.#battleMenu.updateInfoPaneMessagesAndWaitForInput([`${this.#activePlayerMonster.name} fainted`, 'You have no more monsters, escaping to safety...'], () => {
                this.#activePlayerMonster.playMonsterDeathAnimation(() => {
                    this.time.delayedCall(500, () => {
                        this.#battleStateMachine.setState(BATTLE_STATES.FINISHED)
                    })
                })
            }, SKIP_BATTLE_ANIMATIONS)
            return;
        }

        this.#battleStateMachine.setState(BATTLE_STATES.PLAYER_INPUT)
    }

    #transitionToNextScene() {
        this.cameras.main.fadeOut(600, 0, 0, 0)
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.start(SCENE_KEYS.BATTLE_SCENE)
        })
    }

    #createBattleStateMachine() {
        this.#battleStateMachine = new StateMachine('battle', this);

        this.#battleStateMachine.addState({
            name: BATTLE_STATES.INTRO,
            onEnter: () => {
                // Wait for any scene setup and transitions to complete
                this.time.delayedCall(500, () => {
                    this.#battleStateMachine.setState(BATTLE_STATES.PRE_BATTLE_INFO)
                })
            }
        })

        this.#battleStateMachine.addState({
            name: BATTLE_STATES.PRE_BATTLE_INFO,
            onEnter: () => {
                // Wait for enemy monster to appear on the screen and notify player about the wild monster
                this.#activeEnemyMonster.playMonsterAppearAnimation(() => {
                    this.#activeEnemyMonster.playMonsterHealthBarAppearAnimation(() => undefined)
                    this.#battleMenu.updateInfoPaneMessagesAndWaitForInput(
                        [`Wild ${this.#activeEnemyMonster.name} appeared`], () => {
                            this.time.delayedCall(500, () => {
                                this.#battleStateMachine.setState(BATTLE_STATES.BRING_OUT_MONSTER)
                            })
                        }, SKIP_BATTLE_ANIMATIONS)
                })
            }
        })

        this.#battleStateMachine.addState({
            name: BATTLE_STATES.BRING_OUT_MONSTER,
            onEnter: () => {
                // Wait for player monster to appear on the screen and notify player about the monster
                this.#battleMenu.updateInfoPaneMessagesAndWaitForInput(
                    [`Go ${this.#activePlayerMonster.name}`], () => {
                        // After animation switch state
                        this.time.delayedCall(500, () => {
                            this.#battleStateMachine.setState(BATTLE_STATES.PLAYER_INPUT)
                        })
                    }, SKIP_BATTLE_ANIMATIONS)
                this.#activePlayerMonster.playMonsterAppearAnimation(() => {
                    this.#activePlayerMonster.playMonsterHealthBarAppearAnimation(() => undefined)
                })
            }
        })

        this.#battleStateMachine.addState({
            name: BATTLE_STATES.PLAYER_INPUT,
            onEnter: () => {
                this.#battleMenu.showMainBattleMenu()
            }
        })

        this.#battleStateMachine.addState({
            name: BATTLE_STATES.ENEMY_INPUT,
            onEnter: () => {
                //TODO: Pick a random move for the enemy monster and have an AI in the future
                this.#battleStateMachine.setState(BATTLE_STATES.BATTLE)
            }
        })

        this.#battleStateMachine.addState({
            name: BATTLE_STATES.BATTLE,
            onEnter: () => {
                // show attack used then pause
                // show attack animation then pause
                // show damage animation then pause
                // show health bar animation then pause
                // repeat for other monster

                this.#playerAttack()
            }
        })

        this.#battleStateMachine.addState({
            name: BATTLE_STATES.POST_ATTACK_CHECK,
            onEnter: () => {
                this.#postBattleSequenceCheck()
            }
        })

        this.#battleStateMachine.addState({
            name: BATTLE_STATES.FINISHED,
            onEnter: () => {
                this.#transitionToNextScene()
            }
        })

        this.#battleStateMachine.addState({
            name: BATTLE_STATES.FLEE_ATTEMPT,
            onEnter: () => {
                this.#battleMenu.updateInfoPaneMessagesAndWaitForInput(['You got away safely'], () => {
                    this.#battleStateMachine.setState(BATTLE_STATES.FINISHED)
                }, SKIP_BATTLE_ANIMATIONS)
            }
        })

        // Start State Machine
        this.#battleStateMachine.setState('INTRO')
    }
}