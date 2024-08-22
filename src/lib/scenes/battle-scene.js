import Phaser from '../phaser.js';
import {SCENE_KEYS} from "./scene-keys.js";
import {
    BATTLE_ASSET_KEYS, BATTLE_BACKGROUND_ASSET_KEYS, HEALTH_BAR_ASSET_KEYS, MONSTER_ASSET_KEYS
} from "../../assets/asset-keys.js";

const BATTLE_MENU_OPTIONS = Object.freeze({
    FIGHT: 'FIGHT',
    SWITCH: 'SWITCH',
    ITEM: 'ITEM',
    FLEE: 'FLEE'
})

const battleUITextStyle = {
    color: 'black',
    fontSize: '30px'
}

export class BattleScene extends Phaser.Scene {
    constructor() {
        super({
            key: SCENE_KEYS.BATTLE_SCENE,
        });
        console.log(SCENE_KEYS.BATTLE_SCENE)
    }

    create() {
        // Background
        this.add.image(0, 0, BATTLE_BACKGROUND_ASSET_KEYS.FOREST)
            .setOrigin(0)

        // Monsters
        this.add.image(768, 144, MONSTER_ASSET_KEYS.CARNODUSK, 0)
        this.add.image(256, 316, MONSTER_ASSET_KEYS.IGUANIGNITE, 0)
            .setFlipX(true)

        // Player Health Bar
        const playerMonsterName = this.add.text(30, 20, MONSTER_ASSET_KEYS.IGUANIGNITE, {
                color: '#7E3D3F',
                fontSize: '32px'
        })
        this.add.container(556, 318, [
                this.add.image(0, 0, BATTLE_ASSET_KEYS.HEALTH_BAR_BACKGROUND)
                    .setOrigin(0),
                playerMonsterName,
                this.#createHealthBar(34, 34),
                this.add.text(playerMonsterName.width + 35, 23, 'L5', {
                        color: '#ED474B',
                        fontSize: '28px',
                        fontWeight: 'bold'
                }),
                this.add.text(30, 58, 'HP', {
                        color: '#FF6505',
                        fontSize: '24px',
                        fontStyle: 'italic',
                        fontWeight: 'bold'
                }),
                this.add.text(443, 80, '25/25', {
                        color: '#7E3D3F',
                        fontSize: '16px'
                }).setOrigin(1, 0)
        ])

        // Enemy Health Bar
        const enemyMonsterName = this.add.text(30, 20, MONSTER_ASSET_KEYS.CARNODUSK, {
                color: '#7E3D3F',
                fontSize: '32px'
        })
        this.add.container(0, 0, [
                this.add.image(0, 0, BATTLE_ASSET_KEYS.HEALTH_BAR_BACKGROUND)
                    .setOrigin(0)
                    .setScale(1, 0.8),
                enemyMonsterName,
                this.#createHealthBar(34, 34),
                this.add.text(enemyMonsterName.width + 35, 23, 'L5', {
                        color: '#ED474B',
                        fontSize: '28px',
                        fontWeight: 'bold'
                }),
                this.add.text(30, 58, 'HP', {
                        color: '#FF6505',
                        fontSize: '24px',
                        fontStyle: 'italic',
                        fontWeight: 'bold'
                })
        ])

        // Main and Sub Info Pane
        this.#createMainInfoPane()
        this.add.container(520, 448, [
            this.#createSubInfoPane(),
            this.add.text(55, 22, BATTLE_MENU_OPTIONS.FIGHT, battleUITextStyle),
            this.add.text(240, 22, BATTLE_MENU_OPTIONS.SWITCH, battleUITextStyle),
            this.add.text(55, 70, BATTLE_MENU_OPTIONS.ITEM, battleUITextStyle),
            this.add.text(240, 70, BATTLE_MENU_OPTIONS.FLEE, battleUITextStyle)
        ])

        this.add.container(0, 448, [
            this.#createSubInfoPane(),
            this.add.text(55, 22, 'Slash', battleUITextStyle),
            this.add.text(240, 22, 'Growl', battleUITextStyle),
            this.add.text(55, 70, '-', battleUITextStyle),
            this.add.text(240, 70, '-', battleUITextStyle)
        ])
    }

    #createHealthBar(x, y) {
        const scaleY = 0.7
        const leftCap = this.add.image(x, y, HEALTH_BAR_ASSET_KEYS.LEFT_CAP)
            .setOrigin(0, 0.5)
            .setScale(1, scaleY)
        const middle = this.add.image(leftCap.x + leftCap.width, y, HEALTH_BAR_ASSET_KEYS.MIDDLE)
            .setOrigin(0, 0.5)
            .setScale(1, scaleY)
        middle.displayWidth = 360;
        const rightCap = this.add.image(middle.x + middle.displayWidth, y, HEALTH_BAR_ASSET_KEYS.RIGHT_CAP)
            .setOrigin(0, 0.5)
            .setScale(1, scaleY)
        return this.add.container(x, y, [leftCap, middle, rightCap])
    }

    #createMainInfoPane() {
        const padding = 4;
        const rectangleHeight = 124;
        this.add.rectangle(padding, this.scale.height - rectangleHeight - padding, this.scale.width - padding * 2, rectangleHeight, 0xede4f3, 1)
            .setOrigin(0)
            .setStrokeStyle(8, 0xe4434a, 1)
    }

    #createSubInfoPane() {
        const rectangleWidth = 500;
        const rectangleHeight = 124;
        return this.add.rectangle(0, 0, rectangleWidth, rectangleHeight, 0xede4f3, 1)
            .setOrigin(0)
            .setStrokeStyle(8, 0x905ac2, 1)
    }
}