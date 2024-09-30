import Phaser from "phaser";
import {SceneKeys} from "./scene-keys";
import {Controls} from "../../utils/controls";

export class BaseScene extends Phaser.Scene {
    protected controls: Controls

    constructor(config: { key: SceneKeys }) {
        super(config)
        if (this.constructor === BaseScene) {
            throw new Error('BaseScene is an abstract class and cannot be instantiated.');
        }
    }

    init(data?: any | undefined) {
        if (data) {
            this.log(`[${this.constructor.name}:init] invoked, data provided: ${JSON.stringify(data)}`)
            return
        }
        this.log(`[${this.constructor.name}:init] invoked`)
    }

    preload() {
        this.log(`[${this.constructor.name}:preload] invoked`)
    }

    create() {
        this.log(`[${this.constructor.name}:create] invoked`)

        this.controls = new Controls(this)
        this.events.on(Phaser.Scenes.Events.RESUME, this.handleSceneResume, this)
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleSceneCleanup, this)

        this.scene.bringToTop()
    }

    update() {
    }

    public handleSceneResume(sys: Phaser.Scenes.Systems, data?: any | undefined) {
        if (data) {
            this.log(`[${this.constructor.name}:handleSceneResume] invoked, data provided: ${JSON.stringify(data)}`)
            return;
        }
        this.log(`[${this.constructor.name}:handleSceneResume] invoked`)
    }

    public handleSceneCleanup() {
        this.log(`[${this.constructor.name}:handleSceneCleanup] invoked`);
        this.events.off(Phaser.Scenes.Events.RESUME, this.handleSceneResume, this);
    }

    protected log(message: string) {
        console.log(`%c${message}`, 'color: orange; background: black;');
    }
}