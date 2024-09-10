import Phaser from "../phaser.ts";
import {SCENE_KEYS} from "./scene-keys.ts";
import {NineSlice} from "../../utils/nine-slice.ts";
import {UI_ASSET_KEYS} from "../../assets/asset-keys.ts";
import {CUSTOM_FONTS} from "../../assets/font-keys.ts";
import {
    BATTLE_SCENE_OPTIONS,
    BattleSceneOptions,
    MenuColorOptions,
    OPTION_MENU_OPTIONS,
    OptionMenuOptions,
    SOUND_OPTIONS,
    SoundOptions, TEXT_SPEED_OPTIONS,
    TextSpeedOptions,
    VolumeOptions
} from "../../common/options.ts";
import {Controls} from "../../utils/controls.ts";
import {DIRECTION, Direction} from "../../common/direction.ts";
import {exhaustiveGuard} from "../../utils/guard.ts";
import {DATA_MANAGER_STORE_KEYS, dataManager} from "../../utils/data-manager.ts";

const OPTIONS_TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = Object.freeze({
    fontFamily: CUSTOM_FONTS.POKEROGUE,
    color: '#FFFFFF',
    fontSize: '35px'
})

const OPTION_MENU_OPTION_INFO_MSG = Object.freeze({
    TEXT_SPEED: 'Choose one of three text speeds.',
    BATTLE_SCENE: 'Choose to display battle animations and effects.',
    SOUND: 'Choose to enable or disable sound.',
    VOLUME: 'Set volume value.',
    MENU_COLOR: 'Choose one of three menu color options.',
    CLOSE: 'Confirm and close.'
})

const TEXT_FONT_COLORS = Object.freeze({
    NOT_SELECTED: '#FFFFFF',
    SELECTED: '#FF2222'
})

export class OptionsScene extends Phaser.Scene {
    private mainContainer: Phaser.GameObjects.Container;
    private nineSliceMainContainer: NineSlice;
    private textSpeedOptionTextGameObjects: Phaser.GameObjects.Group;
    private battleSceneOptionTextGameObjects: Phaser.GameObjects.Group;
    private soundOptionTextGameObjects: Phaser.GameObjects.Group;
    private volumeOptionTextGameObjects: Phaser.GameObjects.Group;
    private menuColorOptionTextGameObjects: Phaser.GameObjects.Group;
    private volumeOptionMenuCursor: Phaser.GameObjects.Rectangle;
    private volumeOptionValueText: Phaser.GameObjects.Text;
    private selectedMenuColorTextGameObject: Phaser.GameObjects.Text;
    private infoContainer: Phaser.GameObjects.Container;
    private selectedOptionInfoMsgTextGameObject: Phaser.GameObjects.Text;
    private optionsMenuCursor: Phaser.GameObjects.Rectangle;
    private controls: Controls;
    private selectedOptionMenu: OptionMenuOptions;
    private selectedTextSpeedOption: TextSpeedOptions;
    private selectedBattleSceneOption: BattleSceneOptions;
    private selectedSoundOption: SoundOptions;
    private selectedVolumeOption: VolumeOptions;
    private selectedMenuColorOption: MenuColorOptions;

    constructor() {
        super({
            key: SCENE_KEYS.OPTIONS_SCENE,
        });
    }

    init() {
        this.nineSliceMainContainer = new NineSlice({
            cornerCutSize: 32,
            textureManager: this.sys.textures,
            assetKeys: [UI_ASSET_KEYS.MENU_BACKGROUND, UI_ASSET_KEYS.MENU_BACKGROUND_GREEN, UI_ASSET_KEYS.MENU_BACKGROUND_PURPLE]
        })
        this.selectedTextSpeedOption = dataManager.getStore.get(DATA_MANAGER_STORE_KEYS.OPTIONS_TEXT_SPEED)
        this.selectedBattleSceneOption = dataManager.getStore.get(DATA_MANAGER_STORE_KEYS.OPTIONS_BATTLE_SCENE_ANIMATIONS)
        this.selectedSoundOption = dataManager.getStore.get(DATA_MANAGER_STORE_KEYS.OPTIONS_SOUND)
        this.selectedVolumeOption = dataManager.getStore.get(DATA_MANAGER_STORE_KEYS.OPTIONS_VOLUME)
        this.selectedMenuColorOption = dataManager.getStore.get(DATA_MANAGER_STORE_KEYS.OPTIONS_MENU_COLOR)

        this.selectedOptionMenu = OPTION_MENU_OPTIONS.TEXT_SPEED
    }

    create() {
        // Create Container
        const {width, height}: { width: number, height: number } = this.scale;
        const optionMenuWidth = width - 200;

        this.mainContainer = this.nineSliceMainContainer.createNineSliceContainer(this, optionMenuWidth, 432, UI_ASSET_KEYS.MENU_BACKGROUND);
        this.mainContainer.setX(100).setY(20)

        // Create Options
        this.add.text(width / 2, 40, 'Options', OPTIONS_TEXT_STYLE).setOrigin(0.5).setScale(1.3)
        const menuOptions: string[] = ['Text Speed', 'Battle Scene', 'Sound', 'Volume', 'Menu Color', 'Close']
        const menuOptionsPosition = {
            x: 25,
            yStart: 55,
            yIncrement: 55
        }

        menuOptions.forEach((option, index) => {
            const x: number = menuOptionsPosition.x
            const y: number = menuOptionsPosition.yStart + index * menuOptionsPosition.yIncrement
            const textGameObject: Phaser.GameObjects.Text = this.add.text(x, y, option, OPTIONS_TEXT_STYLE)
            this.mainContainer.add(textGameObject)
        })

        // Create Text Speed Option
        this.textSpeedOptionTextGameObjects = this.add.group([
            this.add.text(420, 75, 'Slow', OPTIONS_TEXT_STYLE),
            this.add.text(590, 75, 'Mid', OPTIONS_TEXT_STYLE),
            this.add.text(760, 75, 'Fast', OPTIONS_TEXT_STYLE)
        ]);

        // Create Battle Scene Option
        this.battleSceneOptionTextGameObjects = this.add.group([
            this.add.text(420, 130, 'On', OPTIONS_TEXT_STYLE),
            this.add.text(590, 130, 'Off', OPTIONS_TEXT_STYLE)
        ]);

        // Create Sound Option
        this.soundOptionTextGameObjects = this.add.group([
            this.add.text(420, 185, 'On', OPTIONS_TEXT_STYLE),
            this.add.text(590, 185, 'Off', OPTIONS_TEXT_STYLE)
        ]);

        // Create Volume Option
        this.add.rectangle(420, 260, 300, 4, 0xffffff, 1).setOrigin(0, 0.5)
        this.volumeOptionMenuCursor = this.add.rectangle(710, 260, 10, 25, 0xff2222, 1).setOrigin(0, 0.5)
        this.volumeOptionValueText = this.add.text(760, 238, '100%', OPTIONS_TEXT_STYLE)

        // Create Menu Color
        this.selectedMenuColorTextGameObject = this.add.text(590, 295, '', OPTIONS_TEXT_STYLE)
        this.add.image(530, 302, UI_ASSET_KEYS.CURSOR_WHITE).setOrigin(1, 0).setScale(2.5).setFlipX(true)
        this.add.image(660, 302, UI_ASSET_KEYS.CURSOR_WHITE).setOrigin(0, 0).setScale(2.5)

        // Option Details
        this.infoContainer = this.nineSliceMainContainer.createNineSliceContainer(this, optionMenuWidth, 100, UI_ASSET_KEYS.MENU_BACKGROUND);
        this.infoContainer.setPosition(100, height - 110)
        this.selectedOptionInfoMsgTextGameObject = this.add.text(125, 480, OPTION_MENU_OPTION_INFO_MSG.TEXT_SPEED, {
            ...OPTIONS_TEXT_STYLE,
            ...{
                wordWrap: {width: width - 250}
            }
        })

        // Create option selector
        this.optionsMenuCursor = this.add.rectangle(110, 75, optionMenuWidth - 20, 40, 0xffffffff, 0).setOrigin(0).setStrokeStyle(4, 0xe4434a, 1)

        // Create default selections
        this.updateTextSpeedGameObjects()
        this.updateBattleSceneGameObjects()
        this.updateSoundGameObjects()
        this.updateVolumeGameObjects()
        this.updateMenuColorGameObjects()

        // Create controls
        this.controls = new Controls(this);

        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.start(SCENE_KEYS.TITLE_SCENE)
        })
    }

    update() {
        if (this.controls.isInputLocked) {
            return;
        }

        if (this.controls.wasBackKeyPressed()) {
            this.controls.lockInput = true;
            this.cameras.main.fadeOut(500, 0, 0)
            return;
        }

        if (this.controls.wasSpaceKeyPressed() && this.selectedOptionMenu === OPTION_MENU_OPTIONS.CLOSE) {
            this.updateOptionDataManager()
            this.controls.lockInput = true;
            this.cameras.main.fadeOut(500, 0, 0)
            return;
        }

        const selectedDirection: Direction = this.controls.getDirectionKeyJustDown()
        if (selectedDirection !== DIRECTION.NONE) {
            this.moveOptionMenuCursor(selectedDirection)
        }
    }

    private updateOptionDataManager(): void {
        dataManager.getStore.set({
            [DATA_MANAGER_STORE_KEYS.OPTIONS_TEXT_SPEED]: this.selectedTextSpeedOption,
            [DATA_MANAGER_STORE_KEYS.OPTIONS_BATTLE_SCENE_ANIMATIONS]: this.selectedBattleSceneOption,
            [DATA_MANAGER_STORE_KEYS.OPTIONS_SOUND]: this.selectedSoundOption,
            [DATA_MANAGER_STORE_KEYS.OPTIONS_VOLUME]: this.selectedVolumeOption,
            [DATA_MANAGER_STORE_KEYS.OPTIONS_MENU_COLOR]: this.selectedMenuColorOption
        })
        dataManager.saveData()
    }

    private moveOptionMenuCursor(direction: Direction): void {
        if (direction === DIRECTION.NONE) {
            return;
        }

        this.updateSelectedOptionMenuFromInput(direction)

        switch (this.selectedOptionMenu) {
            case OPTION_MENU_OPTIONS.TEXT_SPEED:
                this.optionsMenuCursor.setY(75)
                break;
            case OPTION_MENU_OPTIONS.BATTLE_SCENE:
                this.optionsMenuCursor.setY(75 + 55)
                break;
            case OPTION_MENU_OPTIONS.SOUND:
                this.optionsMenuCursor.setY(75 + 55 * 2)
                break;
            case OPTION_MENU_OPTIONS.VOLUME:
                this.optionsMenuCursor.setY(75 + 55 * 3)
                break;
            case OPTION_MENU_OPTIONS.MENU_COLOR:
                this.optionsMenuCursor.setY(75 + 55 * 4)
                break;
            case OPTION_MENU_OPTIONS.CLOSE:
                this.optionsMenuCursor.setY(75 + 55 * 5)
                break;
            default:
                exhaustiveGuard(this.selectedOptionMenu)
        }
        this.selectedOptionInfoMsgTextGameObject.setText(OPTION_MENU_OPTION_INFO_MSG[this.selectedOptionMenu])
    }

    private updateSelectedOptionMenuFromInput(direction: Direction): void {
        if (direction === DIRECTION.NONE) {
            return;
        }

        if (this.selectedOptionMenu === OPTION_MENU_OPTIONS.TEXT_SPEED) {
            switch (direction) {
                case DIRECTION.DOWN:
                    this.selectedOptionMenu = OPTION_MENU_OPTIONS.BATTLE_SCENE
                    return;
                case DIRECTION.UP:
                    this.selectedOptionMenu = OPTION_MENU_OPTIONS.CLOSE
                    return;
                case DIRECTION.RIGHT:
                case DIRECTION.LEFT:
                    this.updateTextSpeedOption(direction)
                    this.updateTextSpeedGameObjects()
                    return;
                default:
                    exhaustiveGuard(direction)
            }
        }

        if (this.selectedOptionMenu === OPTION_MENU_OPTIONS.BATTLE_SCENE) {
            switch (direction) {
                case DIRECTION.DOWN:
                    this.selectedOptionMenu = OPTION_MENU_OPTIONS.SOUND
                    return;
                case DIRECTION.UP:
                    this.selectedOptionMenu = OPTION_MENU_OPTIONS.TEXT_SPEED
                    return;
                case DIRECTION.RIGHT:
                case DIRECTION.LEFT:
                    this.updateBattleSceneOption(direction)
                    this.updateBattleSceneGameObjects()
                    return;
                default:
                    exhaustiveGuard(direction)
            }
        }

        if (this.selectedOptionMenu === OPTION_MENU_OPTIONS.SOUND) {
            switch (direction) {
                case DIRECTION.DOWN:
                    this.selectedOptionMenu = OPTION_MENU_OPTIONS.VOLUME
                    return;
                case DIRECTION.UP:
                    this.selectedOptionMenu = OPTION_MENU_OPTIONS.BATTLE_SCENE
                    return;
                case DIRECTION.RIGHT:
                case DIRECTION.LEFT:
                    this.updateSoundOption(direction)
                    this.updateSoundGameObjects()
                    return;
                default:
                    exhaustiveGuard(direction)
            }
        }

        if (this.selectedOptionMenu === OPTION_MENU_OPTIONS.VOLUME) {
            switch (direction) {
                case DIRECTION.DOWN:
                    this.selectedOptionMenu = OPTION_MENU_OPTIONS.MENU_COLOR
                    return;
                case DIRECTION.UP:
                    this.selectedOptionMenu = OPTION_MENU_OPTIONS.SOUND
                    return;
                case DIRECTION.RIGHT:
                case DIRECTION.LEFT:
                    this.updateVolumeOption(direction)
                    this.updateVolumeGameObjects()
                    return;
                default:
                    exhaustiveGuard(direction)
            }
        }

        if (this.selectedOptionMenu === OPTION_MENU_OPTIONS.MENU_COLOR) {
            switch (direction) {
                case DIRECTION.DOWN:
                    this.selectedOptionMenu = OPTION_MENU_OPTIONS.CLOSE
                    return;
                case DIRECTION.UP:
                    this.selectedOptionMenu = OPTION_MENU_OPTIONS.VOLUME
                    return;
                case DIRECTION.RIGHT:
                case DIRECTION.LEFT:
                    this.updateMenuColorOption(direction)
                    this.updateMenuColorGameObjects()
                    return;
                default:
                    exhaustiveGuard(direction)
            }
        }

        if (this.selectedOptionMenu === OPTION_MENU_OPTIONS.CLOSE) {
            switch (direction) {
                case DIRECTION.DOWN:
                    this.selectedOptionMenu = OPTION_MENU_OPTIONS.TEXT_SPEED
                    return;
                case DIRECTION.UP:
                    this.selectedOptionMenu = OPTION_MENU_OPTIONS.MENU_COLOR
                    return;
                case DIRECTION.RIGHT:
                case DIRECTION.LEFT:
                    return;
                default:
                    exhaustiveGuard(direction)
            }
        }

        exhaustiveGuard(this.selectedOptionMenu as never)
    }

    private updateTextSpeedOption(direction: 'LEFT' | 'RIGHT'): void {
        if (direction === DIRECTION.LEFT) {
            if (this.selectedTextSpeedOption === TEXT_SPEED_OPTIONS.SLOW) {
                return;
            }
            if (this.selectedTextSpeedOption === TEXT_SPEED_OPTIONS.MID) {
                this.selectedTextSpeedOption = TEXT_SPEED_OPTIONS.SLOW
                return;
            }
            if (this.selectedTextSpeedOption === TEXT_SPEED_OPTIONS.FAST) {
                this.selectedTextSpeedOption = TEXT_SPEED_OPTIONS.MID
                return;
            }
            exhaustiveGuard(this.selectedTextSpeedOption)
        }

        if (direction === DIRECTION.RIGHT) {
            if (this.selectedTextSpeedOption === TEXT_SPEED_OPTIONS.SLOW) {
                this.selectedTextSpeedOption = TEXT_SPEED_OPTIONS.MID
                return;
            }
            if (this.selectedTextSpeedOption === TEXT_SPEED_OPTIONS.MID) {
                this.selectedTextSpeedOption = TEXT_SPEED_OPTIONS.FAST
                return;
            }
            if (this.selectedTextSpeedOption === TEXT_SPEED_OPTIONS.FAST) {
                return;
            }
            exhaustiveGuard(this.selectedTextSpeedOption)
        }

        exhaustiveGuard(direction as never)
    }

    private updateTextSpeedGameObjects(): void {
        const textGameObjects: Phaser.GameObjects.Text[] = this.textSpeedOptionTextGameObjects.getChildren() as Phaser.GameObjects.Text[];
        textGameObjects.forEach((obj) => {
            obj.setColor(TEXT_FONT_COLORS.NOT_SELECTED)
        })

        if (this.selectedTextSpeedOption === TEXT_SPEED_OPTIONS.SLOW) {
            textGameObjects[0].setColor(TEXT_FONT_COLORS.SELECTED)
            return;
        }

        if (this.selectedTextSpeedOption === TEXT_SPEED_OPTIONS.MID) {
            textGameObjects[1].setColor(TEXT_FONT_COLORS.SELECTED)
            return;
        }

        if (this.selectedTextSpeedOption === TEXT_SPEED_OPTIONS.FAST) {
            textGameObjects[2].setColor(TEXT_FONT_COLORS.SELECTED)
            return;
        }

        exhaustiveGuard(this.selectedTextSpeedOption)
    }

    private updateBattleSceneOption(direction: 'LEFT' | 'RIGHT'): void {
        if (direction === DIRECTION.LEFT) {
            if (this.selectedBattleSceneOption === BATTLE_SCENE_OPTIONS.ON) {
                return;
            }
            if (this.selectedBattleSceneOption === BATTLE_SCENE_OPTIONS.OFF) {
                this.selectedBattleSceneOption = BATTLE_SCENE_OPTIONS.ON
                return;
            }
            exhaustiveGuard(this.selectedBattleSceneOption)
        }

        if (direction === DIRECTION.RIGHT) {
            if (this.selectedBattleSceneOption === BATTLE_SCENE_OPTIONS.ON) {
                this.selectedBattleSceneOption = BATTLE_SCENE_OPTIONS.OFF
                return;
            }
            if (this.selectedBattleSceneOption === BATTLE_SCENE_OPTIONS.OFF) {
                return;
            }
            exhaustiveGuard(this.selectedBattleSceneOption)
        }

        exhaustiveGuard(direction as never)
    }

    private updateBattleSceneGameObjects(): void {
        const textGameObjects: Phaser.GameObjects.Text[] = this.battleSceneOptionTextGameObjects.getChildren() as Phaser.GameObjects.Text[];
        textGameObjects.forEach((obj) => {
            obj.setColor(TEXT_FONT_COLORS.NOT_SELECTED)
        })

        if (this.selectedBattleSceneOption === BATTLE_SCENE_OPTIONS.ON) {
            textGameObjects[0].setColor(TEXT_FONT_COLORS.SELECTED)
            return;
        }

        if (this.selectedBattleSceneOption === BATTLE_SCENE_OPTIONS.OFF) {
            textGameObjects[1].setColor(TEXT_FONT_COLORS.SELECTED)
            return;
        }

        exhaustiveGuard(this.selectedBattleSceneOption)
    }

    private updateSoundOption(direction: 'LEFT' | 'RIGHT'): void {
        if (direction === DIRECTION.LEFT) {
            if (this.selectedSoundOption === SOUND_OPTIONS.ON) {
                return;
            }
            if (this.selectedSoundOption === SOUND_OPTIONS.OFF) {
                this.selectedSoundOption = SOUND_OPTIONS.ON
                return;
            }
            exhaustiveGuard(this.selectedSoundOption)
        }

        if (direction === DIRECTION.RIGHT) {
            if (this.selectedSoundOption === SOUND_OPTIONS.ON) {
                this.selectedSoundOption = SOUND_OPTIONS.OFF
                return;
            }
            if (this.selectedSoundOption === SOUND_OPTIONS.OFF) {
                return;
            }
            exhaustiveGuard(this.selectedSoundOption)
        }

        exhaustiveGuard(direction as never)
    }

    private updateSoundGameObjects(): void {
        const textGameObjects: Phaser.GameObjects.Text[] = this.soundOptionTextGameObjects.getChildren() as Phaser.GameObjects.Text[];
        textGameObjects.forEach((obj) => {
            obj.setColor(TEXT_FONT_COLORS.NOT_SELECTED)
        })

        if (this.selectedSoundOption === SOUND_OPTIONS.ON) {
            textGameObjects[0].setColor(TEXT_FONT_COLORS.SELECTED)
            return;
        }

        if (this.selectedSoundOption === SOUND_OPTIONS.OFF) {
            textGameObjects[1].setColor(TEXT_FONT_COLORS.SELECTED)
            return;
        }

        exhaustiveGuard(this.selectedSoundOption)
    }

    private updateVolumeOption(direction: 'LEFT' | 'RIGHT'): void {
        if (direction === DIRECTION.LEFT) {
            if (this.selectedVolumeOption === 0) {
                return;
            }
            this.selectedVolumeOption = this.selectedVolumeOption - 1 as VolumeOptions;
        }

        if (direction === DIRECTION.RIGHT) {
            if (this.selectedVolumeOption === 4) {
                return;
            }
            this.selectedVolumeOption = this.selectedVolumeOption + 1 as VolumeOptions;
        }
    }

    private updateVolumeGameObjects(): void {
        switch(this.selectedVolumeOption) {
            case 0:
                this.volumeOptionMenuCursor.setX(420)
                this.volumeOptionValueText.setText('0%')
                break;
            case 1:
                this.volumeOptionMenuCursor.setX(490)
                this.volumeOptionValueText.setText('25%')
                break;
            case 2:
                this.volumeOptionMenuCursor.setX(560)
                this.volumeOptionValueText.setText('50%')
                break;
            case 3:
                this.volumeOptionMenuCursor.setX(630)
                this.volumeOptionValueText.setText('75%')
                break;
            case 4:
                this.volumeOptionMenuCursor.setX(710)
                this.volumeOptionValueText.setText('100%')
                break;
            default: exhaustiveGuard(this.selectedVolumeOption)
                return;
        }
    }

    private updateMenuColorOption(direction: 'LEFT' | 'RIGHT'): void {
        if (direction === DIRECTION.LEFT) {
            if (this.selectedMenuColorOption === 0) {
                this.selectedMenuColorOption = 2
                return;
            }
            this.selectedMenuColorOption = this.selectedMenuColorOption - 1 as MenuColorOptions;
        }

        if (direction === DIRECTION.RIGHT) {
            if (this.selectedMenuColorOption === 2) {
                this.selectedMenuColorOption = 0;
                return;
            }
            this.selectedMenuColorOption = this.selectedMenuColorOption + 1 as MenuColorOptions;
        }
    }

    private updateMenuColorGameObjects(): void {
        switch(this.selectedMenuColorOption) {
            case 0:
                this.selectedMenuColorTextGameObject.setText('1')
                this.nineSliceMainContainer.updateNineSliceContainerTexture(this.sys.textures,this.mainContainer, UI_ASSET_KEYS.MENU_BACKGROUND)
                this.nineSliceMainContainer.updateNineSliceContainerTexture(this.sys.textures,this.infoContainer, UI_ASSET_KEYS.MENU_BACKGROUND)
                break;
            case 1:
                this.selectedMenuColorTextGameObject.setText('2')
                this.nineSliceMainContainer.updateNineSliceContainerTexture(this.sys.textures,this.mainContainer, UI_ASSET_KEYS.MENU_BACKGROUND_GREEN)
                this.nineSliceMainContainer.updateNineSliceContainerTexture(this.sys.textures,this.infoContainer, UI_ASSET_KEYS.MENU_BACKGROUND_GREEN)
                break;
            case 2:
                this.selectedMenuColorTextGameObject.setText('3')
                this.nineSliceMainContainer.updateNineSliceContainerTexture(this.sys.textures,this.mainContainer, UI_ASSET_KEYS.MENU_BACKGROUND_PURPLE)
                this.nineSliceMainContainer.updateNineSliceContainerTexture(this.sys.textures,this.infoContainer, UI_ASSET_KEYS.MENU_BACKGROUND_PURPLE)
                break;
            default: exhaustiveGuard(this.selectedMenuColorOption)
                return;
        }
    }
}