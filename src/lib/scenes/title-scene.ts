import Phaser from "phaser";
import {SCENE_KEYS} from "./scene-keys";
import {TITLE_ASSET_KEYS, UI_ASSET_KEYS} from "../../assets/asset-keys";
import {CUSTOM_FONTS} from "../../assets/font-keys";
import {Controls} from "../../utils/controls";
import {Direction, DIRECTION} from "../../common/direction";
import {exhaustiveGuard} from "../../utils/guard";
import {Coordinate} from "../../types/typedef";
import {NineSlice} from "../../utils/nine-slice";
import {DATA_MANAGER_STORE_KEYS, dataManager} from "../../utils/data-manager";

const MENU_TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = Object.freeze({
    fontFamily: CUSTOM_FONTS.POKEROGUE,
    color: '4D4A49',
    fontSize: '35px'
})

const PLAYER_INPUT_CURSOR_POSITION: Coordinate = Object.freeze({
    x: 170,
    y: 41
})

const MAIN_MENU_OPTIONS = Object.freeze({
    NEW_GAME: 'NEW_GAME',
    CONTINUE: 'CONTINUE',
    OPTIONS: 'OPTIONS',
})
type MainMenuOptions = keyof typeof MAIN_MENU_OPTIONS

export class TitleScene extends Phaser.Scene {
    private mainMenuCursorPhaserImageGameObject: Phaser.GameObjects.Image;
    private controls: Controls;
    private selectedMenuOption: MainMenuOptions;
    private isContinueButtonEnabled: boolean;
    private nineSliceMenu: NineSlice;

    constructor() {
        super({
            key: SCENE_KEYS.TITLE_SCENE,
        });
    }

    init() {
        this.nineSliceMenu = new NineSlice({
            cornerCutSize: 32,
            textureManager: this.sys.textures,
            assetKeys: [UI_ASSET_KEYS.MENU_BACKGROUND]
        })
    }

    create() {
        this.selectedMenuOption = MAIN_MENU_OPTIONS.NEW_GAME;
        this.isContinueButtonEnabled = dataManager.getStore.get(DATA_MANAGER_STORE_KEYS.GAME_STARTED) || false;

        // Create Images
        this.add.image(0, 0, TITLE_ASSET_KEYS.BACKGROUND).setOrigin(0).setScale(0.58)
        this.add.image(this.scale.width / 2, 150, TITLE_ASSET_KEYS.PANEL).setScale(0.25, 0.25).setAlpha(0.5)
        this.add.image(this.scale.width / 2, 150, TITLE_ASSET_KEYS.TITLE).setScale(0.55).setAlpha(0.5)

        // Create Menu
        const menuBgWidth: number = 500;
        const menuBgContainer: Phaser.GameObjects.Container = this.nineSliceMenu.createNineSliceContainer(this, menuBgWidth, 200, UI_ASSET_KEYS.MENU_BACKGROUND);
        const newGameText: Phaser.GameObjects.Text = this.add.text(menuBgWidth / 2, 40, 'New Game', MENU_TEXT_STYLE).setOrigin(0.5);
        const continueText: Phaser.GameObjects.Text = this.add.text(menuBgWidth / 2, 90, 'Continue', MENU_TEXT_STYLE).setOrigin(0.5);
        if(!this.isContinueButtonEnabled) {
            continueText.setAlpha(0.5)
        }
        const optionsText: Phaser.GameObjects.Text = this.add.text(menuBgWidth / 2, 140, 'Options', MENU_TEXT_STYLE).setOrigin(0.5);
        const menuContainer: Phaser.GameObjects.Container = this.add.container(0, 0, [menuBgContainer, newGameText, continueText, optionsText]);
        menuContainer.setPosition(this.scale.width / 2 - menuBgWidth / 2, 300)

        // Create Cursor
        this.mainMenuCursorPhaserImageGameObject = this.add.image(PLAYER_INPUT_CURSOR_POSITION.x, PLAYER_INPUT_CURSOR_POSITION.y, UI_ASSET_KEYS.CURSOR).setOrigin(0.5).setScale(2.5);
        menuContainer.add(this.mainMenuCursorPhaserImageGameObject)
        this.add.tween({
            delay: 0,
            duration: 500,
            repeat: -1,
            x: {
                from: PLAYER_INPUT_CURSOR_POSITION.x,
                start: PLAYER_INPUT_CURSOR_POSITION.x,
                to: PLAYER_INPUT_CURSOR_POSITION.x + 3
            },
            targets: this.mainMenuCursorPhaserImageGameObject
        })

        // Fade Effects
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            if (this.selectedMenuOption === MAIN_MENU_OPTIONS.OPTIONS) {
                this.scene.start(SCENE_KEYS.OPTIONS_SCENE)
                return;
            }

            // This just resets game state, so regardless if New Game or Continue (only other option) we will go to first scene
            if (this.selectedMenuOption === MAIN_MENU_OPTIONS.NEW_GAME) {
                dataManager.startNewGame()
            }

            this.scene.start(SCENE_KEYS.BATTLE_SCENE)
        })

        // Create Controls
        this.controls = new Controls(this);
    }

    update() {
        if (this.controls.isInputLocked) {
            return;
        }

        const wasSpaceKeyPressed = this.controls.wasSpaceKeyPressed()
        if (wasSpaceKeyPressed) {
            this.cameras.main.fadeOut(500,0,0,0)
            this.controls.lockInput = true;
            return;
        }

        let selectedDirection: Direction = this.controls.getDirectionKeyJustDown()
        if (selectedDirection !== DIRECTION.NONE) {
            this.moveMenuSelectCursor(selectedDirection)
        }
    }

    private moveMenuSelectCursor(direction: Direction): void {
        this.updateSelectedOptionFromInput(direction)
        switch (this.selectedMenuOption) {
            case MAIN_MENU_OPTIONS.NEW_GAME:
                this.mainMenuCursorPhaserImageGameObject.setY(PLAYER_INPUT_CURSOR_POSITION.y)
                break;
            case MAIN_MENU_OPTIONS.CONTINUE:
                this.mainMenuCursorPhaserImageGameObject.setY(91)
                break;
            case MAIN_MENU_OPTIONS.OPTIONS:
                this.mainMenuCursorPhaserImageGameObject.setY(141)
                break;
            default:
                exhaustiveGuard(this.selectedMenuOption)
        }
    }

    private updateSelectedOptionFromInput(direction: Direction): void {
        switch (direction) {
            case DIRECTION.UP:
                if (this.selectedMenuOption === MAIN_MENU_OPTIONS.NEW_GAME) {
                    return;
                }
                if (this.selectedMenuOption === MAIN_MENU_OPTIONS.CONTINUE) {
                    this.selectedMenuOption = MAIN_MENU_OPTIONS.NEW_GAME
                    return;
                }
                if (this.selectedMenuOption === MAIN_MENU_OPTIONS.OPTIONS && !this.isContinueButtonEnabled) {
                    this.selectedMenuOption = MAIN_MENU_OPTIONS.NEW_GAME
                    return;
                }
                if (this.selectedMenuOption === MAIN_MENU_OPTIONS.OPTIONS) {
                    this.selectedMenuOption = MAIN_MENU_OPTIONS.CONTINUE
                    return;
                }
                return;
            case DIRECTION.DOWN:
                if (this.selectedMenuOption === MAIN_MENU_OPTIONS.NEW_GAME && !this.isContinueButtonEnabled) {
                    this.selectedMenuOption = MAIN_MENU_OPTIONS.OPTIONS
                    return;
                }
                if (this.selectedMenuOption === MAIN_MENU_OPTIONS.NEW_GAME) {
                    this.selectedMenuOption = MAIN_MENU_OPTIONS.CONTINUE
                    return;
                }
                if (this.selectedMenuOption === MAIN_MENU_OPTIONS.CONTINUE) {
                    this.selectedMenuOption = MAIN_MENU_OPTIONS.OPTIONS
                    return;
                }
                if (this.selectedMenuOption === MAIN_MENU_OPTIONS.OPTIONS) {
                    return;
                }
                return;
            case DIRECTION.LEFT:
            case DIRECTION.RIGHT:
            case DIRECTION.NONE:
                return;
            default:
                exhaustiveGuard(direction)

        }
    }
}