import {Coordinate} from "../../types/typedef";

export class Attack {
    protected scene: Phaser.Scene;
    protected position: Coordinate;
    protected isAnimationPlaying: boolean;
    protected attackGameObject: Phaser.GameObjects.Sprite | Phaser.GameObjects.Container | undefined;

    constructor(scene: Phaser.Scene, position: Coordinate) {
        this.scene = scene;
        this.position = position;
        this.isAnimationPlaying = false;
        this.attackGameObject = undefined;
    }

    public getGameObject(): Phaser.GameObjects.Sprite | Phaser.GameObjects.Container | undefined {
        return this.attackGameObject;
    }

    public playAnimation(callback: () => void): void {
        console.log(callback)
        throw new Error("Parent class can't have animations")
    }
}