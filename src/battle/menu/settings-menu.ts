import Phaser from "../../lib/phaser.ts";
import {CUSTOM_FONTS} from "../../assets/font-keys.ts";

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
    private padding: number
    private width: number
    private height: number
    private graphics: Phaser.GameObjects.Graphics
    private container: Phaser.GameObjects.Container
    private isVisible: boolean
    private availableMenuOptions: MenuOptions[]
    private menuOptionsTextGameObjects: Phaser.GameObjects.Text[]
    private selectedMenuOptionIndex: number
    private selectedMenuOption: MenuOptions

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

        //this.hide()
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
        this.isVisible = false
    }

    private createGraphics(): Phaser.GameObjects.Graphics {
        const g = this.scene.add.graphics()
        g.fillStyle(0x32454c, 1)
        g.fillRect(1, 0, this.width - 1, this.height - 1)
        g.lineStyle(8, 0x6d9aa8, 1)
        g.strokeRect(0, 0, this.width, this.height)
        g.setAlpha(0.9)
        return g
    }
}