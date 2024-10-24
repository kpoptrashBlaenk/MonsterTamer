import { MonsterAssetKeys, AttackAssetKey } from '../assets/asset-keys'
import { AttackKeys } from '../battle/attacks/attack-keys'

export type BattleMonsterConfig = {
  scene: Phaser.Scene
  monsterDetails: Monster
  scaleHealthBarBackgroundImageByY?: number
  skipBattleAnimations?: boolean
}

export type Monster = {
  id: string // number but it's string? idk
  monsterId: number
  name: string
  assetKey: MonsterAssetKeys
  assetFrame?: string | number
  currentLevel: number
  maxHp: number
  currentHp: number
  baseAttack: number
  attackIds: number[]
  currentAttack: number
  baseExp: number
  currentExp: number
}

export type Coordinate = {
  x: number
  y: number
}

export type Attack = {
  id: number
  name: string
  animationName: AttackKeys
  audioKey: string
}

export type Animations = {
  key: AttackAssetKey
  frameRate: number
  frames?: number[]
  repeat: number
  delay: number
  yoyo: boolean
  assetKey: AttackAssetKey
}

export const ITEM_CATEGORY = Object.freeze({
  HEAL: 'HEAL',
  CAPTURE: 'CAPTURE',
})

export type ItemCategory = keyof typeof ITEM_CATEGORY

export const ITEM_EFFECT = Object.freeze({
  HEAL_30: 'HEAL_30',
  CAPTURE_1: 'CAPTURE_1',
})

export type ItemEffect = keyof typeof ITEM_EFFECT

export type Item = {
  id: number
  name: string
  effect: ItemEffect
  description: string
  category: ItemCategory
}

export type BaseInventoryItem = {
  item: { id: number }
  quantity: number
}

export type Inventory = BaseInventoryItem[]

export type InventoryItem = {
  item: Item
  quantity: number
}

export type EncounterData = {
  [key: string]: number[][]
}
