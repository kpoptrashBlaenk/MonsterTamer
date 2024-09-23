import {DATA_ASSET_KEYS} from "../assets/asset-keys"
import { Animations } from "../types/global"
import { Attack } from "../types/typedef"

export class DataUtils {

    static getMonsterAttack(scene: Phaser.Scene, attackId: number): Attack | undefined {
        const data: Attack[] = scene.cache.json.get(DATA_ASSET_KEYS.ATTACKS)
        return data.find(attack => attack.id === attackId)
    }

    static getAnimations(scene: Phaser.Scene): Animations[] {
        return scene.cache.json.get(DATA_ASSET_KEYS.ANIMATIONS)
    }
}