import {DATA_ASSET_KEYS} from "../assets/asset-keys"
import {Attack, Animations, Item, Monster, EncounterData} from "../types/typedef"

export class DataUtils {

    static getMonsterAttack(scene: Phaser.Scene, attackId: number): Attack {
        const data: Attack[] = scene.cache.json.get(DATA_ASSET_KEYS.ATTACKS)
        const attack = data.find(attack => attack.id === attackId)
        // Kinda drastic but to ensure no undefined
        if (!attack) {
            throw new Error(`Attack with id ${attackId} not found`)
        }
        return attack
    }

    static getAnimations(scene: Phaser.Scene): Animations[] {
        return scene.cache.json.get(DATA_ASSET_KEYS.ANIMATIONS)
    }

    static getItem(scene: Phaser.Scene, itemId: number): Item {
        const data: Item[] = scene.cache.json.get(DATA_ASSET_KEYS.ITEMS)
        const item = data.find((item) => item.id === itemId)
        if (!item) {
            throw new Error(`Item with id ${itemId} not found`)
        }
        return item
    }



    static getItems(scene: Phaser.Scene, itemIds: number[]): Item[] {
        const data: Item[] = scene.cache.json.get(DATA_ASSET_KEYS.ITEMS)
        const items = data.filter((item) => {
            itemIds.some((id: number) => id === item.id)
        })
        if (!items) {
            throw new Error(`Items with ids ${itemIds} not found`)
        }
        return items
    }

    static getMonsterById(scene: Phaser.Scene, monsterId: number): Monster {
        const data: Monster[] = scene.cache.json.get(DATA_ASSET_KEYS.MONSTERS)
        const monster = data.find((monster) => monster.monsterId === monsterId)
        if (!monster) {
            throw new Error(`Monster with id ${monsterId} not found`)
        }
        return monster
    }

    static getEncounterAreaDetails(scene: Phaser.Scene, areaId: number): number[][] {
        const data: EncounterData = scene.cache.json.get(DATA_ASSET_KEYS.ENCOUNTERS)
        return data[String(areaId)]
    }
}