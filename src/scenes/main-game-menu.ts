import Phaser from 'phaser'
import { SCENE_KEYS } from './scene-keys'
import { TITLE_ASSET_KEYS, UI_ASSET_KEYS } from '../assets/asset-keys'
import { CUSTOM_FONTS } from '../assets/font-keys'
import { Direction, DIRECTION } from '../common/direction'
import { exhaustiveGuard } from '../utils/guard'
import { Coordinate } from '../types/typedef'
import { NineSlice } from '../utils/nine-slice'
import { DATA_MANAGER_STORE_KEYS, dataManager } from '../utils/data-manager'
import { BaseScene } from './base-scene'

const MENU_TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = Object.freeze({
  fontFamily: CUSTOM_FONTS.POKEROGUE,
  color: '4D4A49',
  fontSize: '35px',
})

const PLAYER_INPUT_CURSOR_POSITION: Coordinate = Object.freeze({
  x: 170,
  y: 41,
})

const MAIN_GAME_OPTIONS = Object.freeze({
  BATTLE: 'BATTLE',
  TEAM: 'TEAM',
  SAVE: 'SAVE',
  EXIT: 'EXIT',
})
type MainGameOptions = keyof typeof MAIN_GAME_OPTIONS

export class MainGameScene extends BaseScene {
  private mainMenuCursorPhaserImageGameObject: Phaser.GameObjects.Image
  private selectedMenuOption: MainGameOptions
  private nineSliceMenu: NineSlice
  private selectedMenuOptionIndex: number
  private readonly availableMenuOptions: MainGameOptions[]
  private menuOptionsTextGameObjects: Phaser.GameObjects.Text[]
  private readonly width: number
  private container: Phaser.GameObjects.Container

  constructor() {
    super({
      key: SCENE_KEYS.MAIN_GAME_SCENE,
    })

    this.width = 500
    this.availableMenuOptions = [
      MAIN_GAME_OPTIONS.BATTLE,
      MAIN_GAME_OPTIONS.TEAM,
      MAIN_GAME_OPTIONS.SAVE,
      MAIN_GAME_OPTIONS.EXIT,
    ]
  }

  init() {
    super.init()

    this.nineSliceMenu = new NineSlice({
      cornerCutSize: 32,
      textureManager: this.sys.textures,
      assetKeys: [UI_ASSET_KEYS.MENU_BACKGROUND],
    })
  }

  create() {
    super.create()

    this.menuOptionsTextGameObjects = []
    this.selectedMenuOptionIndex = 0
    this.selectedMenuOption = this.availableMenuOptions[this.selectedMenuOptionIndex]

    // Create Images
    this.add.image(0, 0, TITLE_ASSET_KEYS.BACKGROUND).setOrigin(0).setScale(0.58)
    this.add
      .image(this.scale.width / 2, 150, TITLE_ASSET_KEYS.PANEL)
      .setScale(0.25, 0.25)
      .setAlpha(0.5)
    this.add
      .image(this.scale.width / 2, 150, TITLE_ASSET_KEYS.TITLE)
      .setScale(0.55)
      .setAlpha(0.5)

    // Create Menu
    const menuBgContainer: Phaser.GameObjects.Container = this.nineSliceMenu.createNineSliceContainer(
      this,
      this.width,
      30 + this.availableMenuOptions.length * 50,
      UI_ASSET_KEYS.MENU_BACKGROUND
    )
    this.container = this.add.container(this.width / 2, 0, [menuBgContainer])
    this.container.setPosition(this.scale.width / 2 - this.width / 2, 300)

    for (let i = 0; i < this.availableMenuOptions.length; i++) {
      const y = 38 + 50 * i
      let text = this.availableMenuOptions[i]
      text = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
      const textObj = this.add.text(this.width / 2, y, text, MENU_TEXT_STYLE).setOrigin(0.5)
      this.menuOptionsTextGameObjects.push(textObj)
      this.container.add(this.menuOptionsTextGameObjects)
    }

    // Create Cursor
    this.mainMenuCursorPhaserImageGameObject = this.add
      .image(PLAYER_INPUT_CURSOR_POSITION.x, PLAYER_INPUT_CURSOR_POSITION.y, UI_ASSET_KEYS.CURSOR)
      .setOrigin(0.5)
      .setScale(2.5)
    this.container.add(this.mainMenuCursorPhaserImageGameObject)
    this.add.tween({
      delay: 0,
      duration: 500,
      repeat: -1,
      x: {
        from: PLAYER_INPUT_CURSOR_POSITION.x,
        start: PLAYER_INPUT_CURSOR_POSITION.x,
        to: PLAYER_INPUT_CURSOR_POSITION.x + 3,
      },
      targets: this.mainMenuCursorPhaserImageGameObject,
    })

    // Fade Effects
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      switch (this.selectedMenuOption) {
        case MAIN_GAME_OPTIONS.BATTLE:
          this.scene.start(SCENE_KEYS.BATTLE_SCENE)
          return
        case MAIN_GAME_OPTIONS.TEAM:
          // TODO: TEAM OPTIONS
          return
        case MAIN_GAME_OPTIONS.SAVE:
          return
        case MAIN_GAME_OPTIONS.EXIT:
          this.scene.start(SCENE_KEYS.TITLE_SCENE)
          return
        default:
          exhaustiveGuard(this.selectedMenuOption)
          return
      }
    })

    // Tell dataManager that the game started
    // INFO: place this at the end of the first create scene that comes when starting a new game
    dataManager.getStore.set(DATA_MANAGER_STORE_KEYS.GAME_STARTED, true)
  }

  update() {
    super.update()

    if (this.controls.isInputLocked) {
      return
    }

    const wasSpaceKeyPressed = this.controls.wasSpaceKeyPressed()
    if (wasSpaceKeyPressed) {
      if (this.selectedMenuOption === MAIN_GAME_OPTIONS.SAVE) {
        dataManager.saveData()
        return
      } else {
        this.cameras.main.fadeOut(500, 0, 0, 0)
        this.controls.lockInput = true
        return
      }
    }

    let selectedDirection: Direction = this.controls.getDirectionKeyJustDown()
    if (selectedDirection !== DIRECTION.NONE) {
      this.updateSelectedOptionFromInput(selectedDirection)
    }
  }

  private updateSelectedOptionFromInput(direction: Direction): void {
    switch (direction) {
      case DIRECTION.UP:
        this.selectedMenuOptionIndex -= 1
        if (this.selectedMenuOptionIndex < 0) {
          this.selectedMenuOptionIndex = this.availableMenuOptions.length - 1
        }
        break
      case DIRECTION.DOWN:
        this.selectedMenuOptionIndex += 1
        if (this.selectedMenuOptionIndex > this.availableMenuOptions.length - 1) {
          this.selectedMenuOptionIndex = 0
        }
        break
      case DIRECTION.RIGHT:
      case DIRECTION.LEFT:
        return
      case DIRECTION.NONE:
        break
      default:
        exhaustiveGuard(direction)
    }

    this.selectedMenuOption = this.availableMenuOptions[this.selectedMenuOptionIndex]

    const y = PLAYER_INPUT_CURSOR_POSITION.y + this.selectedMenuOptionIndex * 50

    this.mainMenuCursorPhaserImageGameObject.setY(y)
  }
}
