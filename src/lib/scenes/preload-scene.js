import Phaser from '../phaser.js';
import {SCENE_KEYS} from "./scene-keys.js";
import {
    BATTLE_ASSET_KEYS,
    BATTLE_BACKGROUND_ASSET_KEYS, DATA_ASSET_KEYS,
    HEALTH_BAR_ASSET_KEYS,
    MONSTER_ASSET_KEYS, UI_ASSET_KEYS
} from "../../assets/asset-keys.js";

export class PreloadScene extends Phaser.Scene {
    constructor() {
        super({
            key: SCENE_KEYS.PRELOAD_SCENE,
        });
        console.log(SCENE_KEYS.PRELOAD_SCENE)
    }

    preload() {
        const monsterTamerAssetPath = 'http://localhost/MonsterTamer/assets/images/monster-tamer';
        const kenneysAssetPath = 'http://localhost/MonsterTamer/assets/images/kenneys-assets';

        // Battle Backgrounds
        this.load.image(
            BATTLE_BACKGROUND_ASSET_KEYS.FOREST,
            `${monsterTamerAssetPath}/battle-backgrounds/forest-background.png`
        )

        // Battle Assets
        this.load.image(
            BATTLE_ASSET_KEYS.HEALTH_BAR_BACKGROUND,
            `${kenneysAssetPath}/ui-space-expansion/custom-ui.png`
        )

        // Health Bar Assets
        this.load.image(
            HEALTH_BAR_ASSET_KEYS.RIGHT_CAP,
            `${kenneysAssetPath}/ui-space-expansion/barHorizontal_green_right.png`
        )
        this.load.image(
            HEALTH_BAR_ASSET_KEYS.MIDDLE,
            `${kenneysAssetPath}/ui-space-expansion/barHorizontal_green_mid.png`
        )
        this.load.image(
            HEALTH_BAR_ASSET_KEYS.LEFT_CAP,
            `${kenneysAssetPath}/ui-space-expansion/barHorizontal_green_left.png`
        )
        this.load.image(
            HEALTH_BAR_ASSET_KEYS.RIGHT_CAP_SHADOW,
            `${kenneysAssetPath}/ui-space-expansion/barHorizontal_shadow_right.png`
        )
        this.load.image(
            HEALTH_BAR_ASSET_KEYS.MIDDLE_SHADOW,
            `${kenneysAssetPath}/ui-space-expansion/barHorizontal_shadow_mid.png`
        )
        this.load.image(
            HEALTH_BAR_ASSET_KEYS.LEFT_CAP_SHADOW,
            `${kenneysAssetPath}/ui-space-expansion/barHorizontal_shadow_left.png`
        )

        // Monster Assets
        this.load.image(
            MONSTER_ASSET_KEYS.CARNODUSK,
            `${monsterTamerAssetPath}/monsters/carnodusk.png`
        )
        this.load.image(
            MONSTER_ASSET_KEYS.IGUANIGNITE,
            `${monsterTamerAssetPath}/monsters/iguanignite.png`
        )

        // UI Assets
        this.load.image(
            UI_ASSET_KEYS.CURSOR,
            `${monsterTamerAssetPath}/ui/cursor.png`
        )

        // Load JSON Data
        this.load.json(
            DATA_ASSET_KEYS.ATTACKS,
            'assets/data/attacks.json'
        )
    }

    create() {
        this.scene.start(SCENE_KEYS.BATTLE_SCENE)
    }
}