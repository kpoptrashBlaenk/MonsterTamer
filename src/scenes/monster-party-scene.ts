import { SCENE_KEYS } from './scene-keys'
import { BaseScene } from './base-scene'
import { CUSTOM_FONTS } from '../assets/font-keys'
import { Item, ITEM_EFFECT, Monster } from '../types/typedef'
import { HealthBar } from '../common/health-bar'
import { MONSTER_PARTY_MENU_OPTIONS, MonsterPartyMenu } from '../party/monster-party-menu'
import { CONFIRMATION_MENU_OPTIONS, ConfirmationMenu } from '../common/menu/confirmation-menu'
import { DATA_MANAGER_STORE_KEYS, dataManager } from '../utils/data-manager'
import {
  BATTLE_ASSET_KEYS,
  HEALTH_BAR_ASSET_KEYS,
  MONSTER_PARTY_ASSET_KEYS,
  UI_ASSET_KEYS,
} from '../assets/asset-keys'
import { Direction, DIRECTION } from '../common/direction'
import { exhaustiveGuard } from '../utils/guard'

const UI_TEXT_STYLE = {
  fontFamily: CUSTOM_FONTS.POKEROGUE,
  color: '#FFFFFF',
  fontSize: '24px',
}

const MONSTER_PARTY_POSITIONS = Object.freeze({
  EVEN: {
    x: 0,
    y: 10,
  },
  ODD: {
    x: 510,
    y: 40,
  },
  increment: 150,
})

export type MonsterPartySceneData = {
  previousSceneName: string
  itemSelected?: Item
  activeBattleMonsterPartyIndex?: number
  activeMonsterKnockedOut?: boolean
}

export class MonsterPartyScene extends BaseScene {
  private monsterPartyBackgrounds: Phaser.GameObjects.Image[]
  private cancelButton: Phaser.GameObjects.Image
  private infoTextGameObject: Phaser.GameObjects.Text
  private healthBars: HealthBar[]
  private healthBarTextGameObjects: Phaser.GameObjects.Text[]
  private selectedPartyMonsterIndex: number
  private monsters: Monster[]
  private sceneData: MonsterPartySceneData
  private waitingForInput: boolean
  private menu: MonsterPartyMenu
  private confirmationMenu: ConfirmationMenu
  private isMovingMonster: boolean
  private monsterToBeMovedIndex: number | undefined
  private monsterContainers: Phaser.GameObjects.Container[]

  constructor() {
    super({
      key: SCENE_KEYS.MONSTER_PARTY_SCENE,
    })
  }

  init(data: MonsterPartySceneData) {
    super.init(data)

    if (!data || !data.previousSceneName) {
      data.previousSceneName = SCENE_KEYS.MAIN_GAME_SCENE
    }

    this.sceneData = data
    this.monsterPartyBackgrounds = []
    this.healthBars = []
    this.healthBarTextGameObjects = []
    this.selectedPartyMonsterIndex = 0
    this.monsters = dataManager.getStore.get(DATA_MANAGER_STORE_KEYS.MONSTERS_IN_PARTY)
    this.waitingForInput = false
    this.isMovingMonster = false
    this.monsterToBeMovedIndex = undefined
    this.monsterContainers = []
  }

  create() {
    super.create()

    // Background
    this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 1).setOrigin(0)
    this.add
      .tileSprite(0, 0, this.scale.width, this.scale.height, MONSTER_PARTY_ASSET_KEYS.PARTY_BACKGROUND, 0)
      .setOrigin(0)
      .setAlpha(0.7)

    // Button
    const buttonContainer = this.add.container(883, 519, [])
    this.cancelButton = this.add
      .image(0, 0, UI_ASSET_KEYS.BLUE_BUTTON, 0)
      .setOrigin(0)
      .setScale(0.7, 1)
      .setAlpha(0.7)
    const cancelText = this.add.text(66.5, 20.6, 'Cancel', UI_TEXT_STYLE).setOrigin(0.5)
    buttonContainer.add([this.cancelButton, cancelText])

    // Info Container
    const infoContainer = this.add.container(4, this.scale.height - 69, [])
    const infoDisplay = this.add
      .rectangle(0, 0, 867, 65, 0xede4f3, 1)
      .setOrigin(0)
      .setStrokeStyle(8, 0x905ac2, 1)
    this.infoTextGameObject = this.add.text(15, 14, '', {
      fontFamily: CUSTOM_FONTS.POKEROGUE,
      color: '#000000',
      fontSize: '32px',
    })
    infoContainer.add([infoDisplay, this.infoTextGameObject])
    this.updateInfoContainerText()

    // Monsters
    this.monsters.forEach((monster, index) => {
      const isEven = index % 2 === 0
      const x = isEven ? MONSTER_PARTY_POSITIONS.EVEN.x : MONSTER_PARTY_POSITIONS.ODD.x
      const y =
        (isEven ? MONSTER_PARTY_POSITIONS.EVEN.y : MONSTER_PARTY_POSITIONS.ODD.y) +
        MONSTER_PARTY_POSITIONS.increment * Math.floor(index / 2)
      const monsterContainer = this.createMonster(x, y, monster)
      this.monsterContainers.push(monsterContainer)
    })
    this.movePlayerInputCursor(DIRECTION.NONE)

    // Menu
    this.menu = new MonsterPartyMenu(this, this.sceneData.previousSceneName)
    this.confirmationMenu = new ConfirmationMenu(this)
  }

  update() {
    super.update()

    if (this.controls.isInputLocked) {
      return
    }

    const selectedDirection = this.controls.getDirectionKeyJustDown()
    const wasSpaceKeyPressed = this.controls.wasSpaceKeyPressed()
    const wasBackspacePressed = this.controls.wasBackKeyPressed()

    if (this.confirmationMenu.getIsVisible) {
      this.handleInputForConfirmationMenu(wasBackspacePressed, wasSpaceKeyPressed, selectedDirection)
      return
    }

    if (this.menu.getIsVisible) {
      this.handleInputForMenu(wasBackspacePressed, wasSpaceKeyPressed, selectedDirection)
      return
    }

    if (wasBackspacePressed) {
      if (this.waitingForInput) {
        this.updateInfoContainerText()
        this.waitingForInput = false
        return
      }

      if (this.isMovingMonster) {
        this.isMovingMonster = false
        this.updateInfoContainerText()
        return
      }

      this.goBackToPreviousScene(false, false)
      return
    }

    if (wasSpaceKeyPressed) {
      if (this.waitingForInput) {
        this.updateInfoContainerText()
        this.waitingForInput = false
        return
      }

      if (this.selectedPartyMonsterIndex === -1) {
        if (this.isMovingMonster) {
          this.isMovingMonster = false
          this.updateInfoContainerText()
          return
        }

        this.goBackToPreviousScene(false, false)
        return
      }

      if (this.isMovingMonster) {
        if (this.selectedPartyMonsterIndex === this.monsterToBeMovedIndex) {
          return
        }

        this.moveMonsters()
        return
      }

      this.menu.show()
      return
    }

    if (this.waitingForInput) {
      return
    }

    if (selectedDirection !== DIRECTION.NONE) {
      this.movePlayerInputCursor(selectedDirection)

      if (this.isMovingMonster) {
        return
      }
      this.updateInfoContainerText()
    }
  }

  private updateInfoContainerText() {
    if (this.selectedPartyMonsterIndex === -1) {
      this.infoTextGameObject.setText('Go back to previous menu.')
      return
    }
    this.infoTextGameObject.setText('Choose a monster.')
  }

  private createMonster(x: number, y: number, monsterDetails: Monster): Phaser.GameObjects.Container {
    const container = this.add.container(x, y, [])

    const background = this.add
      .image(0, 0, BATTLE_ASSET_KEYS.HEALTH_BAR_BACKGROUND)
      .setOrigin(0)
      .setScale(1.1, 1.2)
    this.monsterPartyBackgrounds.push(background)

    const leftShadowCap = this.add
      .image(160, 67, HEALTH_BAR_ASSET_KEYS.LEFT_CAP_SHADOW)
      .setOrigin(0)
      .setAlpha(0.5)
    const middleShadow = this.add
      .image(leftShadowCap.x + leftShadowCap.width, 67, HEALTH_BAR_ASSET_KEYS.MIDDLE_SHADOW)
      .setOrigin(0)
      .setAlpha(0.5)
    middleShadow.displayWidth = 285
    const rightShadowCap = this.add
      .image(middleShadow.x + middleShadow.displayWidth, 67, HEALTH_BAR_ASSET_KEYS.RIGHT_CAP_SHADOW)
      .setOrigin(0)
      .setAlpha(0.5)

    const healthBar = new HealthBar(this, 100, 40, 240)
    healthBar.setMeterPercentageAnimated(monsterDetails.currentHp / monsterDetails.maxHp, {
      duration: 0,
      skipBattleAnimations: true,
    })
    this.healthBars.push(healthBar)

    const monsterHpText = this.add.text(164, 66, 'HP', {
      fontFamily: CUSTOM_FONTS.POKEROGUE,
      color: '#FF6505',
      fontSize: '24px',
      fontStyle: 'italic',
    })

    const monsterHealthBarLevelText = this.add.text(26, 116, `Lv. ${monsterDetails.currentLevel}`, {
      fontFamily: CUSTOM_FONTS.POKEROGUE,
      color: '#ffffff',
      fontSize: '22px',
    })

    const monsterNameGameText = this.add.text(162, 36, monsterDetails.name, {
      fontFamily: CUSTOM_FONTS.POKEROGUE,
      color: '#ffffff',
      fontSize: '30px',
    })

    const healthBarTextGameObject = this.add
      .text(458, 95, `${monsterDetails.currentHp} / ${monsterDetails.maxHp}`, {
        fontFamily: CUSTOM_FONTS.POKEROGUE,
        color: '#ffffff',
        fontSize: '38px',
      })
      .setOrigin(1, 0)
    this.healthBarTextGameObjects.push(healthBarTextGameObject)

    const monsterImage = this.add.image(35, 20, monsterDetails.assetKey).setOrigin(0).setScale(0.35)

    container.add([
      background,
      healthBar.getContainer,
      monsterHpText,
      monsterHealthBarLevelText,
      monsterNameGameText,
      leftShadowCap,
      middleShadow,
      rightShadowCap,
      healthBarTextGameObject,
      monsterImage,
    ])

    return container
  }

  private goBackToPreviousScene(wasItemUsed: boolean, wasMonsterSelected: boolean): void {
    if (
      this.sceneData.activeMonsterKnockedOut &&
      this.sceneData.previousSceneName === SCENE_KEYS.BATTLE_SCENE &&
      !wasMonsterSelected
    ) {
      this.infoTextGameObject.setText('You must select a new monster for battle.')
      this.waitingForInput = true
      this.menu.hide()
      return
    }

    this.controls.lockInput = true
    this.scene.stop(SCENE_KEYS.MONSTER_PARTY_SCENE)
    if(this.sceneData.previousSceneName !== SCENE_KEYS.MAIN_GAME_SCENE) {
      this.scene.resume(this.sceneData.previousSceneName, {
        wasItemUsed,
        selectedMonsterIndex: wasMonsterSelected ? this.selectedPartyMonsterIndex : undefined,
        wasMonsterSelected,
      })
    }
    this.scene.start(SCENE_KEYS.MAIN_GAME_SCENE)
  }

  private movePlayerInputCursor(direction: Direction): void {
    switch (direction) {
      case DIRECTION.UP:
        if (this.selectedPartyMonsterIndex === -1) {
          this.selectedPartyMonsterIndex = this.monsters.length
        }
        this.selectedPartyMonsterIndex -= 1
        // No Loop to bottom
        if (this.selectedPartyMonsterIndex < 0) {
          this.selectedPartyMonsterIndex = 0
        }
        this.monsterPartyBackgrounds[this.selectedPartyMonsterIndex].setAlpha(1)
        this.cancelButton.setTexture(UI_ASSET_KEYS.BLUE_BUTTON, 0).setAlpha(0.7)
        break
      case DIRECTION.DOWN:
        if (this.selectedPartyMonsterIndex === -1) {
          break
        }
        this.selectedPartyMonsterIndex += 1
        if (this.selectedPartyMonsterIndex > this.monsters.length - 1) {
          this.selectedPartyMonsterIndex = -1
        }
        if (this.selectedPartyMonsterIndex === -1) {
          this.cancelButton.setTexture(UI_ASSET_KEYS.BLUE_BUTTON_SELECTED, 0).setAlpha(1)
          break
        }
        this.monsterPartyBackgrounds[this.selectedPartyMonsterIndex].setAlpha(1)
        break
      case DIRECTION.LEFT:
      case DIRECTION.RIGHT:
      case DIRECTION.NONE:
        break
      default:
        exhaustiveGuard(direction)
    }

    this.monsterPartyBackgrounds.forEach((background, index) => {
      if (index === this.selectedPartyMonsterIndex) {
        return
      }
      background.setAlpha(0.7)
    })
  }

  private handleItemUsed(): void {
    switch (this.sceneData.itemSelected?.effect) {
      case ITEM_EFFECT.HEAL_30:
        this.handleHealItemUsed(30)
        break
      case ITEM_EFFECT.CAPTURE_1:
        break
      default:
        exhaustiveGuard(this.sceneData.itemSelected?.effect as never)
    }
  }

  private handleHealItemUsed(amount: number): void {
    const selectedMonster = this.monsters[this.selectedPartyMonsterIndex]

    if (selectedMonster.currentHp === 0) {
      this.infoTextGameObject.setText('Cannot heal fainted monster.')
      this.waitingForInput = true
      this.menu.hide()
      return
    }

    if (selectedMonster.currentHp === selectedMonster.maxHp) {
      this.infoTextGameObject.setText('Monster is already fully healed.')
      this.waitingForInput = true
      this.menu.hide()
      return
    }

    this.controls.lockInput = true
    selectedMonster.currentHp += amount
    if (selectedMonster.currentHp > selectedMonster.maxHp) {
      this.monsters[this.selectedPartyMonsterIndex].currentHp = selectedMonster.maxHp
    }
    this.infoTextGameObject.setText(`Healed monster by ${amount} HP.`)
    this.healthBars[this.selectedPartyMonsterIndex].setMeterPercentageAnimated(
      selectedMonster.currentHp / selectedMonster.maxHp,
      {
        callback: () => {
          this.healthBarTextGameObjects[this.selectedPartyMonsterIndex].setText(
            `${this.monsters[this.selectedPartyMonsterIndex].currentHp} / ${
              this.monsters[this.selectedPartyMonsterIndex].maxHp
            }`
          )
          dataManager.getStore.set(DATA_MANAGER_STORE_KEYS.MONSTERS_IN_PARTY, this.monsters)
          this.time.delayedCall(300, () => {
            this.goBackToPreviousScene(true, false)
          })
        },
      }
    )
  }

  private handleMonsterSelectedForSwitch(): void {
    if (this.monsters[this.selectedPartyMonsterIndex].currentHp === 0) {
      this.infoTextGameObject.setText('Selected monster is not able to fight.')
      this.waitingForInput = true
      this.menu.hide()
      return
    }

    if (this.sceneData.activeBattleMonsterPartyIndex === this.selectedPartyMonsterIndex) {
      this.infoTextGameObject.setText('Selected monster is already battling')
      this.waitingForInput = true
      this.menu.hide()
      return
    }

    this.goBackToPreviousScene(false, true)
  }

  private handleInputForMenu(
    wasBackKeyPressed: boolean,
    wasSpaceKeyPressed: boolean,
    selectedDirection: Direction
  ): void {
    if (wasBackKeyPressed) {
      this.menu.hide()
      return
    }

    if (wasSpaceKeyPressed) {
      this.menu.handlePlayerInput('OK')

      if (this.menu.getSelectedMenuOption === MONSTER_PARTY_MENU_OPTIONS.CANCEL) {
        this.menu.hide()
        return
      }

      if (this.menu.getSelectedMenuOption === MONSTER_PARTY_MENU_OPTIONS.SUMMARY) {
        this.controls.lockInput = true
        const sceneDataToPass = {
          monster: this.monsters[this.selectedPartyMonsterIndex],
        }
        this.scene.launch(SCENE_KEYS.MONSTER_DETAILS_SCENE, sceneDataToPass)
        this.scene.pause(SCENE_KEYS.MONSTER_PARTY_SCENE)
        return
      }

      if (this.menu.getSelectedMenuOption === MONSTER_PARTY_MENU_OPTIONS.SELECT) {
        if (this.sceneData.previousSceneName === SCENE_KEYS.INVENTORY_SCENE && this.sceneData.itemSelected) {
          this.handleItemUsed()
          return
        }

        if (this.sceneData.previousSceneName === SCENE_KEYS.BATTLE_SCENE) {
          this.handleMonsterSelectedForSwitch()
          return
        }
      }

      if (this.menu.getSelectedMenuOption === MONSTER_PARTY_MENU_OPTIONS.RELEASE) {
        if (this.monsters.length <= 1) {
          this.infoTextGameObject.setText('Cannot release last monster in party.')
          this.waitingForInput = true
          this.menu.hide()
          return
        }

        this.menu.hide()
        this.confirmationMenu.show()
        this.infoTextGameObject.setText(`Release ${this.monsters[this.selectedPartyMonsterIndex].name}?`)
        return
      }

      if (this.menu.getSelectedMenuOption === MONSTER_PARTY_MENU_OPTIONS.MOVE) {
        if (this.monsters.length <= 1) {
          this.infoTextGameObject.setText('Cannot move last monster in party.')
          this.waitingForInput = true
          this.menu.hide()
          return
        }

        this.isMovingMonster = true
        this.monsterToBeMovedIndex = this.selectedPartyMonsterIndex
        this.infoTextGameObject.setText('Choose a monster to switch position with.')
        this.menu.hide()
        return
      }
      return
    }

    if (selectedDirection !== DIRECTION.NONE) {
      this.menu.handlePlayerInput(selectedDirection)
    }
  }

  private handleInputForConfirmationMenu(
    wasBackKeyPressed: boolean,
    wasSpaceKeyPressed: boolean,
    selectedDirection: Direction
  ): void {
    if (wasBackKeyPressed) {
      this.confirmationMenu.hide()
      this.menu.show()
      this.updateInfoContainerText()
      return
    }

    if (wasSpaceKeyPressed) {
      this.confirmationMenu.handlePlayerInput('OK')

      if (this.confirmationMenu.getSelectedMenuOption === CONFIRMATION_MENU_OPTIONS.YES) {
        this.confirmationMenu.hide()

        if (this.menu.getSelectedMenuOption === MONSTER_PARTY_MENU_OPTIONS.RELEASE) {
          this.controls.lockInput = true
          this.infoTextGameObject.setText(
            `You released ${this.monsters[this.selectedPartyMonsterIndex].name} into the wild.`
          )
          this.time.delayedCall(1000, () => {
            this.removeMonster()
            this.controls.lockInput = false
          })
          return
        }

        return
      }

      this.confirmationMenu.hide()
      this.menu.show()
      this.updateInfoContainerText()
      return
    }

    if (selectedDirection !== DIRECTION.NONE) {
      this.confirmationMenu.handlePlayerInput(selectedDirection)
    }
  }

  private moveMonsters(): void {
    if (this.monsterToBeMovedIndex === undefined || this.selectedPartyMonsterIndex === undefined) {
      throw new Error('monsterToBeMovedIndex or selectedPartyMonsterIndex is undefined')
    }

    // Move Monster
    const monsterRef = this.monsters[this.monsterToBeMovedIndex]
    this.monsters[this.monsterToBeMovedIndex] = this.monsters[this.selectedPartyMonsterIndex]
    this.monsters[this.selectedPartyMonsterIndex] = monsterRef
    dataManager.getStore.set(DATA_MANAGER_STORE_KEYS.MONSTERS_IN_PARTY, this.monsters)

    // Move Containers
    const monsterContainerRefPosition1 = {
      x: this.monsterContainers[this.monsterToBeMovedIndex].x,
      y: this.monsterContainers[this.monsterToBeMovedIndex].y,
    }
    const monsterContainerRefPosition2 = {
      x: this.monsterContainers[this.selectedPartyMonsterIndex].x,
      y: this.monsterContainers[this.selectedPartyMonsterIndex].y,
    }
    this.monsterContainers[this.monsterToBeMovedIndex].setPosition(
      monsterContainerRefPosition2.x,
      monsterContainerRefPosition2.y
    )
    this.monsterContainers[this.selectedPartyMonsterIndex].setPosition(
      monsterContainerRefPosition1.x,
      monsterContainerRefPosition1.y
    )
    const containerRef = this.monsterContainers[this.monsterToBeMovedIndex]
    this.monsterContainers[this.monsterToBeMovedIndex] =
      this.monsterContainers[this.selectedPartyMonsterIndex]
    this.monsterContainers[this.selectedPartyMonsterIndex] = containerRef

    // Move Backgrounds
    const backgroundRef = this.monsterPartyBackgrounds[this.monsterToBeMovedIndex]
    this.monsterPartyBackgrounds[this.monsterToBeMovedIndex] =
      this.monsterPartyBackgrounds[this.selectedPartyMonsterIndex]
    this.monsterPartyBackgrounds[this.selectedPartyMonsterIndex] = backgroundRef

    this.isMovingMonster = false
    this.selectedPartyMonsterIndex = this.monsterToBeMovedIndex
    this.monsterToBeMovedIndex = undefined
  }

  private removeMonster(): void {
    // Remove Monster
    this.monsters.splice(this.selectedPartyMonsterIndex, 1)
    dataManager.getStore.set(DATA_MANAGER_STORE_KEYS.MONSTERS_IN_PARTY, this.monsters)

    // Remove Background
    this.monsterPartyBackgrounds.splice(this.selectedPartyMonsterIndex, 1)

    // Remove Container
    const containerToRemove = this.monsterContainers.splice(this.selectedPartyMonsterIndex, 1)[0]
    let prevContainerPos = {
      x: containerToRemove.x,
      y: containerToRemove.y,
    }
    containerToRemove.destroy()

    this.monsterContainers.forEach((container, index) => {
      if (index < this.selectedPartyMonsterIndex) {
        return
      }
      const tempPosition = {
        x: container.x,
        y: container.y,
      }
      container.setPosition(prevContainerPos.x, prevContainerPos.y)
      prevContainerPos = tempPosition
    })
    this.movePlayerInputCursor('UP')
  }

  handleSceneResume(sys: Phaser.Scenes.Systems) {
    super.handleSceneResume(sys)

    this.menu.hide()
    this.controls.lockInput = false
    this.cameras.main.resetFX()
  }
}
