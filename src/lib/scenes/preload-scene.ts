import Phaser from 'phaser'
import {SCENE_KEYS} from "./scene-keys"
import {
    ATTACK_ASSET_KEYS,
    BATTLE_ASSET_KEYS,
    BATTLE_BACKGROUND_ASSET_KEYS, DATA_ASSET_KEYS,
    HEALTH_BAR_ASSET_KEYS,
    MONSTER_ASSET_KEYS, TITLE_ASSET_KEYS, UI_ASSET_KEYS
} from "../../assets/asset-keys"
import {CUSTOM_FONTS} from "../../assets/font-keys"
import {WebFontFileLoader} from "../../assets/web-font-file-loader"
import {DataUtils} from "../../utils/data-utils"
import {Animations} from "../../types/global"
import {dataManager} from "../../utils/data-manager"

export class PreloadScene extends Phaser.Scene {
    constructor() {
        super({
            key: SCENE_KEYS.PRELOAD_SCENE,
        })
    }

    preload() {
        const monsterTamerAssetPath: string = '../assets/images/monster-tamer'
        const kenneysAssetPath: string = '../assets/images/kenneys-assets'
        const pimenAssetPath: string = '../assets/images/pimen'

        // Load UI Components
        this.load.image(TITLE_ASSET_KEYS.BACKGROUND, `${monsterTamerAssetPath}/ui/title/background.png`)

        this.load.image(TITLE_ASSET_KEYS.PANEL, `${monsterTamerAssetPath}/ui/title/title_background.png`)

        this.load.image(TITLE_ASSET_KEYS.TITLE, `${monsterTamerAssetPath}/ui/title/title_text.png`)

        // Battle Backgrounds
        this.load.image(BATTLE_BACKGROUND_ASSET_KEYS.FOREST, `${monsterTamerAssetPath}/battle-backgrounds/forest-background.png`)

        // Battle Assets
        this.load.image(BATTLE_ASSET_KEYS.HEALTH_BAR_BACKGROUND, `${kenneysAssetPath}/ui-space-expansion/custom-ui.png`)

        // Health Bar Assets
        this.load.image(HEALTH_BAR_ASSET_KEYS.RIGHT_CAP, `${kenneysAssetPath}/ui-space-expansion/barHorizontal_green_right.png`)
        this.load.image(HEALTH_BAR_ASSET_KEYS.MIDDLE, `${kenneysAssetPath}/ui-space-expansion/barHorizontal_green_mid.png`)
        this.load.image(HEALTH_BAR_ASSET_KEYS.LEFT_CAP, `${kenneysAssetPath}/ui-space-expansion/barHorizontal_green_left.png`)
        this.load.image(HEALTH_BAR_ASSET_KEYS.RIGHT_CAP_SHADOW, `${kenneysAssetPath}/ui-space-expansion/barHorizontal_shadow_right.png`)
        this.load.image(HEALTH_BAR_ASSET_KEYS.MIDDLE_SHADOW, `${kenneysAssetPath}/ui-space-expansion/barHorizontal_shadow_mid.png`)
        this.load.image(HEALTH_BAR_ASSET_KEYS.LEFT_CAP_SHADOW, `${kenneysAssetPath}/ui-space-expansion/barHorizontal_shadow_left.png`)

        // Monster Assets
        this.load.image(MONSTER_ASSET_KEYS.CARNODUSK, `${monsterTamerAssetPath}/monsters/carnodusk.png`)
        this.load.image(MONSTER_ASSET_KEYS.IGUANIGNITE, `${monsterTamerAssetPath}/monsters/iguanignite.png`)

        // UI Assets
        this.load.image(UI_ASSET_KEYS.CURSOR, `${monsterTamerAssetPath}/ui/cursor.png`)
        this.load.image(UI_ASSET_KEYS.CURSOR_WHITE, `${monsterTamerAssetPath}/ui/cursor_white.png`)
        this.load.image(UI_ASSET_KEYS.MENU_BACKGROUND, `${kenneysAssetPath}/ui-space-expansion/glassPanel.png`)
        this.load.image(UI_ASSET_KEYS.MENU_BACKGROUND_GREEN, `${kenneysAssetPath}/ui-space-expansion/glassPanel_green.png`)
        this.load.image(UI_ASSET_KEYS.MENU_BACKGROUND_PURPLE, `${kenneysAssetPath}/ui-space-expansion/glassPanel_purple.png`)

        // Load JSON Data
        this.load.json(DATA_ASSET_KEYS.ATTACKS, 'assets/data/attacks.json')
        this.load.json(DATA_ASSET_KEYS.ANIMATIONS, 'assets/data/animations.json')

        // Load Fonts
        this.load.addFile(new WebFontFileLoader(this.load, [CUSTOM_FONTS.POKEROGUE]))

        // Load Attack Animations
        this.load.spritesheet(ATTACK_ASSET_KEYS.ICE_SHARD, `${pimenAssetPath}/ice-attack/active.png`, {
            frameWidth: 32,
            frameHeight: 32
        })
        this.load.spritesheet(ATTACK_ASSET_KEYS.ICE_SHARD_START, `${pimenAssetPath}/ice-attack/start.png`, {
            frameWidth: 32,
            frameHeight: 32
        })
        this.load.spritesheet(ATTACK_ASSET_KEYS.SLASH, `${pimenAssetPath}/slash.png`, {frameWidth: 48, frameHeight: 48})
    }

    create() {
        this.createAnimations()
        // DEBUGGING: Choose what scene to start in (it should be TITLE_SCENE)
        dataManager.loadData()
        this.scene.start(SCENE_KEYS.MAIN_GAME_SCENE)
    }

    private createAnimations() {

        const animations: Animations[] = DataUtils.getAnimations(this)
        animations.forEach((animation: Animations) => {
            const frames = animation.frames
                ? this.anims.generateFrameNumbers(animation.assetKey, {frames: animation.frames})
                : this.anims.generateFrameNumbers(animation.assetKey)

            this.anims.create({
                key: animation.key,
                frames: frames,
                frameRate: animation.frameRate,
                repeat: animation.repeat,
                delay: animation.delay,
                yoyo: animation.yoyo
            })
        })
    }
}