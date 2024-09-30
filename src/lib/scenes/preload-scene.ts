import {SCENE_KEYS} from "./scene-keys"
import {
    ATTACK_ASSET_KEYS,
    AUDIO_ASSET_KEYS,
    BATTLE_ASSET_KEYS,
    BATTLE_BACKGROUND_ASSET_KEYS, DATA_ASSET_KEYS,
    EXP_BAR_ASSET_KEYS,
    HEALTH_BAR_ASSET_KEYS,
    INVENTORY_ASSET_KEYS,
    MONSTER_ASSET_KEYS,
    MONSTER_PARTY_ASSET_KEYS,
    TITLE_ASSET_KEYS,
    UI_ASSET_KEYS
} from "../../assets/asset-keys"
import {CUSTOM_FONTS} from "../../assets/font-keys"
import {WebFontFileLoader} from "../../assets/web-font-file-loader"
import {DataUtils} from "../../utils/data-utils"
import {Animations} from "../../types/typedef"
import {dataManager} from "../../utils/data-manager"
import {BaseScene} from "./base-scene";
import { setGlobalSoundSettings } from "../../utils/audio-utils"

export class PreloadScene extends BaseScene {
    constructor() {
        super({
            key: SCENE_KEYS.PRELOAD_SCENE,
        })
    }

    preload() {
        const monsterTamerAssetPath: string = '../assets/images/monster-tamer'
        const kenneysAssetPath: string = '../assets/images/kenneys-assets'
        const pimenAssetPath: string = '../assets/images/pimen'

        // Title UI Components
        this.load.image(TITLE_ASSET_KEYS.BACKGROUND, `${monsterTamerAssetPath}/ui/title/background.png`)
        this.load.image(TITLE_ASSET_KEYS.PANEL, `${monsterTamerAssetPath}/ui/title/title_background.png`)

        this.load.image(TITLE_ASSET_KEYS.TITLE, `${monsterTamerAssetPath}/ui/title/title_text.png`)
        // Monster Party UI Components
        this.load.image(MONSTER_PARTY_ASSET_KEYS.PARTY_BACKGROUND, `${monsterTamerAssetPath}/ui/monster-party/background.png`)
        this.load.image(MONSTER_PARTY_ASSET_KEYS.MONSTER_DETAILS_BACKGROUND, `${monsterTamerAssetPath}/ui/monster-party/monster-details-background.png`)

        // Inventory UI Components
        this.load.image(INVENTORY_ASSET_KEYS.INVENTORY_BACKGROUND, `${monsterTamerAssetPath}/ui/inventory/bag_background.png`)
        this.load.image(INVENTORY_ASSET_KEYS.INVENTORY_BAG, `${monsterTamerAssetPath}/ui/inventory/bag.png`)

        // Battle Backgrounds
        this.load.image(BATTLE_BACKGROUND_ASSET_KEYS.FOREST, `${monsterTamerAssetPath}/battle-backgrounds/forest-background.png`)

        // Battle Assets
        this.load.image(BATTLE_ASSET_KEYS.HEALTH_BAR_BACKGROUND, `${kenneysAssetPath}/ui-space-expansion/custom-ui.png`);
        this.load.image(BATTLE_ASSET_KEYS.BALL_THUMBNAIL, `${monsterTamerAssetPath}/battle/cosmoball.png`)
        this.load.image(BATTLE_ASSET_KEYS.DAMAGED_BALL, `${monsterTamerAssetPath}/battle/damagedBall.png`)

        // Health Bar Assets
        this.load.image(HEALTH_BAR_ASSET_KEYS.RIGHT_CAP, `${kenneysAssetPath}/ui-space-expansion/barHorizontal_green_right.png`)
        this.load.image(HEALTH_BAR_ASSET_KEYS.MIDDLE, `${kenneysAssetPath}/ui-space-expansion/barHorizontal_green_mid.png`)
        this.load.image(HEALTH_BAR_ASSET_KEYS.LEFT_CAP, `${kenneysAssetPath}/ui-space-expansion/barHorizontal_green_left.png`)
        this.load.image(HEALTH_BAR_ASSET_KEYS.RIGHT_CAP_SHADOW, `${kenneysAssetPath}/ui-space-expansion/barHorizontal_shadow_right.png`)
        this.load.image(HEALTH_BAR_ASSET_KEYS.MIDDLE_SHADOW, `${kenneysAssetPath}/ui-space-expansion/barHorizontal_shadow_mid.png`)
        this.load.image(HEALTH_BAR_ASSET_KEYS.LEFT_CAP_SHADOW, `${kenneysAssetPath}/ui-space-expansion/barHorizontal_shadow_left.png`)

        // Exp Bar Assets
        this.load.image(EXP_BAR_ASSET_KEYS.EXP_RIGHT_CAP, `${kenneysAssetPath}/ui-space-expansion/barHorizontal_blue_right.png`)
        this.load.image(EXP_BAR_ASSET_KEYS.EXP_MIDDLE, `${kenneysAssetPath}/ui-space-expansion/barHorizontal_blue_mid.png`)
        this.load.image(EXP_BAR_ASSET_KEYS.EXP_LEFT_CAP, `${kenneysAssetPath}/ui-space-expansion/barHorizontal_blue_left.png`)

        // Monster Assets
        this.load.image(MONSTER_ASSET_KEYS.CARNODUSK, `${monsterTamerAssetPath}/monsters/carnodusk.png`)
        this.load.image(MONSTER_ASSET_KEYS.IGUANIGNITE, `${monsterTamerAssetPath}/monsters/iguanignite.png`)
        this.load.image(MONSTER_ASSET_KEYS.AQUAVALOR, `${monsterTamerAssetPath}/monsters/aquavalor.png`)
        this.load.image(MONSTER_ASSET_KEYS.FROSTSABER, `${monsterTamerAssetPath}/monsters/frostsaber.png`)
        this.load.image(MONSTER_ASSET_KEYS.IGNIVOLT, `${monsterTamerAssetPath}/monsters/ignivolt.png`)

        // UI Assets
        this.load.image(UI_ASSET_KEYS.CURSOR, `${monsterTamerAssetPath}/ui/cursor.png`)
        this.load.image(UI_ASSET_KEYS.CURSOR_WHITE, `${monsterTamerAssetPath}/ui/cursor_white.png`)
        this.load.image(UI_ASSET_KEYS.MENU_BACKGROUND, `${kenneysAssetPath}/ui-space-expansion/glassPanel.png`)
        this.load.image(UI_ASSET_KEYS.MENU_BACKGROUND_GREEN, `${kenneysAssetPath}/ui-space-expansion/glassPanel_green.png`)
        this.load.image(UI_ASSET_KEYS.MENU_BACKGROUND_PURPLE, `${kenneysAssetPath}/ui-space-expansion/glassPanel_purple.png`)

        // JSON Data
        this.load.json(DATA_ASSET_KEYS.ATTACKS, 'assets/data/attacks.json')
        this.load.json(DATA_ASSET_KEYS.ANIMATIONS, 'assets/data/animations.json')
        this.load.json(DATA_ASSET_KEYS.ITEMS, 'assets/data/items.json')
        this.load.json(DATA_ASSET_KEYS.MONSTERS, 'assets/data/monsters.json')
        this.load.json(DATA_ASSET_KEYS.ENCOUNTERS, 'assets/data/encounters.json')

        // Fonts
        this.load.addFile(new WebFontFileLoader(this.load, [CUSTOM_FONTS.POKEROGUE]))
        this.load.addFile(new WebFontFileLoader(this.load, [CUSTOM_FONTS.KENNEY]))

        // Attack Animations
        this.load.spritesheet(ATTACK_ASSET_KEYS.ICE_SHARD, `${pimenAssetPath}/ice-attack/active.png`, {frameWidth: 32, frameHeight: 32})
        this.load.spritesheet(ATTACK_ASSET_KEYS.ICE_SHARD_START, `${pimenAssetPath}/ice-attack/start.png`, {frameWidth: 32, frameHeight: 32})
        this.load.spritesheet(ATTACK_ASSET_KEYS.SLASH, `${pimenAssetPath}/slash.png`, {frameWidth: 48, frameHeight: 48})

        // Audio
        this.load.setPath('assets/audio/xDeviruchi')
        this.load.audio(AUDIO_ASSET_KEYS.MAIN, 'And-the-Journey-Begins.wav')
        this.load.audio(AUDIO_ASSET_KEYS.BATTLE, 'Decisive-Battle.wav')
        this.load.audio(AUDIO_ASSET_KEYS.TITLE, 'Title-Theme.wav')
        this.load.setPath('assets/audio/leohpaz')
        this.load.audio(AUDIO_ASSET_KEYS.CLAW, '03_Claw_03.wav')
        this.load.audio(AUDIO_ASSET_KEYS.GRASS, '03_Step_grass_03.wav')
        this.load.audio(AUDIO_ASSET_KEYS.ICE, '13_Ice_explosion_01.wav')
        this.load.audio(AUDIO_ASSET_KEYS.FLEE, '51_Flee_02.wav')
    }

    create() {
        super.create()

        // Create animations from JSON
        this.createAnimations()

        dataManager.init(this)
        dataManager.loadData()
        // Audio Settings from Data Manager
        setGlobalSoundSettings(this)

        // DEBUGGING: Choose what scene to start in (it should be TITLE_SCENE)
        this.scene.start(SCENE_KEYS.TITLE_SCENE)
    }

    private createAnimations(): void {

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