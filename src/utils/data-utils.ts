import {DATA_ASSET_KEYS} from "../assets/asset-keys.ts";

export class DataUtils {

    /**
     *
     * @param {Phaser.Scene} scene
     * @param {number} attackId
     * @returns {Attack | undefined}
     */
    static getMonsterAttack(scene, attackId) {
        /** @type {Attack[]} */
        const data = scene.cache.json.get(DATA_ASSET_KEYS.ATTACKS)
        return data.find(attack => attack.id === attackId);
    }

    static getAnimations(scene: Phaser.Scene): Animations {
        return scene.cache.json.get(DATA_ASSET_KEYS.ANIMATIONS);
    }
}