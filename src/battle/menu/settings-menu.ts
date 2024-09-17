export class Menu {
    private scene: Phaser.Scene
    private padding: number
    private width: number
    private height: number
    private graphics: Phaser.GameObjects.Graphics
    private container: Phaser.GameObjects.Container
    private isVisible: boolean

    constructor(scene: Phaser.Scene) {
        this.scene = scene
        this.padding = 4
        this.width = 300
        this.height = 10 + this.padding * 2 + 50

        this.graphics = this.createGraphics()
        this.container = this.scene.add.container(this.scene.cameras.main.width - this.width - this.padding, 0, [this.graphics])
        this.isVisible = false
        this.hide()
    }

    get getIsVisible(): boolean {
        return this.isVisible
    }

    show(): void {
        this.container.setAlpha(0.9)
        this.isVisible = true
    }

    hide(): void {
        this.container.setAlpha(0)
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