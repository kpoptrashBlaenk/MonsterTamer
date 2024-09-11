// noinspection JSUnusedGlobalSymbols

import Phaser from '../phaser.ts';
import {SCENE_KEYS} from "./scene-keys.ts";
import {
    MONSTER_ASSET_KEYS
} from "../../assets/asset-keys.ts";
import {BattleMenu} from "../../battle/menu/battle-menu.ts";
import {Direction, DIRECTION} from "../../common/direction.ts";
import {Background} from "../../battle/background.ts";
import {EnemyBattleMonster} from "../../battle/monsters/enemy-battle-monster.ts";
import {PlayerBattleMonster} from "../../battle/monsters/player-battle-monster.ts";
import {StateMachine} from "../../utils/state-machine.ts";
import {ATTACK_TARGET, AttackManager} from "../../battle/attacks/attack-manager.ts";
import {sceneTransition} from "../../utils/scene-transition.ts";
import {Controls} from "../../utils/controls.ts";
import {DATA_MANAGER_STORE_KEYS, dataManager} from "../../utils/data-manager.ts";
import {BATTLE_SCENE_OPTIONS} from "../../common/options.ts";

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
    private battleMenu: BattleMenu;
    private activeEnemyMonster: EnemyBattleMonster;
    private activePlayerMonster: PlayerBattleMonster;
    private activePlayerAttackIndex: number;
    private battleStateMachine: StateMachine
    private attackManager: AttackManager;
    private controls: Controls;
    private skipAnimations: boolean;

    constructor() {
        super({
            key: SCENE_KEYS.BATTLE_SCENE,
        });
    }

    init() {
        this.activePlayerAttackIndex = -1;

        const chosenBattleSeenOption: string = dataManager.getStore.get(DATA_MANAGER_STORE_KEYS.OPTIONS_BATTLE_SCENE_ANIMATIONS)
        if (chosenBattleSeenOption === undefined || chosenBattleSeenOption === BATTLE_SCENE_OPTIONS.ON) {
            this.skipAnimations = false;
            return;
        }
        this.skipAnimations = true;
    }

    create() {
        // Background
        const background = new Background(this);
        background.showForest()

        // Monsters
        this.activeEnemyMonster = new EnemyBattleMonster({
                scene: this,
                monsterDetails: {
                    name: MONSTER_ASSET_KEYS.CARNODUSK,
                    assetKey: MONSTER_ASSET_KEYS.CARNODUSK,
                    assetFrame: 0,
                    currentLevel: 5,
                    currentHp: 20,
                    maxHp: 25,
                    attackIds: [1, 2],
                    baseAttack: 25
                }, skipBattleAnimations: this.skipAnimations
            }
        );
        this.activePlayerMonster = new PlayerBattleMonster({
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
                }, skipBattleAnimations: this.skipAnimations
            }
        );

        // Create Battle Menu
        this.battleMenu = new BattleMenu(this, this.activePlayerMonster, this.skipAnimations);

        // Add and then Set State Machine
        this.createBattleStateMachine()

        // Create Attack Manager
        this.attackManager = new AttackManager(this, this.skipAnimations);

        // Create Controls
        this.controls = new Controls(this);
        this.controls.lockInput = true;
    }

    update() {
        this.battleStateMachine.update()

        if(this.controls.isInputLocked) {
            return;
        }

        const wasSpaceKeyPressed: boolean =  this.controls.wasSpaceKeyPressed();

        if (wasSpaceKeyPressed && (
            this.battleStateMachine.currentStateName === BATTLE_STATES.PRE_BATTLE_INFO ||
            this.battleStateMachine.currentStateName === BATTLE_STATES.POST_ATTACK_CHECK ||
            this.battleStateMachine.currentStateName === BATTLE_STATES.BRING_OUT_MONSTER ||
            this.battleStateMachine.currentStateName === BATTLE_STATES.FLEE_ATTEMPT
        )) {
            this.battleMenu.handlePlayerInput('OK')
            return;
        }

        if (this.battleStateMachine.currentStateName !== BATTLE_STATES.PLAYER_INPUT) {
            return;
        }

        if (wasSpaceKeyPressed) {
            this.battleMenu.handlePlayerInput('OK')

            // Check if player selected an attack, then update display text
            if (this.battleMenu.selectedAttack === undefined) {
                return;
            }
            this.activePlayerAttackIndex = this.battleMenu.selectedAttack

            // Check if selected attack exists
            if (!this.activePlayerMonster.attacks[this.activePlayerAttackIndex]) {
                return;
            }

            this.battleMenu.hideMonsterAttackSubMenu()
            this.battleStateMachine.setState(BATTLE_STATES.ENEMY_INPUT)
        }
        if ( this.controls.wasBackKeyPressed()) {
            this.battleMenu.handlePlayerInput('CANCEL')
            return;
        }

        let selectedDirection: Direction = this.controls.getDirectionKeyPressedDown()
        if (selectedDirection !== DIRECTION.NONE) {
            this.battleMenu.handlePlayerInput(selectedDirection)
        }
    }

    private playerAttack() {
        if (this.activePlayerMonster.isFainted) {
            return;
        }

        this.battleMenu.updateInfoPaneMessagesNoInputRequired(
            `${this.activePlayerMonster.name} used ${this.activePlayerMonster.attacks[this.activePlayerAttackIndex].name}`,
            () => {
                this.time.delayedCall(1200, () => {
                    this.attackManager.playAttackAnimation(this.activePlayerMonster.attacks[this.activePlayerAttackIndex].animationName, ATTACK_TARGET.ENEMY, () => {
                        this.activeEnemyMonster.playMonsterTakeDamageAnimation(() => {
                            this.activeEnemyMonster.takeDamage(this.activePlayerMonster.baseAttack, () => {
                                this.enemyAttack()
                            })
                        })
                    })
                })
            })
    }

    private enemyAttack() {
        if (this.activeEnemyMonster.isFainted) {
            this.battleStateMachine.setState(BATTLE_STATES.POST_ATTACK_CHECK)
            return;
        }

        this.battleMenu.updateInfoPaneMessagesNoInputRequired(
            `${this.activeEnemyMonster.name} used ${this.activeEnemyMonster.attacks[0].name}`,
            () => {
                this.time.delayedCall(1200, () => {
                    this.attackManager.playAttackAnimation(this.activeEnemyMonster.attacks[0].animationName, ATTACK_TARGET.PLAYER, () => {
                        this.activePlayerMonster.playMonsterTakeDamageAnimation(() => {
                            this.activePlayerMonster.takeDamage(this.activeEnemyMonster.baseAttack, () => {
                                this.battleStateMachine.setState(BATTLE_STATES.POST_ATTACK_CHECK)
                            })
                        })
                    })
                })
            })
    }

    private postBattleSequenceCheck() {
        if (this.activeEnemyMonster.isFainted) {
            this.battleMenu.updateInfoPaneMessagesAndWaitForInput([`Wild ${this.activeEnemyMonster.name} fucking died.`, `${this.activeEnemyMonster.name} gained experience`], () => {
                this.time.delayedCall(500, () => {
                    this.activeEnemyMonster.playMonsterDeathAnimation(() => {
                        this.battleStateMachine.setState(BATTLE_STATES.FINISHED)
                    })
                })
            })
            return;
        }

        if (this.activePlayerMonster.isFainted) {
            this.battleMenu.updateInfoPaneMessagesAndWaitForInput([`${this.activePlayerMonster.name} fainted`, 'You have no more monsters, escaping to safety...'], () => {
                this.activePlayerMonster.playMonsterDeathAnimation(() => {
                    this.time.delayedCall(500, () => {
                        this.battleStateMachine.setState(BATTLE_STATES.FINISHED)
                    })
                })
            })
            return;
        }

        this.battleStateMachine.setState(BATTLE_STATES.PLAYER_INPUT)
    }

    private transitionToNextScene() {
        this.cameras.main.fadeOut(600, 0, 0, 0)
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.start(SCENE_KEYS.BATTLE_SCENE)
        })
    }

    private createBattleStateMachine() {
        this.battleStateMachine = new StateMachine('battle', this);

        this.battleStateMachine.addState({
            name: BATTLE_STATES.INTRO,
            onEnter: () => {
                sceneTransition(this, {
                    skipSceneTransition: this.skipAnimations,
                    callback: () => {
                        this.battleStateMachine.setState(BATTLE_STATES.PRE_BATTLE_INFO)
                    }
                })
            }
        })

        this.battleStateMachine.addState({
            name: BATTLE_STATES.PRE_BATTLE_INFO,
            onEnter: () => {
                // Wait for enemy monster to appear on the screen and notify player about the wild monster
                this.activeEnemyMonster.playMonsterAppearAnimation(() => {
                    this.activeEnemyMonster.playMonsterHealthBarAppearAnimation(() => undefined)
                    this.controls.lockInput = false;
                    this.battleMenu.updateInfoPaneMessagesAndWaitForInput(
                        [`Wild ${this.activeEnemyMonster.name} appeared`], () => {
                            this.time.delayedCall(500, () => {
                                this.battleStateMachine.setState(BATTLE_STATES.BRING_OUT_MONSTER)
                            })
                        })
                })
            }
        })

        this.battleStateMachine.addState({
            name: BATTLE_STATES.BRING_OUT_MONSTER,
            onEnter: () => {
                // Wait for player monster to appear on the screen and notify player about the monster
                this.battleMenu.updateInfoPaneMessagesAndWaitForInput(
                    [`Go ${this.activePlayerMonster.name}`], () => {
                        // After animation switch state
                        this.time.delayedCall(500, () => {
                            this.battleStateMachine.setState(BATTLE_STATES.PLAYER_INPUT)
                        })
                    })
                this.activePlayerMonster.playMonsterAppearAnimation(() => {
                    this.activePlayerMonster.playMonsterHealthBarAppearAnimation(() => undefined)
                })
            }
        })

        this.battleStateMachine.addState({
            name: BATTLE_STATES.PLAYER_INPUT,
            onEnter: () => {
                this.battleMenu.showMainBattleMenu()
            }
        })

        this.battleStateMachine.addState({
            name: BATTLE_STATES.ENEMY_INPUT,
            onEnter: () => {
                //TODO: Pick a random move for the enemy monster and have an AI in the future
                this.battleStateMachine.setState(BATTLE_STATES.BATTLE)
            }
        })

        this.battleStateMachine.addState({
            name: BATTLE_STATES.BATTLE,
            onEnter: () => {
                // show attack used then pause
                // show attack animation then pause
                // show damage animation then pause
                // show health bar animation then pause
                // repeat for other monster

                this.playerAttack()
            }
        })

        this.battleStateMachine.addState({
            name: BATTLE_STATES.POST_ATTACK_CHECK,
            onEnter: () => {
                this.postBattleSequenceCheck()
            }
        })

        this.battleStateMachine.addState({
            name: BATTLE_STATES.FINISHED,
            onEnter: () => {
                this.transitionToNextScene()
            }
        })

        this.battleStateMachine.addState({
            name: BATTLE_STATES.FLEE_ATTEMPT,
            onEnter: () => {
                this.battleMenu.updateInfoPaneMessagesAndWaitForInput(['You got away safely'], () => {
                    this.battleStateMachine.setState(BATTLE_STATES.FINISHED)
                })
            }
        })

        // Start State Machine
        this.battleStateMachine.setState('INTRO')
    }
}