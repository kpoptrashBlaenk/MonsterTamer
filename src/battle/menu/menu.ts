import Phaser from "phaser";
import {CUSTOM_FONTS} from "../../assets/font-keys";
import {UI_ASSET_KEYS} from "../../assets/asset-keys";
import {DIRECTION, Direction} from "../../common/direction";
import {exhaustiveGuard} from "../../utils/guard";
import {DATA_MANAGER_STORE_KEYS, dataManager} from "../../utils/data-manager";
import {MENU_COLOR} from "./menu-config";

export const MENU_OPTIONS = Object.freeze({
    MONSTERDEX: 'MONSTERDEX',
    MONSTERS: 'MONSTERS',
    BAG: 'BAG',
    SAVE: 'SAVE',
    OPTIONS: 'OPTIONS',
    EXIT: 'EXIT'
})
export type MenuOptions = keyof typeof MENU_OPTIONS

const MENU_TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = Object.freeze({
    fontFamily: CUSTOM_FONTS.POKEROGUE,
    color: '#FFFFFF',
    fontSize: '35px'
})

export class Menu {
    private scene: Phaser.Scene
    private readonly padding: number
    private readonly width: number
    private readonly height: number
    private readonly graphics: Phaser.GameObjects.Graphics
    private container: Phaser.GameObjects.Container
    private isVisible: boolean
    private readonly availableMenuOptions: MenuOptions[]
    private readonly menuOptionsTextGameObjects: Phaser.GameObjects.Text[]
    private selectedMenuOptionIndex: number
    private selectedMenuOption: MenuOptions
    private readonly userInputCursor: Phaser.GameObjects.Image

    constructor(scene: Phaser.Scene) {
        this.scene = scene
        this.padding = 4
        this.width = 300

        this.availableMenuOptions = [MENU_OPTIONS.SAVE, MENU_OPTIONS.EXIT]
        this.menuOptionsTextGameObjects = []
        this.selectedMenuOptionIndex = 0

        this.height = 10 + this.padding * 2 + this.availableMenuOptions.length * 50

        this.graphics = this.createGraphics()
        this.container = this.scene.add.container(this.scene.cameras.main.width - this.width - this.padding, 0, [this.graphics])

        for (let i = 0; i < this.availableMenuOptions.length; i++) {
            const y = 10 + 50 * i + this.padding
            const textObj = this.scene.add.text(40 + this.padding, y, this.availableMenuOptions[i], MENU_TEXT_STYLE)
            this.menuOptionsTextGameObjects.push(textObj)
            this.container.add(this.menuOptionsTextGameObjects)
        }

        this.userInputCursor = this.scene.add.image(20 + this.padding, 29 + this.padding, UI_ASSET_KEYS.CURSOR_WHITE)
        this.userInputCursor.setScale(2)
        this.container.add(this.userInputCursor)

        this.hide()
    }

    public get getIsVisible(): boolean {
        return this.isVisible
    }

    public get getSelectedMenuOption(): MenuOptions {
        return this.selectedMenuOption
    }

    public show(): void {
        this.container.setAlpha(0.9)
        this.isVisible = true
    }

    public hide(): void {
        this.container.setAlpha(0)
        this.selectedMenuOptionIndex = 0
        this.moveMenuCursor(DIRECTION.NONE)
        this.isVisible = false
    }

    public handlePlayerInput(input: Direction | 'OK' | 'CANCEL'): void {
        if (input === 'CANCEL') {
            this.hide()
            return
        }
        if (input === 'OK') {
            this.handleSelectedMenuOption()
            return
        }

        this.moveMenuCursor(input)
    }

    private handleSelectedMenuOption(): void {
        this.selectedMenuOption = this.availableMenuOptions[this.selectedMenuOptionIndex]
    }

    private moveMenuCursor(direction: Direction): void {
        switch (direction) {
            case DIRECTION.UP:
                this.selectedMenuOptionIndex -= 1
                if (this.selectedMenuOptionIndex < 0) {
                    this.selectedMenuOptionIndex = this.availableMenuOptions.length - 1
                }
                break
            case DIRECTION.DOWN:
                this.selectedMenuOptionIndex += 1
                if (this.selectedMenuOptionIndex > this.availableMenuOptions.length - 1) {
                    this.selectedMenuOptionIndex = 0
                }
                break
            case DIRECTION.RIGHT:
            case DIRECTION.LEFT:
                return
            case DIRECTION.NONE:
                break
            default:
                exhaustiveGuard(direction)
        }

        const x = 20 + this.padding
        const y = 29 + this.padding + this.selectedMenuOptionIndex * 50

        this.userInputCursor.setPosition(x, y)
    }

    private createGraphics(): Phaser.GameObjects.Graphics {
        const g = this.scene.add.graphics()
        const menuColor = this.getMenuColorsFromDataManager()

        g.fillStyle(menuColor.main, 1)
        g.fillRect(1, 0, this.width - 1, this.height - 1)
        g.lineStyle(8, menuColor.border, 1)
        g.strokeRect(0, 0, this.width, this.height)
        g.setAlpha(0.9)
        return g
    }

    private getMenuColorsFromDataManager(): { main: number, border: number } {
        const chosenMenuColor = dataManager.getStore.get(DATA_MANAGER_STORE_KEYS.OPTIONS_MENU_COLOR)
        if (chosenMenuColor === 'undefined') {
            return MENU_COLOR[1]
        }

        switch (chosenMenuColor) {
            case 0:
                return MENU_COLOR[1]
            case 1:
                return MENU_COLOR[2]
            case 2:
                return MENU_COLOR[3]
            default:
                exhaustiveGuard(chosenMenuColor as never)
        }

        return {
            main: 0x32454c,
            border: 0x6d9aa8
        }
    }
}