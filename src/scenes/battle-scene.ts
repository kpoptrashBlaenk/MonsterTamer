import Phaser from 'phaser'
import { SCENE_KEYS } from './scene-keys'
import { AUDIO_ASSET_KEYS, BATTLE_ASSET_KEYS } from '../assets/asset-keys'
import { BattleMenu } from '../battle/ui/menu/battle-menu'
import { Direction, DIRECTION } from '../common/direction'
import { Background } from '../battle/background'
import { EnemyBattleMonster } from '../battle/monsters/enemy-battle-monster'
import { PlayerBattleMonster } from '../battle/monsters/player-battle-monster'
import { StateMachine } from '../utils/state-machine'
import { ATTACK_TARGET, AttackManager } from '../battle/attacks/attack-manager'
import { sceneTransition } from '../utils/scene-transition'
import { DATA_MANAGER_STORE_KEYS, dataManager } from '../utils/data-manager'
import { BATTLE_SCENE_OPTIONS, BattleSceneOptions } from '../common/options'
import { Menu } from '../common/menu/menu'
import { BaseScene } from './base-scene'
import { Item, Monster } from '../types/typedef'
import { Ball } from '../battle/ball'
import { playBackgroundMusic, playSoundFx } from '../utils/audio-utils'
import {
  calculateExpGainedFromMonster,
  handleMonsterGainingExperience,
  StatChanges,
} from '../utils/leveling-utils'
import { calculateMonsterCaptureResults } from '../utils/catch-utils'
import { sleep } from '../utils/time-utils'
import { generateUuid } from '../utils/random'
import { MonsterPartySceneData } from './monster-party-scene'
import { GameMenu } from '../game-menu'

const BATTLE_STATES = Object.freeze({
  INTRO: 'INTRO',
  PRE_BATTLE_INFO: 'PRE_BATTLE_INFO',
  BRING_OUT_MONSTER: 'BRING_OUT_MONSTER',
  PLAYER_INPUT: 'PLAYER_INPUT',
  ENEMY_INPUT: 'ENEMY_INPUT',
  BATTLE: 'BATTLE',
  POST_ATTACK_CHECK: 'POST_ATTACK_CHECK',
  FINISHED: 'FINISHED',
  FLEE_ATTEMPT: 'FLEE_ATTEMPT',
  GAIN_EXPERIENCE: 'GAIN_EXPERIENCE',
  SWITCH_MONSTER: 'SWITCH_MONSTER',
  USED_ITEM: 'USED_ITEM',
  HEAL_ITEM_USED: 'HEAL_ITEM_USED',
  CAPTURE_ITEM_USED: 'CAPTURE_ITEM_USED',
  CAUGHT_MONSTER: 'CAUGHT_MONSTER',
})

type BattleSceneData = {
  playerMonster: Monster[]
  enemyMonster: Monster[]
}

export type BattleSceneWasResumedData = {
  wasMonsterSelected: boolean
  selectedMonsterIndex?: number
  wasItemUsed: boolean
  item?: Item
}

export class BattleScene extends BaseScene {
  private battleMenu: BattleMenu
  private activeEnemyMonster: EnemyBattleMonster
  private activePlayerMonster: PlayerBattleMonster
  private activePlayerAttackIndex: number
  private battleStateMachine: StateMachine
  private attackManager: AttackManager
  private skipAnimations: boolean
  private activeEnemyAttackIndex: number
  private sceneData: BattleSceneData
  private activePlayerMonsterPartyIndex: number
  private switchingActiveMonster: boolean
  private activeMonsterKnockedOut: boolean
  private playerKnockedOut: boolean
  private availableMonstersUiContainer: Phaser.GameObjects.Container
  private monsterCaptured: boolean
  private ball: Ball
  private menu: Menu

  constructor() {
    super({
      key: SCENE_KEYS.BATTLE_SCENE,
    })
  }

  init(data: BattleSceneData) {
    super.init(data)
    this.sceneData = data

    this.activePlayerAttackIndex = -1
    this.activeEnemyAttackIndex = -1
    this.activePlayerMonsterPartyIndex = 0

    const chosenBattleSeenOption: BattleSceneOptions | undefined = dataManager.getStore.get(
      DATA_MANAGER_STORE_KEYS.OPTIONS_BATTLE_SCENE_ANIMATIONS
    )
    if (chosenBattleSeenOption === undefined || chosenBattleSeenOption === BATTLE_SCENE_OPTIONS.ON) {
      this.skipAnimations = false
      return
    }
    this.skipAnimations = true
    this.playerKnockedOut = false
    this.switchingActiveMonster = false
    this.activeMonsterKnockedOut = false
    this.monsterCaptured = false
  }

  create() {
    super.create()

    // Create Background
    const background = new Background(this)
    background.showForest()

    // Create Monsters
    this.activeEnemyMonster = new EnemyBattleMonster({
      scene: this,
      monsterDetails: this.sceneData.enemyMonster[0],
      skipBattleAnimations: this.skipAnimations,
    })
    this.activePlayerMonsterPartyIndex = this.sceneData.playerMonster.findIndex(
      (monster) => monster.currentHp > 0
    )
    this.activePlayerMonster = new PlayerBattleMonster({
      scene: this,
      monsterDetails: this.sceneData.playerMonster[this.activePlayerMonsterPartyIndex],
      skipBattleAnimations: this.skipAnimations,
    })

    // Create Battle Menu
    this.battleMenu = new BattleMenu(this, this.activePlayerMonster, this.skipAnimations)

    // Create and Set State Machine
    this.createBattleStateMachine()

    // Create Attack Manager
    this.attackManager = new AttackManager(this, this.skipAnimations)

    this.createAvailableMonstersUi()

    this.ball = new Ball({
      scene: this,
      assetKey: BATTLE_ASSET_KEYS.DAMAGED_BALL,
      assetFrame: 0,
      scale: 0.1,
      skipBattleAnimations: this.skipAnimations,
    })

    // Create Ingame Menu
    this.menu = new GameMenu(this)

    this.controls.lockInput = true

    playBackgroundMusic(this, AUDIO_ASSET_KEYS.BATTLE)
  }

  update() {
    super.update()

    this.battleStateMachine.update()

    if (this.controls.isInputLocked) {
      return
    }

    const wasSpaceKeyPressed: boolean = this.controls.wasSpaceKeyPressed()

    if (wasSpaceKeyPressed && this.menu.getIsVisible) {
      this.menu.handlePlayerInput('OK')

      if (this.menu.getSelectedMenuOption === 'SAVE') {
        dataManager.saveData()
        // TODO: show message showing that game progress have been saved and actually save stuff because dataManager is not far enough for now
        return
      }
      if (this.menu.getSelectedMenuOption === 'EXIT') {
        this.menu.hide()
        return
      }
    }

    if (
      wasSpaceKeyPressed &&
      (this.battleStateMachine.currentStateName === BATTLE_STATES.PRE_BATTLE_INFO ||
        this.battleStateMachine.currentStateName === BATTLE_STATES.POST_ATTACK_CHECK ||
        this.battleStateMachine.currentStateName === BATTLE_STATES.GAIN_EXPERIENCE ||
        this.battleStateMachine.currentStateName === BATTLE_STATES.SWITCH_MONSTER ||
        this.battleStateMachine.currentStateName === BATTLE_STATES.CAPTURE_ITEM_USED ||
        this.battleStateMachine.currentStateName === BATTLE_STATES.FLEE_ATTEMPT)
    ) {
      this.battleMenu.handlePlayerInput('OK')
      return
    }
    if (this.battleStateMachine.currentStateName !== BATTLE_STATES.PLAYER_INPUT) {
      return
    }

    if (this.controls.wasEscapeKeyPressed()) {
      if (this.menu.getIsVisible) {
        this.menu.hide()
        return
      } else {
        this.menu.show()
        return
      }
    }

    if (wasSpaceKeyPressed) {
      this.battleMenu.handlePlayerInput('OK')

      // Check if player uses item
      if (this.battleMenu.getWasItemUsed) {
        this.battleStateMachine.setState(BATTLE_STATES.ENEMY_INPUT)
        return
      }

      // Check if player wants to flee
      if (this.battleMenu.isAttemptingToFlee) {
        this.battleStateMachine.setState(BATTLE_STATES.FLEE_ATTEMPT)
        return
      }

      // Check if player switches monster
      if (this.battleMenu.isAttemptingToSwitchMonsters) {
        this.battleStateMachine.setState(BATTLE_STATES.SWITCH_MONSTER)
        return
      }

      // Check if player selected an attack
      if (this.battleMenu.selectedAttack === undefined) {
        return
      }
      this.activePlayerAttackIndex = this.battleMenu.selectedAttack

      if (!this.activePlayerMonster.attacks[this.activePlayerAttackIndex]) {
        return
      }

      console.log(`Player selected ${this.activePlayerMonster.attacks[this.activePlayerAttackIndex].name}`)
      this.battleMenu.hideMonsterAttackSubMenu()
      this.battleStateMachine.setState(BATTLE_STATES.ENEMY_INPUT)
      return
    }

    if (this.controls.wasBackKeyPressed()) {
      this.battleMenu.handlePlayerInput('CANCEL')
      return
    }

    let selectedDirection: Direction = this.controls.getDirectionKeyJustDown()
    if (selectedDirection !== DIRECTION.NONE) {
      if (this.menu.getIsVisible) {
        this.menu.handlePlayerInput(selectedDirection)
        return
      }
      this.battleMenu.handlePlayerInput(selectedDirection)
    }
  }

  private playerAttack(callback: () => void): void {
    if (this.activePlayerMonster.isFainted) {
      callback()
      return
    }

    this.battleMenu.updateInfoPaneMessagesNoInputRequired(
      `${this.activePlayerMonster.name} used ${
        this.activePlayerMonster.attacks[this.activePlayerAttackIndex].name
      }`,
      () => {
        this.time.delayedCall(1200, () => {
          this.time.delayedCall(100, () => {
            playSoundFx(this, this.activePlayerMonster.attacks[this.activePlayerAttackIndex].audioKey)
          })
          this.attackManager.playAttackAnimation(
            this.activePlayerMonster.attacks[this.activePlayerAttackIndex].animationName,
            ATTACK_TARGET.ENEMY,
            () => {
              this.activeEnemyMonster.playMonsterTakeDamageAnimation(() => {
                this.activeEnemyMonster.takeDamage(this.activePlayerMonster.baseAttack, () => {
                  callback()
                })
              })
            }
          )
        })
      }
    )
  }

  private enemyAttack(callback: () => void): void {
    if (this.activeEnemyMonster.isFainted) {
      callback()
      return
    }

    this.battleMenu.updateInfoPaneMessagesNoInputRequired(
      `${this.activeEnemyMonster.name} used ${
        this.activeEnemyMonster.attacks[this.activeEnemyAttackIndex].name
      }`,
      () => {
        this.time.delayedCall(1200, () => {
          this.time.delayedCall(100, () => {
            playSoundFx(this, this.activeEnemyMonster.attacks[this.activeEnemyAttackIndex].audioKey)
          })
          this.attackManager.playAttackAnimation(
            this.activeEnemyMonster.attacks[this.activeEnemyAttackIndex].animationName,
            ATTACK_TARGET.PLAYER,
            () => {
              this.activePlayerMonster.playMonsterTakeDamageAnimation(() => {
                this.activePlayerMonster.takeDamage(this.activeEnemyMonster.baseAttack, () => {
                  callback()
                })
              })
            }
          )
        })
      }
    )
  }

  private postBattleSequenceCheck(): void {
    // Update Data Manager and Scene Data to synchronize with battle
    this.sceneData.playerMonster[this.activePlayerMonsterPartyIndex].currentHp =
      this.activePlayerMonster.currentHp
    dataManager.getStore.set(DATA_MANAGER_STORE_KEYS.MONSTERS_IN_PARTY, this.sceneData.playerMonster)

    if (this.monsterCaptured) {
      this.activeEnemyMonster.playMonsterDeathAnimation(() => {
        this.battleMenu.updateInfoPaneMessagesAndWaitForInput(
          [`You caught ${this.activeEnemyMonster.name}`],
          () => {
            this.battleStateMachine.setState(BATTLE_STATES.GAIN_EXPERIENCE)
          }
        )
      })
      return
    }

    if (this.activeEnemyMonster.isFainted) {
      this.activeEnemyMonster.playMonsterDeathAnimation(() => {
        this.battleMenu.updateInfoPaneMessagesAndWaitForInput(
          [
            `Wild ${this.activeEnemyMonster.name} fucking died.`,
            `${this.activeEnemyMonster.name} gained experience`,
          ],
          () => {
            this.battleStateMachine.setState(BATTLE_STATES.GAIN_EXPERIENCE)
          }
        )
      })
      return
    }

    if (this.activePlayerMonster.isFainted) {
      this.activePlayerMonster.playMonsterDeathAnimation(() => {
        const monsterUi = this.availableMonstersUiContainer.getAt(this.activePlayerMonsterPartyIndex)
        if (monsterUi instanceof Phaser.GameObjects.Image) {
          monsterUi.setAlpha(0.4)
        }

        const hasOtherActiveMonsters = this.sceneData.playerMonster.some((monster) => {
          return (
            monster.id !== this.sceneData.playerMonster[this.activePlayerMonsterPartyIndex].id &&
            monster.currentHp > 0
          )
        })

        if (!hasOtherActiveMonsters) {
          this.battleMenu.updateInfoPaneMessagesAndWaitForInput(
            [`${this.activePlayerMonster.name} fainted.`, 'You have no more monsters, escaping to safety...'],
            () => {
              this.playerKnockedOut = true
              this.battleStateMachine.setState(BATTLE_STATES.FINISHED)
            }
          )
          return
        }

        this.battleMenu.updateInfoPaneMessagesAndWaitForInput(
          [`${this.activePlayerMonster.name} fainted.`, 'Choose another monster to continue the battle.'],
          () => {
            this.activeMonsterKnockedOut = true
            this.battleStateMachine.setState(BATTLE_STATES.SWITCH_MONSTER)
          }
        )
      })
      return
    }

    this.battleStateMachine.setState(BATTLE_STATES.PLAYER_INPUT)
  }

  private transitionToNextScene() {
    this.cameras.main.fadeOut(600, 0, 0, 0)
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start(SCENE_KEYS.MAIN_GAME_SCENE)
    })
  }

  private createBattleStateMachine() {
    /**
     * General state flow for battle scene
     *
     * Scene transition to the battle menu
     * Battle states
     * Intro -> setup everything that is needed
     * Pre-battle -> animations as characters and stuff appears
     * Monster info text renders onto the page & wait for player input
     * Any key press, and now menu stuff shows up
     * Player_turn -> choose what to do, wait for input from player
     * Enemy_turn -> random choice,
     * Battle_fight -> enemy and player options evaluated, play each attack animation
     * Battle_fight_post_check -> see if one of the characters died, repeat
     */

    this.battleStateMachine = new StateMachine('battle', this)

    this.battleStateMachine.addState({
      name: BATTLE_STATES.INTRO,
      onEnter: () => {
        sceneTransition(this, {
          skipSceneTransition: this.skipAnimations,
          callback: () => {
            this.battleStateMachine.setState(BATTLE_STATES.PRE_BATTLE_INFO)
          },
        })
      },
    })

    this.battleStateMachine.addState({
      name: BATTLE_STATES.PRE_BATTLE_INFO,
      onEnter: () => {
        this.activeEnemyMonster.playMonsterAppearAnimation(() => {
          this.activeEnemyMonster.playMonsterHealthBarAppearAnimation(() => {})
          this.controls.lockInput = false
          this.battleMenu.updateInfoPaneMessagesAndWaitForInput(
            [`Wild ${this.activeEnemyMonster.name} appeared!`],
            () => {
              this.battleStateMachine.setState(BATTLE_STATES.BRING_OUT_MONSTER)
            }
          )
        })
      },
    })

    this.battleStateMachine.addState({
      name: BATTLE_STATES.BRING_OUT_MONSTER,
      onEnter: () => {
        this.activePlayerMonster.playMonsterAppearAnimation(() => {
          this.activePlayerMonster.playMonsterHealthBarAppearAnimation(() => {
            this.availableMonstersUiContainer.setAlpha(1)
          })
          this.battleMenu.updateInfoPaneMessagesNoInputRequired(
            `Go ${this.activePlayerMonster.name}!`,
            () => {
              this.time.delayedCall(1200, () => {
                if (this.switchingActiveMonster && !this.activeMonsterKnockedOut) {
                  this.battleStateMachine.setState(BATTLE_STATES.ENEMY_INPUT)
                  return
                }

                this.switchingActiveMonster = false
                this.activeMonsterKnockedOut = false
                this.battleStateMachine.setState(BATTLE_STATES.PLAYER_INPUT)
              })
            }
          )
        })
      },
    })

    this.battleStateMachine.addState({
      name: BATTLE_STATES.PLAYER_INPUT,
      onEnter: () => {
        this.battleMenu.showMainBattleMenu()
      },
    })

    this.battleStateMachine.addState({
      name: BATTLE_STATES.ENEMY_INPUT,
      onEnter: () => {
        this.activeEnemyAttackIndex = this.activeEnemyMonster.pickRandomMove()
        this.battleStateMachine.setState(BATTLE_STATES.BATTLE)
      },
    })

    this.battleStateMachine.addState({
      name: BATTLE_STATES.BATTLE,
      onEnter: () => {
        // General battle flow
        // Show attack used, brief pause
        // Play attack animation, brief pause
        // Play damage animation, brief pause
        // Play health bar animation, brief pause
        // Repeat for enemy

        // If item used, don't attack
        if (this.battleMenu.getWasItemUsed) {
          this.battleStateMachine.setState(BATTLE_STATES.USED_ITEM)
          return
        }

        // If failed to flee, don't attack
        if (this.battleMenu.isAttemptingToFlee) {
          this.time.delayedCall(500, () => {
            this.enemyAttack(() => {
              this.battleStateMachine.setState(BATTLE_STATES.POST_ATTACK_CHECK)
            })
          })
          return
        }

        // If switching monsters, don't attack
        if (this.switchingActiveMonster) {
          this.time.delayedCall(500, () => {
            this.enemyAttack(() => {
              this.switchingActiveMonster = false
              this.battleStateMachine.setState(BATTLE_STATES.POST_ATTACK_CHECK)
            })
          })
          return
        }

        const randomNumber = Phaser.Math.Between(0, 1)
        if (randomNumber === 0) {
          this.playerAttack(() => {
            this.enemyAttack(() => {
              this.battleStateMachine.setState(BATTLE_STATES.POST_ATTACK_CHECK)
            })
          })
          return
        }

        this.enemyAttack(() => {
          this.playerAttack(() => {
            this.battleStateMachine.setState(BATTLE_STATES.POST_ATTACK_CHECK)
          })
        })
      },
    })

    this.battleStateMachine.addState({
      name: BATTLE_STATES.POST_ATTACK_CHECK,
      onEnter: () => {
        this.postBattleSequenceCheck()
      },
    })

    this.battleStateMachine.addState({
      name: BATTLE_STATES.FINISHED,
      onEnter: () => {
        dataManager.getStore.set(DATA_MANAGER_STORE_KEYS.MONSTERS_IN_PARTY, this.sceneData.playerMonster)
        this.transitionToNextScene()
      },
    })

    this.battleStateMachine.addState({
      name: BATTLE_STATES.FLEE_ATTEMPT,
      onEnter: () => {
        const randomNumber = Phaser.Math.Between(1, 10)
        if (randomNumber > 5) {
          // Success
          this.battleMenu.updateInfoPaneMessagesAndWaitForInput(['You got away safely!'], () => {
            this.time.delayedCall(200, () => {
              playSoundFx(this, AUDIO_ASSET_KEYS.FLEE)
              this.battleStateMachine.setState(BATTLE_STATES.FINISHED)
            })
          })
          return
        }
        // Failed
        this.battleMenu.updateInfoPaneMessagesAndWaitForInput(['You failed to run away...'], () => {
          this.time.delayedCall(200, () => {
            this.battleStateMachine.setState(BATTLE_STATES.ENEMY_INPUT)
          })
        })
      },
    })

    this.battleStateMachine.addState({
      name: BATTLE_STATES.GAIN_EXPERIENCE,
      onEnter: () => {
        const gainedExpForActiveMonster = calculateExpGainedFromMonster(
          this.activeEnemyMonster.baseExpValue,
          this.activeEnemyMonster.level,
          true
        )
        const gainedExpForInactiveMonster = calculateExpGainedFromMonster(
          this.activeEnemyMonster.baseExpValue,
          this.activeEnemyMonster.level,
          false
        )

        const messages: string[] = []
        let didActiveMonsterLevelUp = false
        this.sceneData.playerMonster.forEach((monster, index) => {
          // Knocked out monsters don't gain Exp
          if (this.sceneData.playerMonster[index].currentHp <= 0) {
            return
          }

          let statChanges: StatChanges | undefined
          const monsterMessages: string[] = []
          if (index === this.activePlayerMonsterPartyIndex) {
            statChanges = this.activePlayerMonster.updateMonsterExp(gainedExpForActiveMonster)
            monsterMessages.push(
              `${this.sceneData.playerMonster[index].name} gained ${gainedExpForActiveMonster} exp.`
            )
            if (statChanges?.level !== 0) {
              didActiveMonsterLevelUp = true
            }
          } else {
            statChanges = handleMonsterGainingExperience(
              this.sceneData.playerMonster[index],
              gainedExpForInactiveMonster
            )
            monsterMessages.push(
              `${this.sceneData.playerMonster[index].name} gained ${gainedExpForInactiveMonster} exp`
            )
          }
          if (statChanges !== undefined && statChanges.level !== 0) {
            monsterMessages.push(
              `${this.sceneData.playerMonster[index].name} level increased to ${this.sceneData.playerMonster[index].currentLevel}!`,
              `${this.sceneData.playerMonster[index].name} attack increased by ${statChanges.attack} and health increased by ${statChanges.health}`
            )
          }

          if (index === this.activePlayerMonsterPartyIndex) {
            messages.unshift(...monsterMessages)
          } else {
            messages.push(...monsterMessages)
          }
        })

        this.controls.lockInput = true
        this.activePlayerMonster.updateMonsterExpBar(didActiveMonsterLevelUp, false, () => {
          this.battleMenu.updateInfoPaneMessagesAndWaitForInput(messages, () => {
            this.time.delayedCall(200, () => {
              if (this.monsterCaptured) {
                this.battleStateMachine.setState(BATTLE_STATES.CAUGHT_MONSTER)
                return
              }
              this.battleStateMachine.setState(BATTLE_STATES.FINISHED)
            })
          })
          this.controls.lockInput = false
        })
      },
    })

    this.battleStateMachine.addState({
      name: BATTLE_STATES.SWITCH_MONSTER,
      onEnter: () => {
        const hasOtherActiveMonsters = this.sceneData.playerMonster.some((monster) => {
          return (
            monster.id !== this.sceneData.playerMonster[this.activePlayerMonsterPartyIndex].id &&
            monster.currentHp > 0
          )
        })

        if (!hasOtherActiveMonsters) {
          this.battleMenu.updateInfoPaneMessagesAndWaitForInput(
            ['You have no other monsters able to fight in your party.'],
            () => {
              this.battleStateMachine.setState(BATTLE_STATES.PLAYER_INPUT)
            }
          )
          return
        }
        const sceneDataToPass: MonsterPartySceneData = {
          previousSceneName: SCENE_KEYS.BATTLE_SCENE,
          activeBattleMonsterPartyIndex: this.activePlayerMonsterPartyIndex,
          activeMonsterKnockedOut: this.activeMonsterKnockedOut,
        }
        this.scene.launch(SCENE_KEYS.MONSTER_PARTY_SCENE, sceneDataToPass)
        this.scene.pause(SCENE_KEYS.BATTLE_SCENE)
      },
    })

    this.battleStateMachine.addState({
      name: BATTLE_STATES.HEAL_ITEM_USED,
      onEnter: () => {
        this.activePlayerMonster.updateMonsterHealth(
          dataManager.getStore.get(DATA_MANAGER_STORE_KEYS.MONSTERS_IN_PARTY)[
            this.activePlayerMonsterPartyIndex
          ].currentHp
        )
        this.time.delayedCall(500, () => {
          this.enemyAttack(() => {
            this.battleStateMachine.setState(BATTLE_STATES.POST_ATTACK_CHECK)
          })
        })
      },
    })

    this.battleStateMachine.addState({
      name: BATTLE_STATES.CAPTURE_ITEM_USED,
      onEnter: async () => {
        // Throw ball and play shake animation
        // 3 shakes : caught, 2 shakes : off by 10, 1 shakes off by 30, 0 shakes off > 30

        const captureResults = calculateMonsterCaptureResults(this.activeEnemyMonster)
        const diffInCapture = captureResults.requiredCaptureValue - captureResults.actualCaptureValue
        let numberOfShakes = 0
        if (diffInCapture <= 10) {
          numberOfShakes = 2
        } else if (diffInCapture <= 30) {
          numberOfShakes = 1
        }
        if (captureResults.wasCaptured) {
          numberOfShakes = 3
        }

        await this.ball.playThrowBallAnimation()
        await this.activeEnemyMonster.playCatchAnimation()
        if (numberOfShakes > 0) {
          await this.ball.playShakeBallAnimation(numberOfShakes - 1)
        } else {
          await this.ball.playShakeBallAnimation(0)
        }

        if (captureResults.wasCaptured) {
          this.monsterCaptured = true
          this.battleStateMachine.setState(BATTLE_STATES.POST_ATTACK_CHECK)
          return
        }

        await sleep(500, this)
        this.ball.hide()
        await this.activeEnemyMonster.playCatchAnimationFailed()

        // TODO: refactor to use async/await
        this.battleMenu.updateInfoPaneMessagesAndWaitForInput(['The wild monster breaks free!'], () => {
          this.time.delayedCall(500, () => {
            this.enemyAttack(() => {
              this.battleStateMachine.setState(BATTLE_STATES.POST_ATTACK_CHECK)
            })
          })
        })
      },
    })

    this.battleStateMachine.addState({
      name: BATTLE_STATES.CAUGHT_MONSTER,
      onEnter: () => {
        // Add monster to party
        const updatedMonster: Monster = {
          ...this.sceneData.enemyMonster[0],
          id: generateUuid(),
          currentHp: this.activeEnemyMonster.currentHp,
        }
        this.sceneData.playerMonster.push(updatedMonster)

        this.battleStateMachine.setState(BATTLE_STATES.FINISHED)
      },
    })

    // Start State Machine
    this.battleStateMachine.setState('INTRO')
  }

  public handleSceneResume(sys: Phaser.Scenes.Systems, data?: BattleSceneWasResumedData | undefined) {
    super.handleSceneResume(sys, data)

    if (!data || !data.wasMonsterSelected || data.selectedMonsterIndex === undefined) {
      this.battleStateMachine.setState(BATTLE_STATES.PLAYER_INPUT)
      return
    }

    this.controls.lockInput = true
    this.switchingActiveMonster = true

    this.activePlayerMonster.playMonsterDeathAnimation(() => {
      this.activePlayerMonsterPartyIndex = data.selectedMonsterIndex as number
      this.activePlayerMonster.switchMonster(
        this.sceneData.playerMonster[data.selectedMonsterIndex as number]
      )
      this.battleMenu.updateMonsterAttackSubMenu()
      this.controls.lockInput = false
      this.battleStateMachine.setState(BATTLE_STATES.BRING_OUT_MONSTER)
    })
  }

  private createAvailableMonstersUi(): void {
    this.availableMonstersUiContainer = this.add.container(this.scale.width - 24, 304, [])
    this.sceneData.playerMonster.forEach((monster, index) => {
      const alpha = monster.currentHp > 0 ? 1 : 0.4
      const ball = this.add
        .image(30 * -index, 0, BATTLE_ASSET_KEYS.BALL_THUMBNAIL, 0)
        .setScale(0.8)
        .setAlpha(alpha)
      this.availableMonstersUiContainer.add(ball)
    })
    this.availableMonstersUiContainer.setAlpha(0)
  }
}
