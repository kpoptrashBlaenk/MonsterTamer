import Phaser from "phaser";
import {SceneKeys} from "./scene-keys";
import {Controls} from "../../utils/controls";

const SCENE_LOG_COLORS = Object.freeze({
    TEST_SCENE: 'orange',
    PRELOAD_SCENE: 'lightgray',
    BATTLE_SCENE: 'red',
    TITLE_SCENE: 'gold',
    OPTIONS_SCENE: 'cyan',
    MAIN_GAME_SCENE: 'deepskyblue',
    MONSTER_PARTY_SCENE: 'mediumpurple',
} as const)

type SceneLogColors = typeof SCENE_LOG_COLORS[keyof typeof SCENE_LOG_COLORS]

export class BaseScene extends Phaser.Scene {
    private readonly color: SceneLogColors
    protected controls: Controls

    constructor(config: { key: SceneKeys }) {
        super(config)
        if (this.constructor === BaseScene) {
            throw new Error('BaseScene is an abstract class and cannot be instantiated directly.')
        }

        this.color = SCENE_LOG_COLORS[config.key]
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
        console.log(`%c${message}`, `color: ${this.color}; background: black;`)
    }
}