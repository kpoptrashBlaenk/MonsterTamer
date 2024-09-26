import Phaser from "phaser";
import {SceneKeys} from "./scene-keys";
import {Controls} from "../../utils/controls";

export class BaseScene extends Phaser.Scene {
    protected controls: Controls

    constructor(config: { key: SceneKeys}) {
        super(config)
    }

    init() {
        console.log(`[${this.constructor.name}:init] invoked`)
    }

    preload() {
        console.log(`[${this.constructor.name}:preload] invoked`)
    }

    create() {
        console.log(`[${this.constructor.name}:create] invoked`)

        // Create Controls
        this.controls = new Controls(this)
    }

    update(time?: number) {

    }
}