import Phaser from "phaser";
import {SCENE_KEYS, SceneKeys} from "./scene-keys";
import {Controls} from "../../utils/controls";

export class BaseScene extends Phaser.Scene {
    protected controls: Controls

    constructor(config: { key: SceneKeys}) {
        super(config)
        if(this.constructor === BaseScene) {
            throw new Error('BaseScene is an abstract class and cannot be instantiated directly.')
        }
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