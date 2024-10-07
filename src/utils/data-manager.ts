import Phaser from 'phaser'
import {
  BATTLE_SCENE_OPTIONS,
  BattleSceneOptions,
  MenuColorOptions,
  SOUND_OPTIONS,
  SoundOptions,
  TEXT_SPEED_OPTIONS,
  TextSpeedOptions,
  VolumeOptions,
} from '../common/options'
import { TEXT_SPEED, TextSpeed } from '../config'
import { exhaustiveGuard } from './guard'
import { BaseInventoryItem, Inventory, InventoryItem, Item, Monster } from '../types/typedef'
import { DataUtils } from './data-utils'

const LOCAL_STORAGE_KEY = 'MONSTER_TAMER_DATA'

interface MonsterData {
  inParty: Monster[]
}

interface GlobalState {
  options: {
    textSpeed: TextSpeedOptions
    battleScene: BattleSceneOptions
    sound: SoundOptions
    volume: VolumeOptions
    menuColor: MenuColorOptions
  }
  gameStarted: boolean
  monsters: MonsterData
  inventory: Inventory
  itemsPickedUp: number[]
}

const initialState: GlobalState = {
  options: {
    textSpeed: TEXT_SPEED_OPTIONS.SLOW,
    battleScene: BATTLE_SCENE_OPTIONS.ON,
    sound: SOUND_OPTIONS.ON,
    volume: 4,
    menuColor: 0,
  },
  gameStarted: false,
  monsters: {
    inParty: [],
  },
  inventory: [
    {
      item: {
        id: 1,
      },
      quantity: 10,
    },
    {
      item: {
        id: 2,
      },
      quantity: 5,
    },
  ],
  itemsPickedUp: [],
}

export const DATA_MANAGER_STORE_KEYS = Object.freeze({
  OPTIONS_TEXT_SPEED: 'OPTIONS_TEXT_SPEED',
  OPTIONS_BATTLE_SCENE_ANIMATIONS: 'OPTIONS_BATTLE_SCENE_ANIMATIONS',
  OPTIONS_SOUND: 'OPTIONS_SOUND',
  OPTIONS_VOLUME: 'OPTIONS_VOLUME',
  OPTIONS_MENU_COLOR: 'OPTIONS_MENU_COLOR',
  GAME_STARTED: 'GAME_STARTED',
  MONSTERS_IN_PARTY: 'MONSTERS_IN_PARTY',
  INVENTORY: 'INVENTORY',
  ITEMS_PICKED_UP: 'ITEMS_PICKED_UP',
})

class DataManager extends Phaser.Events.EventEmitter {
  private readonly store: Phaser.Data.DataManager

  constructor() {
    super()
    this.store = new Phaser.Data.DataManager(this)
    this.updateDataManager(initialState)
  }

  public get getStore(): Phaser.Data.DataManager {
    return this.store
  }

  init(scene: Phaser.Scene): void {
    const startingMonster = DataUtils.getMonsterById(scene, 1)
    const startingMonster2 = DataUtils.getMonsterById(scene, 2)
    const startingMonster3 = DataUtils.getMonsterById(scene, 3)
    this.store.set(DATA_MANAGER_STORE_KEYS.MONSTERS_IN_PARTY, [
      startingMonster,
      startingMonster2,
      startingMonster3,
    ])
  }

  public loadData() {
    if (typeof Storage === 'undefined') {
      console.warn(`[${DataManager.name}:loadData]: localStorage is not supported, can't save data.`)
      return
    }

    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (savedData === null) {
      return
    }

    try {
      const parsedData: GlobalState = JSON.parse(savedData)
      this.updateDataManager(parsedData)
    } catch (error) {
      console.warn(
        `[${DataManager.name}:saveData]: Error when trying to parse and save data from localStorage.`
      )
    }
  }

  public saveData(): void {
    if (typeof Storage === 'undefined') {
      console.warn(`[${DataManager.name}:saveData]: localStorage is not supported, can't save data.`)
      return
    }

    const dataToSave: GlobalState = this.dataManagerDataToGlobalStateObject()
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave))
  }

  public startNewGame(scene: Phaser.Scene): void {
    // Get existing data, keep settings data, then erase data
    const existingData = { ...this.dataManagerDataToGlobalStateObject() }
    existingData.gameStarted = initialState.gameStarted
    existingData.monsters = {
      inParty: [...initialState.monsters.inParty],
    }
    existingData.inventory = initialState.inventory
    existingData.itemsPickedUp = [...initialState.itemsPickedUp]

    this.store.reset()
    this.updateDataManager(existingData)
    this.init(scene)
    this.saveData()
  }

  public getAnimatedTextSpeed(): TextSpeed | undefined {
    const chosenTextSpeed: TextSpeedOptions = this.getStore.get(DATA_MANAGER_STORE_KEYS.OPTIONS_TEXT_SPEED)
    if (chosenTextSpeed === undefined) {
      return TEXT_SPEED.SLOW
    }

    switch (chosenTextSpeed) {
      case TEXT_SPEED_OPTIONS.SLOW:
        return TEXT_SPEED.SLOW
      case TEXT_SPEED_OPTIONS.MID:
        return TEXT_SPEED.MID
      case TEXT_SPEED_OPTIONS.FAST:
        return TEXT_SPEED.FAST
      default:
        exhaustiveGuard(chosenTextSpeed)
    }
  }

  getInventory(scene: Phaser.Scene): InventoryItem[] {
    const items: InventoryItem[] = []
    const inventory: Inventory = this.store.get(DATA_MANAGER_STORE_KEYS.INVENTORY)
    inventory.forEach((baseItem) => {
      const item = DataUtils.getItem(scene, baseItem.item.id)
      items.push({
        item: item,
        quantity: baseItem.quantity,
      })
    })
    return items
  }

  updateInventory(items: InventoryItem[]): void {
    const inventory: BaseInventoryItem[] = items.map((item) => {
      return {
        item: {
          id: item.item.id,
        },
        quantity: item.quantity,
      }
    })
    this.store.set(DATA_MANAGER_STORE_KEYS.INVENTORY, inventory)
  }

  addItem(item: Item, quantity: number): void {
    const inventory: Inventory = this.store.get(DATA_MANAGER_STORE_KEYS.INVENTORY)
    const existingItem = inventory.find((inventoryItem) => {
      return inventoryItem.item.id === item.id
    })
    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      inventory.push({
        item,
        quantity,
      })
    }
    this.store.set(DATA_MANAGER_STORE_KEYS.INVENTORY, inventory)
  }

  addItemPickedUp(itemId: number): void {
    const itemsPickedUp: number[] = this.store.get(DATA_MANAGER_STORE_KEYS.ITEMS_PICKED_UP) || []
    itemsPickedUp.push(itemId)
    this.store.set(DATA_MANAGER_STORE_KEYS.ITEMS_PICKED_UP, itemsPickedUp)
  }

  isPartyFull(): boolean {
    const partySize: number = this.store.get(DATA_MANAGER_STORE_KEYS.MONSTERS_IN_PARTY).length
    return partySize === 6
  }

  private updateDataManager(data: GlobalState): void {
    this.store.set({
      [DATA_MANAGER_STORE_KEYS.OPTIONS_TEXT_SPEED]: data.options.textSpeed,
      [DATA_MANAGER_STORE_KEYS.OPTIONS_BATTLE_SCENE_ANIMATIONS]: data.options.battleScene,
      [DATA_MANAGER_STORE_KEYS.OPTIONS_SOUND]: data.options.sound,
      [DATA_MANAGER_STORE_KEYS.OPTIONS_VOLUME]: data.options.volume,
      [DATA_MANAGER_STORE_KEYS.OPTIONS_MENU_COLOR]: data.options.menuColor,
      [DATA_MANAGER_STORE_KEYS.GAME_STARTED]: data.gameStarted,
      [DATA_MANAGER_STORE_KEYS.MONSTERS_IN_PARTY]: data.monsters.inParty,
      [DATA_MANAGER_STORE_KEYS.INVENTORY]: data.inventory,
      [DATA_MANAGER_STORE_KEYS.ITEMS_PICKED_UP]: data.itemsPickedUp || [...initialState.itemsPickedUp],
    })
  }

  private dataManagerDataToGlobalStateObject(): GlobalState {
    return {
      options: {
        textSpeed: this.getStore.get(DATA_MANAGER_STORE_KEYS.OPTIONS_TEXT_SPEED),
        battleScene: this.getStore.get(DATA_MANAGER_STORE_KEYS.OPTIONS_BATTLE_SCENE_ANIMATIONS),
        sound: this.getStore.get(DATA_MANAGER_STORE_KEYS.OPTIONS_SOUND),
        volume: this.getStore.get(DATA_MANAGER_STORE_KEYS.OPTIONS_VOLUME),
        menuColor: this.getStore.get(DATA_MANAGER_STORE_KEYS.OPTIONS_MENU_COLOR),
      },
      gameStarted: this.getStore.get(DATA_MANAGER_STORE_KEYS.GAME_STARTED),
      monsters: {
        inParty: { ...this.getStore.get(DATA_MANAGER_STORE_KEYS.MONSTERS_IN_PARTY) },
      },
      inventory: this.store.get(DATA_MANAGER_STORE_KEYS.INVENTORY),
      itemsPickedUp: [...(this.store.get(DATA_MANAGER_STORE_KEYS.ITEMS_PICKED_UP) || [])],
    }
  }
}

export const dataManager: DataManager = new DataManager()
