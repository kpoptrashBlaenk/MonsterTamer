import Phaser from "phaser";
import {SceneKeys} from "./scene-keys";

export class BaseScene extends Phaser.Scene {

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
    }

    update(time?: number) {

    }
}