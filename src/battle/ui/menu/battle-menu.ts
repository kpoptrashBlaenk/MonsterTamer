import Phaser from 'phaser'
import { UI_ASSET_KEYS } from '../../../assets/asset-keys'
import { Direction, DIRECTION } from '../../../common/direction'
import { exhaustiveGuard } from '../../../utils/guard'
import {
  ACTIVE_BATTLE_MENU,
  ATTACK_MOVE_OPTIONS,
  BATTLE_MENU_OPTIONS,
  BattleMenuOptions,
  AttackMoveOptions,
  ActiveBattleMenu,
} from '../../ui/menu/battle-menu-options'
import { BATTLE_UI_TEXT_STYLE } from './battle-menu-config'
import { animateText } from '../../../utils/text-utils'
import { BattleMonster } from '../../monsters/battle-monster'
import { dataManager } from '../../../utils/data-manager'
import { Item } from '../../../types/typedef'
import { SCENE_KEYS } from '../../../scenes/scene-keys'
import { BattleSceneWasResumedData } from '../../../scenes/battle-scene'

const BATTLE_MENU_CURSOR_POSITION = Object.freeze({
  x: 42,
  y: 42,
})

const ATTACK_MENU_CURSOR_POSITION = Object.freeze({
  x: 42,
  y: 42,
})

const PLAYER_INPUT_CURSOR_POSITION = Object.freeze({
  y: 480,
})

export class BattleMenu {
  private readonly scene: Phaser.Scene
  private mainBattleMenuPhaserContainerGameObject: Phaser.GameObjects.Container
  private moveSelectionSubMenuPhaserContainerGameObject: Phaser.GameObjects.Container
  private battleTextGameObjectLine1: Phaser.GameObjects.Text
  private battleTextGameObjectLine2: Phaser.GameObjects.Text
  private mainBattleMenuCursorPhaserImageGameObject: Phaser.GameObjects.Image
  private attackBattleMenuCursorPhaserImageGameObject: Phaser.GameObjects.Image
  private selectedBattleMenuOption: BattleMenuOptions
  private selectedAttackMoveOption: AttackMoveOptions
  private activeBattleMenu: ActiveBattleMenu
  private queuedInfoPanelMessages: string[]
  private queuedInfoPanelCallback: (() => void) | undefined
  private waitingForPlayerInput: boolean
  private selectedAttackIndex: number | undefined
  private activePlayerMonster: BattleMonster
  private userInputCursorPhaserImageObject: Phaser.GameObjects.Image
  private userInputCursorPhaserTween: Phaser.Tweens.Tween
  private readonly skipAnimations: boolean
  private queuedMessageAnimationPlaying: boolean
  private usedItem: Item | undefined
  private fleeAttempt: boolean
  private switchMonsterAttempt: boolean
  private wasItemUsed: boolean

  constructor(
    scene: Phaser.Scene,
    activePlayerMonster: BattleMonster,
    skipBattleAnimations: boolean = false
  ) {
    this.scene = scene
    this.activePlayerMonster = activePlayerMonster
    this.activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_MAIN
    this.selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FIGHT
    this.selectedAttackMoveOption = ATTACK_MOVE_OPTIONS.MOVE_1
    this.queuedInfoPanelCallback = undefined
    this.queuedInfoPanelMessages = []
    this.waitingForPlayerInput = false
    this.selectedAttackIndex = undefined
    this.skipAnimations = skipBattleAnimations
    this.queuedMessageAnimationPlaying = false
    this.wasItemUsed = false
    this.usedItem = undefined
    this.fleeAttempt = false
    this.switchMonsterAttempt = false
    this.createMainInfoPane()
    this.createMainBattleMenu()
    this.createMonsterAttackSubMenu()
    this.createPlayerInputCursor()

    this.scene.events.on(
      Phaser.Scenes.Events.RESUME,
      (scene: Phaser.Scene, data: BattleSceneWasResumedData) => this.handleSceneResume(data),
      this
    )
    this.scene.events.once(
      Phaser.Scenes.Events.SHUTDOWN,
      () => {
        this.scene.events.off(Phaser.Scenes.Events.RESUME, this.handleSceneResume, this)
      },
      this
    )

    // this.hideMonsterAttackSubMenu()
    // this.hideMainBattleMenu()
  }

  public get selectedAttack(): number | undefined {
    if (this.activeBattleMenu === ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT) {
      return this.selectedAttackIndex
    }
    return undefined
  }

  public get getWasItemUsed(): boolean {
    return this.wasItemUsed
  }

  public get itemUsed(): Item | undefined {
    return this.usedItem
  }

  public get isAttemptingToFlee(): boolean {
    return this.fleeAttempt
  }

  get isAttemptingToSwitchMonsters(): boolean {
    return this.switchMonsterAttempt
  }

  public updateMonsterAttackSubMenu(): void {
    this.moveSelectionSubMenuPhaserContainerGameObject.getAll().forEach((gameObject) => {
      if (gameObject instanceof Phaser.GameObjects.Text) {
        gameObject.setText('-')
      }
    })
    this.activePlayerMonster.attacks.forEach((attack, index) => {
      const gameObject = this.moveSelectionSubMenuPhaserContainerGameObject.getAt(index)

      if (gameObject instanceof Phaser.GameObjects.Text) {
        gameObject.setText(attack.name)
      }
    })
  }

  public showMainBattleMenu(): void {
    this.activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_MAIN
    this.battleTextGameObjectLine1.setText('What should')
    this.mainBattleMenuPhaserContainerGameObject.setAlpha(1)
    this.battleTextGameObjectLine1.setAlpha(1)
    this.battleTextGameObjectLine2.setAlpha(1)

    this.selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FIGHT
    this.mainBattleMenuCursorPhaserImageGameObject.setPosition(
      BATTLE_MENU_CURSOR_POSITION.x,
      BATTLE_MENU_CURSOR_POSITION.y
    )
    this.selectedAttackIndex = undefined
    this.wasItemUsed = false
    this.fleeAttempt = false
    this.switchMonsterAttempt = false
    this.usedItem = undefined
  }

  public hideMainBattleMenu(): void {
    this.mainBattleMenuPhaserContainerGameObject.setAlpha(0)
    this.battleTextGameObjectLine1.setAlpha(0)
    this.battleTextGameObjectLine2.setAlpha(0)
  }

  public showMonsterAttackSubMenu(): void {
    this.activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT
    this.moveSelectionSubMenuPhaserContainerGameObject.setAlpha(1)
  }

  public hideMonsterAttackSubMenu(): void {
    this.activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_MAIN
    this.moveSelectionSubMenuPhaserContainerGameObject.setAlpha(0)
  }

  public playInputCursorAnimation(): void {
    this.userInputCursorPhaserImageObject
      .setPosition(
        this.battleTextGameObjectLine1.displayWidth +
          this.userInputCursorPhaserImageObject.displayWidth * 3.5,
        this.userInputCursorPhaserImageObject.y
      )
      .setAlpha(1)

    this.userInputCursorPhaserTween.restart()
  }

  public hideInputCursor(): void {
    this.userInputCursorPhaserImageObject.setAlpha(0)
    this.userInputCursorPhaserTween.pause()
  }

  public handlePlayerInput(input: Direction | 'OK' | 'CANCEL'): void {
    if (this.queuedMessageAnimationPlaying && input === 'OK') {
      return
    }

    if (this.waitingForPlayerInput && (input === 'CANCEL' || input === 'OK')) {
      this.updateInfoPaneWithMessage()
      return
    }

    if (input === 'CANCEL') {
      this.switchToMainBattleMenu()
      return
    }
    if (input === 'OK') {
      if (this.activeBattleMenu === ACTIVE_BATTLE_MENU.BATTLE_MAIN) {
        this.handlePlayerChooseMainBattleOption()
        return
      }

      if (this.activeBattleMenu === ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT) {
        this.handlePlayerChooseAttack()
        return
      }
    }

    this.updateSelectedBattleMenuOptionFromInput(input as Direction)
    this.moveMainBattleMenuCursor()

    this.updateSelectedAttackMoveOptionFromInput(input as Direction)
    this.moveSubBattleMenuCursor()
  }

  public updateInfoPaneMessagesNoInputRequired(message: string, callback?: () => void): void {
    this.battleTextGameObjectLine1.setText('').setAlpha(1)
    this.battleTextGameObjectLine2.setAlpha(0)

    if (this.skipAnimations) {
      this.battleTextGameObjectLine1.setText(message)
      this.waitingForPlayerInput = false
      if (callback) {
        callback()
      }
      return
    }

    animateText(this.scene, this.battleTextGameObjectLine1, message, {
      delay: dataManager.getAnimatedTextSpeed(),
      callback: () => {
        this.waitingForPlayerInput = false
        if (callback) {
          callback()
        }
      },
    })
  }

  public updateInfoPaneMessagesAndWaitForInput(messages: string[], callback?: () => void): void {
    this.queuedInfoPanelMessages = messages
    this.queuedInfoPanelCallback = callback

    this.updateInfoPaneWithMessage()
  }

  private updateInfoPaneWithMessage(): void {
    this.waitingForPlayerInput = false
    this.battleTextGameObjectLine1.setText('').setAlpha(1)
    this.hideInputCursor()

    // Check if all messages have been displayed in the queue and call callback
    if (this.queuedInfoPanelMessages.length === 0) {
      if (this.queuedInfoPanelCallback) {
        this.queuedInfoPanelCallback()
        this.queuedInfoPanelCallback = undefined
      }
      return
    }

    const messageToDisplay = this.queuedInfoPanelMessages.shift() || []
    if (this.skipAnimations) {
      this.battleTextGameObjectLine1.setText(messageToDisplay)
      this.queuedMessageAnimationPlaying = false
      this.waitingForPlayerInput = true
      this.playInputCursorAnimation()
      return
    }

    this.queuedMessageAnimationPlaying = true
    animateText(this.scene, this.battleTextGameObjectLine1, messageToDisplay, {
      delay: dataManager.getAnimatedTextSpeed(),
      callback: () => {
        this.playInputCursorAnimation()
        this.waitingForPlayerInput = true
        this.queuedMessageAnimationPlaying = false
      },
    })
  }

  private createMainBattleMenu(): void {
    this.battleTextGameObjectLine1 = this.scene.add.text(20, 468, 'What should', {
      ...BATTLE_UI_TEXT_STYLE,
      ...{
        wordWrap: {
          width: this.scene.scale.width - 55,
        },
      },
    })
    this.battleTextGameObjectLine2 = this.scene.add.text(
      20,
      512,
      `${this.activePlayerMonster.name} do next?`,
      BATTLE_UI_TEXT_STYLE
    )

    this.mainBattleMenuCursorPhaserImageGameObject = this.scene.add
      .image(BATTLE_MENU_CURSOR_POSITION.x, BATTLE_MENU_CURSOR_POSITION.y, UI_ASSET_KEYS.CURSOR, 0)
      .setOrigin(0.5)
      .setScale(1.5)

    this.mainBattleMenuPhaserContainerGameObject = this.scene.add.container(520, 448, [
      this.createSubInfoPane(),
      this.scene.add.text(55, 22, BATTLE_MENU_OPTIONS.FIGHT, BATTLE_UI_TEXT_STYLE),
      this.scene.add.text(240, 22, BATTLE_MENU_OPTIONS.SWITCH, BATTLE_UI_TEXT_STYLE),
      this.scene.add.text(55, 70, BATTLE_MENU_OPTIONS.ITEM, BATTLE_UI_TEXT_STYLE),
      this.scene.add.text(240, 70, BATTLE_MENU_OPTIONS.FLEE, BATTLE_UI_TEXT_STYLE),
      this.mainBattleMenuCursorPhaserImageGameObject,
    ])

    this.hideMainBattleMenu()
  }

  private createMonsterAttackSubMenu(): void {
    this.attackBattleMenuCursorPhaserImageGameObject = this.scene.add
      .image(42, 42, UI_ASSET_KEYS.CURSOR, 0)
      .setOrigin(0.5)
      .setScale(1.5)

    const attackNames: string[] = []
    for (let i = 0; i < 4; i++) {
      attackNames.push(this.activePlayerMonster.attacks[i]?.name || '-')
    }

    this.moveSelectionSubMenuPhaserContainerGameObject = this.scene.add.container(0, 448, [
      this.scene.add.text(55, 22, attackNames[0], BATTLE_UI_TEXT_STYLE),
      this.scene.add.text(240, 22, attackNames[1], BATTLE_UI_TEXT_STYLE),
      this.scene.add.text(55, 70, attackNames[2], BATTLE_UI_TEXT_STYLE),
      this.scene.add.text(240, 70, attackNames[3], BATTLE_UI_TEXT_STYLE),
      this.attackBattleMenuCursorPhaserImageGameObject,
    ])

    this.hideMonsterAttackSubMenu()
  }

  private createMainInfoPane(): void {
    const padding: number = 4
    const rectangleHeight: number = 124

    this.scene.add
      .rectangle(
        padding,
        this.scene.scale.height - rectangleHeight - padding,
        this.scene.scale.width - padding * 2,
        rectangleHeight,
        0xede4f3,
        1
      )
      .setOrigin(0)
      .setStrokeStyle(8, 0xe4434a, 1)
  }

  private createSubInfoPane() {
    const rectangleWidth = 500
    const rectangleHeight = 124
    return this.scene.add
      .rectangle(0, 0, rectangleWidth, rectangleHeight, 0xede4f3, 1)
      .setOrigin(0)
      .setStrokeStyle(8, 0x905ac2, 1)
  }

  private updateSelectedBattleMenuOptionFromInput(direction: Direction) {
    if (this.activeBattleMenu !== ACTIVE_BATTLE_MENU.BATTLE_MAIN) {
      return
    }

    if (this.selectedBattleMenuOption === BATTLE_MENU_OPTIONS.FIGHT) {
      switch (direction) {
        case DIRECTION.RIGHT:
          this.selectedBattleMenuOption = BATTLE_MENU_OPTIONS.SWITCH
          return
        case DIRECTION.DOWN:
          this.selectedBattleMenuOption = BATTLE_MENU_OPTIONS.ITEM
          return
        case DIRECTION.LEFT:
        case DIRECTION.UP:
        case DIRECTION.NONE:
          return
        default:
          exhaustiveGuard(direction)
      }
      return
    }

    if (this.selectedBattleMenuOption === BATTLE_MENU_OPTIONS.SWITCH) {
      switch (direction) {
        case DIRECTION.DOWN:
          this.selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FLEE
          return
        case DIRECTION.LEFT:
          this.selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FIGHT
          return
        case DIRECTION.RIGHT:
        case DIRECTION.UP:
        case DIRECTION.NONE:
          return
        default:
          exhaustiveGuard(direction)
      }
      return
    }

    if (this.selectedBattleMenuOption === BATTLE_MENU_OPTIONS.ITEM) {
      switch (direction) {
        case DIRECTION.RIGHT:
          this.selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FLEE
          return
        case DIRECTION.UP:
          this.selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FIGHT
          return
        case DIRECTION.DOWN:
        case DIRECTION.LEFT:
        case DIRECTION.NONE:
          return
        default:
          exhaustiveGuard(direction)
      }
      return
    }

    if (this.selectedBattleMenuOption === BATTLE_MENU_OPTIONS.FLEE) {
      switch (direction) {
        case DIRECTION.LEFT:
          this.selectedBattleMenuOption = BATTLE_MENU_OPTIONS.ITEM
          return
        case DIRECTION.UP:
          this.selectedBattleMenuOption = BATTLE_MENU_OPTIONS.SWITCH
          return
        case DIRECTION.RIGHT:
        case DIRECTION.DOWN:
        case DIRECTION.NONE:
          return
        default:
          exhaustiveGuard(direction)
      }
      return
    }

    exhaustiveGuard(this.selectedBattleMenuOption)
  }

  private moveMainBattleMenuCursor(): void {
    if (this.activeBattleMenu !== ACTIVE_BATTLE_MENU.BATTLE_MAIN) {
      return
    }
    switch (this.selectedBattleMenuOption) {
      case BATTLE_MENU_OPTIONS.FIGHT:
        this.mainBattleMenuCursorPhaserImageGameObject.setPosition(
          BATTLE_MENU_CURSOR_POSITION.x,
          BATTLE_MENU_CURSOR_POSITION.y
        )
        return
      case BATTLE_MENU_OPTIONS.SWITCH:
        this.mainBattleMenuCursorPhaserImageGameObject.setPosition(228, BATTLE_MENU_CURSOR_POSITION.y)
        return
      case BATTLE_MENU_OPTIONS.ITEM:
        this.mainBattleMenuCursorPhaserImageGameObject.setPosition(BATTLE_MENU_CURSOR_POSITION.x, 90)
        return
      case BATTLE_MENU_OPTIONS.FLEE:
        this.mainBattleMenuCursorPhaserImageGameObject.setPosition(228, 90)
        return
      default:
        exhaustiveGuard(this.selectedBattleMenuOption)
    }
  }

  private updateSelectedAttackMoveOptionFromInput(direction: Direction): void {
    if (this.activeBattleMenu !== ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT) {
      return
    }

    if (this.selectedAttackMoveOption === ATTACK_MOVE_OPTIONS.MOVE_1) {
      switch (direction) {
        case DIRECTION.RIGHT:
          this.selectedAttackMoveOption = ATTACK_MOVE_OPTIONS.MOVE_2
          return
        case DIRECTION.DOWN:
          this.selectedAttackMoveOption = ATTACK_MOVE_OPTIONS.MOVE_3
          return
        case DIRECTION.LEFT:
        case DIRECTION.UP:
        case DIRECTION.NONE:
          return
        default:
          exhaustiveGuard(direction)
      }
      return
    }

    if (this.selectedAttackMoveOption === ATTACK_MOVE_OPTIONS.MOVE_2) {
      switch (direction) {
        case DIRECTION.LEFT:
          this.selectedAttackMoveOption = ATTACK_MOVE_OPTIONS.MOVE_1
          return
        case DIRECTION.DOWN:
          this.selectedAttackMoveOption = ATTACK_MOVE_OPTIONS.MOVE_4
          return
        case DIRECTION.RIGHT:
        case DIRECTION.UP:
        case DIRECTION.NONE:
          return
        default:
          exhaustiveGuard(direction)
      }
      return
    }

    if (this.selectedAttackMoveOption === ATTACK_MOVE_OPTIONS.MOVE_3) {
      switch (direction) {
        case DIRECTION.RIGHT:
          this.selectedAttackMoveOption = ATTACK_MOVE_OPTIONS.MOVE_4
          return
        case DIRECTION.UP:
          this.selectedAttackMoveOption = ATTACK_MOVE_OPTIONS.MOVE_1
          return
        case DIRECTION.LEFT:
        case DIRECTION.DOWN:
        case DIRECTION.NONE:
          return
        default:
          exhaustiveGuard(direction)
      }
      return
    }

    if (this.selectedAttackMoveOption === ATTACK_MOVE_OPTIONS.MOVE_4) {
      switch (direction) {
        case DIRECTION.LEFT:
          this.selectedAttackMoveOption = ATTACK_MOVE_OPTIONS.MOVE_3
          return
        case DIRECTION.UP:
          this.selectedAttackMoveOption = ATTACK_MOVE_OPTIONS.MOVE_2
          return
        case DIRECTION.RIGHT:
        case DIRECTION.DOWN:
        case DIRECTION.NONE:
          return
        default:
          exhaustiveGuard(direction)
      }
    }
  }

  private moveSubBattleMenuCursor(): void {
    if (this.activeBattleMenu !== ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT) {
      return
    }
    switch (this.selectedAttackMoveOption) {
      case ATTACK_MOVE_OPTIONS.MOVE_1:
        this.attackBattleMenuCursorPhaserImageGameObject.setPosition(
          ATTACK_MENU_CURSOR_POSITION.x,
          ATTACK_MENU_CURSOR_POSITION.y
        )
        return
      case ATTACK_MOVE_OPTIONS.MOVE_2:
        this.attackBattleMenuCursorPhaserImageGameObject.setPosition(228, ATTACK_MENU_CURSOR_POSITION.y)
        return
      case ATTACK_MOVE_OPTIONS.MOVE_3:
        this.attackBattleMenuCursorPhaserImageGameObject.setPosition(ATTACK_MENU_CURSOR_POSITION.x, 90)
        return
      case ATTACK_MOVE_OPTIONS.MOVE_4:
        this.attackBattleMenuCursorPhaserImageGameObject.setPosition(228, 90)
        return
      default:
        exhaustiveGuard(this.selectedAttackMoveOption)
    }
  }

  private switchToMainBattleMenu(): void {
    this.waitingForPlayerInput = false
    this.hideInputCursor()
    this.hideMonsterAttackSubMenu()
    this.showMainBattleMenu()
  }

  private handlePlayerChooseMainBattleOption(): void {
    this.hideMainBattleMenu()

    if (this.selectedBattleMenuOption === BATTLE_MENU_OPTIONS.FIGHT) {
      this.showMonsterAttackSubMenu()
      return
    }

    if (this.selectedBattleMenuOption === BATTLE_MENU_OPTIONS.ITEM) {
      this.activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_ITEM

      const sceneDataToPass = {
        previousSceneName: SCENE_KEYS.BATTLE_SCENE,
      }
      this.scene.scene.launch(SCENE_KEYS.INVENTORY_SCENE, sceneDataToPass)
      this.scene.scene.pause(SCENE_KEYS.BATTLE_SCENE)
      return
    }

    if (this.selectedBattleMenuOption === BATTLE_MENU_OPTIONS.SWITCH) {
      this.activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_SWITCH
      this.switchMonsterAttempt = true
      return
    }

    if (this.selectedBattleMenuOption === BATTLE_MENU_OPTIONS.FLEE) {
      this.activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_FLEE
      this.fleeAttempt = true
      return
    }

    exhaustiveGuard(this.selectedBattleMenuOption)
  }

  private handlePlayerChooseAttack(): void {
    let selectedAttackMoveIndex = 0
    switch (this.selectedAttackMoveOption) {
      case ATTACK_MOVE_OPTIONS.MOVE_1:
        // selectedAttackMoveIndex = 0
        break
      case ATTACK_MOVE_OPTIONS.MOVE_2:
        selectedAttackMoveIndex = 1
        break
      case ATTACK_MOVE_OPTIONS.MOVE_3:
        selectedAttackMoveIndex = 2
        break
      case ATTACK_MOVE_OPTIONS.MOVE_4:
        selectedAttackMoveIndex = 3
        break
      default:
        exhaustiveGuard(this.selectedAttackMoveOption)
    }

    this.selectedAttackIndex = selectedAttackMoveIndex
  }

  private createPlayerInputCursor(): void {
    this.userInputCursorPhaserImageObject = this.scene.add
      .image(390, 0, UI_ASSET_KEYS.CURSOR)
      .setAngle(90)
      .setScale(2.0, 1.5)
      .setAlpha(0)

    this.userInputCursorPhaserTween = this.scene.add.tween({
      delay: 0,
      duration: 800,
      repeat: -1,
      y: {
        from: PLAYER_INPUT_CURSOR_POSITION.y + 7,
        start: PLAYER_INPUT_CURSOR_POSITION.y + 7,
        to: PLAYER_INPUT_CURSOR_POSITION.y + 12,
      },
      targets: this.userInputCursorPhaserImageObject,
    })
    this.userInputCursorPhaserTween.pause()
  }

  private handleSceneResume(data: BattleSceneWasResumedData) {
    // console.log(
    //   `[${BattleMenu.name}:handleSceneResume] scene has been resumed, data provided: ${JSON.stringify(data)}`
    // )

    if (data && data.wasMonsterSelected) {
      return
    }

    if (!data || !data.wasItemUsed) {
      this.switchToMainBattleMenu()
      return
    }

    this.wasItemUsed = true
    this.usedItem = data.item
    this.updateInfoPaneMessagesAndWaitForInput([`You used the following item: ${data.item?.name}`])
  }
}
