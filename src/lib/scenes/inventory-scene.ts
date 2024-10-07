import { SCENE_KEYS } from './scene-keys'
import { ITEM_CATEGORY, Item } from '../../types/typedef'
import { CUSTOM_FONTS } from '../../assets/font-keys'
import { NineSlice } from '../../utils/nine-slice'
import { BaseScene } from './base-scene'
import { InventoryItem } from '../../types/typedef'
import { dataManager } from '../../utils/data-manager'
import { INVENTORY_ASSET_KEYS, UI_ASSET_KEYS } from '../../assets/asset-keys'
import { MonsterPartySceneData } from './monster-party-scene'
import { Direction, DIRECTION } from '../../common/direction'
import { exhaustiveGuard } from '../../utils/guard'

const CANCEL_TEXT_DESCRIPTION = 'Close your bag, and go back to adventuring!'
const CANNOT_USE_ITEM_TEXT = 'That item cannot be used right now.'

const INVENTORY_ITEM_POSITION = Object.freeze({
  x: 50,
  y: 14,
  space: 50,
})

const INVENTORY_TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: CUSTOM_FONTS.POKEROGUE,
  color: '#000000',
  fontSize: '30px',
}

type InventoryItemGameObjects = {
  itemName?: Phaser.GameObjects.Text
  quantitySign?: Phaser.GameObjects.Text
  quantity?: Phaser.GameObjects.Text
}

export type InventoryItemWithGameObjects = InventoryItem & {
  gameObjects: InventoryItemGameObjects
}

type CustomInventory = InventoryItemWithGameObjects[]

type InventorySceneData = {
  previousSceneName: string
}

type InventorySceneWasResumedData = {
  wasItemUsed: boolean
}

type InventorySceneItemUsedData = {
  wasItemUsed: boolean
  item?: Item
}

export class InventoryScene extends BaseScene {
  sceneData: InventorySceneData
  nineSliceMainContainer: NineSlice
  selectedInventoryDescriptionText: Phaser.GameObjects.Text
  userInputCursor: Phaser.GameObjects.Image
  inventory: CustomInventory
  selectedInventoryOptionIndex: number
  waitingForInput: boolean

  constructor() {
    super({
      key: SCENE_KEYS.INVENTORY_SCENE,
    })
  }

  init(data: InventorySceneData) {
    super.init(data)

    this.waitingForInput = false
    this.sceneData = data
    this.selectedInventoryOptionIndex = 0
    const inventory = dataManager.getInventory(this)
    this.inventory = inventory.map((inventoryItem) => {
      return {
        item: inventoryItem.item,
        quantity: inventoryItem.quantity,
        gameObjects: {},
      }
    })
    this.nineSliceMainContainer = new NineSlice({
      cornerCutSize: 32,
      textureManager: this.sys.textures,
      assetKeys: [UI_ASSET_KEYS.MENU_BACKGROUND],
    })
  }

  create() {
    super.create()

    // Background
    this.add.image(0, 0, INVENTORY_ASSET_KEYS.INVENTORY_BACKGROUND).setOrigin(0)
    this.add.image(40, 120, INVENTORY_ASSET_KEYS.INVENTORY_BAG).setOrigin(0).setScale(0.5)

    const container = this.nineSliceMainContainer
      .createNineSliceContainer(this, 700, 360, UI_ASSET_KEYS.MENU_BACKGROUND)
      .setPosition(300, 20)
    const containerBackground = this.add.rectangle(4, 4, 692, 352, 0xffff88).setOrigin(0).setAlpha(0.6)
    container.add(containerBackground)

    const titleContainer = this.nineSliceMainContainer
      .createNineSliceContainer(this, 240, 64, UI_ASSET_KEYS.MENU_BACKGROUND)
      .setPosition(64, 20)
    const titleContainerBackground = this.add.rectangle(4, 4, 232, 56, 0xffff88).setOrigin(0).setAlpha(0.6)
    titleContainer.add(titleContainerBackground)

    const textTitle = this.add.text(116, 28, 'Items', INVENTORY_TEXT_STYLE).setOrigin(0.5)
    titleContainer.add(textTitle)

    // Create Inventory Text
    this.inventory.forEach((inventoryItem, index) => {
      const itemText = this.add.text(
        INVENTORY_ITEM_POSITION.x,
        INVENTORY_ITEM_POSITION.y + index * INVENTORY_ITEM_POSITION.space,
        inventoryItem.item.name,
        INVENTORY_TEXT_STYLE
      )
      const qty1Text = this.add.text(
        620,
        INVENTORY_ITEM_POSITION.y + 2 + index * INVENTORY_ITEM_POSITION.space,
        'x',
        {
          color: '#000000',
          fontSize: '30px',
        }
      )
      const qty2Text = this.add.text(
        650,
        INVENTORY_ITEM_POSITION.y + index * INVENTORY_ITEM_POSITION.space,
        `${inventoryItem.quantity}`,
        INVENTORY_TEXT_STYLE
      )
      container.add([itemText, qty1Text, qty2Text])
      inventoryItem.gameObjects = {
        itemName: itemText,
        quantity: qty2Text,
        quantitySign: qty1Text,
      }
    })

    // Create Cancel Text
    const cancelText = this.add.text(
      INVENTORY_ITEM_POSITION.x,
      INVENTORY_ITEM_POSITION.y + this.inventory.length * INVENTORY_ITEM_POSITION.space,
      'Cancel',
      INVENTORY_TEXT_STYLE
    )
    container.add(cancelText)

    // Cursor
    this.userInputCursor = this.add.image(30, 30, UI_ASSET_KEYS.CURSOR).setScale(3)
    container.add(this.userInputCursor)

    // Description Text
    this.selectedInventoryDescriptionText = this.add.text(25, 420, '', {
      ...INVENTORY_TEXT_STYLE,
      ...{
        wordWrap: {
          width: this.scale.width - 18,
        },
        color: '#ffffff',
      },
    })
    this.updateItemDescriptionText()
  }

  update() {
    super.update()

    if (this.controls.isInputLocked) {
      return
    }

    if (this.controls.wasBackKeyPressed()) {
      if (this.waitingForInput) {
        this.updateItemDescriptionText()
        this.waitingForInput = false
        return
      }

      this.goBackToPreviousScene(false)
      return
    }

    if (this.controls.wasSpaceKeyPressed()) {
      if (this.waitingForInput) {
        this.updateItemDescriptionText()
        this.waitingForInput = false
        return
      }

      if (this.isCancelButtonSelected()) {
        this.goBackToPreviousScene(false)
        return
      }

      // No more of item
      if (this.inventory[this.selectedInventoryOptionIndex].quantity < 1) {
        return
      }

      const selectedItem = this.inventory[this.selectedInventoryOptionIndex].item

      // Battle Items
      if ((this, this.sceneData.previousSceneName === SCENE_KEYS.BATTLE_SCENE)) {
        if (selectedItem.category === ITEM_CATEGORY.CAPTURE) {
          if (dataManager.isPartyFull()) {
            // TODO: Logic if party full
            this.selectedInventoryDescriptionText.setText(
              'You have no room in your party! Cannot use that item.'
            )
            this.waitingForInput = true
            return
          }

          this.handleItemUsed()
          this.goBackToPreviousScene(true, selectedItem)
          return
        }
      }

      if (selectedItem.category === ITEM_CATEGORY.CAPTURE) {
        this.selectedInventoryDescriptionText.setText(CANNOT_USE_ITEM_TEXT)
        this.waitingForInput = true
        return
      }

      // Other items are applied to monsters
      this.controls.lockInput = true

      const sceneDataToPass: MonsterPartySceneData = {
        previousSceneName: SCENE_KEYS.INVENTORY_SCENE,
        itemSelected: this.inventory[this.selectedInventoryOptionIndex].item,
      }
      this.scene.launch(SCENE_KEYS.MONSTER_PARTY_SCENE, sceneDataToPass)
      this.scene.pause(SCENE_KEYS.INVENTORY_SCENE)

      // TODO: Accept/Cancel button after picking item
      return
    }

    if (this.waitingForInput) {
      return
    }

    const selectedDirection = this.controls.getDirectionKeyJustDown()
    if (selectedDirection !== DIRECTION.NONE) {
      this.movePlayerInputCursor(selectedDirection)
      this.updateItemDescriptionText()
    }
  }

  // prettier-ignore
  public handleSceneResume(sys: Phaser.Scenes.Systems,data?: InventorySceneWasResumedData | undefined): void {
    super.handleSceneResume(sys, data)

    if (!data || !data.wasItemUsed) {
      return
    }

    const updatedItem = this.handleItemUsed()
    // TODO: Logic for if last of item

    if (this.sceneData.previousSceneName === SCENE_KEYS.BATTLE_SCENE) {
      this.goBackToPreviousScene(true, updatedItem.item);
    }
  }

  private updateItemDescriptionText(): void {
    if (this.isCancelButtonSelected()) {
      this.selectedInventoryDescriptionText.setText(CANCEL_TEXT_DESCRIPTION)
      return
    }

    this.selectedInventoryDescriptionText.setText(
      this.inventory[this.selectedInventoryOptionIndex].item.description
    )
  }

  private isCancelButtonSelected(): boolean {
    return this.selectedInventoryOptionIndex === this.inventory.length
  }

  private goBackToPreviousScene(wasItemUsed: boolean, item?: Item): void {
    this.controls.lockInput = true
    this.scene.stop(SCENE_KEYS.INVENTORY_SCENE)
    const sceneDataToPass: InventorySceneItemUsedData = {
      wasItemUsed,
      item,
    }
    this.scene.resume(this.sceneData.previousSceneName, sceneDataToPass)
  }

  private movePlayerInputCursor(direction: Direction): void {
    switch (direction) {
      case DIRECTION.UP:
        this.selectedInventoryOptionIndex -= 1
        if (this.selectedInventoryOptionIndex < 0) {
          this.selectedInventoryOptionIndex = this.inventory.length
        }
        break
      case DIRECTION.DOWN:
        this.selectedInventoryOptionIndex += 1
        if (this.selectedInventoryOptionIndex > this.inventory.length) {
          this.selectedInventoryOptionIndex = 0
        }
        break
      case DIRECTION.LEFT:
      case DIRECTION.RIGHT:
        return
      case DIRECTION.NONE:
        break
      default:
        exhaustiveGuard(direction)
    }

    const y = 30 + this.selectedInventoryOptionIndex * 50
    this.userInputCursor.setY(y)
  }

  private handleItemUsed(): InventoryItemWithGameObjects {
    const selectedItem = this.inventory[this.selectedInventoryOptionIndex]
    selectedItem.quantity -= 1
    selectedItem.gameObjects.quantity?.setText(`${selectedItem.quantity}`)
    dataManager.updateInventory(this.inventory)
    return selectedItem
  }
}
