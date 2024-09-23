import Phaser from "phaser"
import {Direction, DIRECTION} from "../common/direction"

export class Controls {
    private scene: Phaser.Scene
    private readonly cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys | undefined
    private readonly escapeKey: Phaser.Input.Keyboard.Key | undefined
    private lockPlayerInput: boolean

    constructor(scene: Phaser.Scene) {
        this.scene = scene
        this.cursorKeys = this.scene.input.keyboard?.createCursorKeys()
        this.escapeKey = this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
        this.lockPlayerInput = false
    }

    public get isInputLocked(): boolean {
        return this.lockPlayerInput
    }

    public set lockInput(value: boolean) {
        this.lockPlayerInput = value
    }

    public wasEscapeKeyPressed(): boolean {
        if (this.escapeKey === undefined) {
            return false
        }
        return Phaser.Input.Keyboard.JustDown(this.escapeKey)
    }

    public wasSpaceKeyPressed(): boolean {
        if (this.cursorKeys === undefined) {
            return false
        }
        return Phaser.Input.Keyboard.JustDown(this.cursorKeys.space)
    }

    public wasBackKeyPressed(): boolean {
        if (this.cursorKeys === undefined) {
            return false
        }
        return Phaser.Input.Keyboard.JustDown(this.cursorKeys.shift)
    }

    public getDirectionKeyPressedDown(): Direction {
        if (this.cursorKeys === undefined) {
            return DIRECTION.NONE
        }

        let selectedDirection: Direction = DIRECTION.NONE
        if (this.cursorKeys.left.isDown) {
            selectedDirection = DIRECTION.LEFT
        } else if (this.cursorKeys.right.isDown) {
            selectedDirection = DIRECTION.RIGHT
        } else if (this.cursorKeys.up.isDown) {
            selectedDirection = DIRECTION.UP
        } else if (this.cursorKeys.down.isDown) {
            selectedDirection = DIRECTION.DOWN
        }

        return selectedDirection
    }

    public getDirectionKeyJustDown(): Direction {
        if (this.cursorKeys === undefined) {
            return DIRECTION.NONE
        }

        let selectedDirection: Direction = DIRECTION.NONE
        if (Phaser.Input.Keyboard.JustDown(this.cursorKeys.left)) {
            selectedDirection = DIRECTION.LEFT
        } else if (Phaser.Input.Keyboard.JustDown(this.cursorKeys.right)) {
            selectedDirection = DIRECTION.RIGHT
        } else if (Phaser.Input.Keyboard.JustDown(this.cursorKeys.up)) {
            selectedDirection = DIRECTION.UP
        } else if (Phaser.Input.Keyboard.JustDown(this.cursorKeys.down)) {
            selectedDirection = DIRECTION.DOWN
        }

        return selectedDirection
    }


}