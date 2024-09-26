import Phaser from "phaser";
import {SceneKeys} from "./scene-keys";
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
        this.log(`[${this.constructor.name}:init] invoked`)
    }

    preload() {
        this.log(`[${this.constructor.name}:preload] invoked`)
    }

    create() {
        this.log(`[${this.constructor.name}:create] invoked`)

        // Create Controls
        this.controls = new Controls(this)
    }

    update(time?: number) {

    }

    protected log(message: string) {
        console.log(`%c${message}`, 'color: orange; background: black;')
    }
}