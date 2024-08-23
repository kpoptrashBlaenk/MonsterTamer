import Phaser from '../../lib/phaser.js'
import {MONSTER_ASSET_KEYS} from "../../assets/asset-keys.js";

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

export class BattleMenu {
    /** @type {Phaser.Scene} */
    #scene;
    /** @type {Phaser.GameObjects.Container} */
    #mainBattleMenuPhaserContainerGameObject;
    /** @type {Phaser.GameObjects.Container} */
    #moveSelectionSubMenuPhaserContainerGameObject;
    /** @type {Phaser.GameObjects.Text} */
    #battleTextGameObjectLine1;
    /** @type {Phaser.GameObjects.Text} */
    #battleTextGameObjectLine2;

    /**
     *
     * @param {Phaser.Scene} scene The scene to be added
     */
    constructor(scene) {
        this.#scene = scene;
        this.#createMainInfoPane()
        this.#createMainBattleMenu()
        this.#createMonsterAttackSubMenu()
    }

    showMainBattleMenu() {
        this.#battleTextGameObjectLine1.setText('What should')
        this.#mainBattleMenuPhaserContainerGameObject.setAlpha(1)
        this.#battleTextGameObjectLine1.setAlpha(1)
        this.#battleTextGameObjectLine2.setAlpha(1)
    }

    hideMainBattleMenu() {
        this.#mainBattleMenuPhaserContainerGameObject.setAlpha(0)
        this.#battleTextGameObjectLine1.setAlpha(0)
        this.#battleTextGameObjectLine2.setAlpha(0)
    }

    showMonsterAttackSubMenu() {
        this.#moveSelectionSubMenuPhaserContainerGameObject.setAlpha(1)
    }

    hideMonsterAttackSubMenu() {
        this.#moveSelectionSubMenuPhaserContainerGameObject.setAlpha(0)
    }

    /**
     *
     * @param {Direction | 'OK' | 'CANCEL'} input
     */
    handlePlayerInput(input) {
        console.log(input)
        if(input === 'CANCEL') {
            this.hideMonsterAttackSubMenu()
            this.showMainBattleMenu()
            return;
        }
        if(input === 'OK') {
            this.hideMainBattleMenu()
            this.showMonsterAttackSubMenu()
        }
    }

    // TODO: update to use monster data that is passed into this class instance
    #createMainBattleMenu() {
        this.#battleTextGameObjectLine1 = this.#scene.add.text(20, 468, 'What should', battleUITextStyle)
        this.#battleTextGameObjectLine2 = this.#scene.add.text(20, 512, `${MONSTER_ASSET_KEYS.IGUANIGNITE} do next?`, battleUITextStyle)
        this.#mainBattleMenuPhaserContainerGameObject = this.#scene.add.container(520, 448, [
            this.#createSubInfoPane(),
            this.#scene.add.text(55, 22, BATTLE_MENU_OPTIONS.FIGHT, battleUITextStyle),
            this.#scene.add.text(240, 22, BATTLE_MENU_OPTIONS.SWITCH, battleUITextStyle),
            this.#scene.add.text(55, 70, BATTLE_MENU_OPTIONS.ITEM, battleUITextStyle),
            this.#scene.add.text(240, 70, BATTLE_MENU_OPTIONS.FLEE, battleUITextStyle)
        ])

        this.hideMainBattleMenu()
    }

    #createMonsterAttackSubMenu() {
        this.#moveSelectionSubMenuPhaserContainerGameObject =this.#scene.add.container(0, 448, [
            this.#scene.add.text(55, 22, 'Slash', battleUITextStyle),
            this.#scene.add.text(240, 22, 'Growl', battleUITextStyle),
            this.#scene.add.text(55, 70, '-', battleUITextStyle),
            this.#scene.add.text(240, 70, '-', battleUITextStyle)
        ])

        this.hideMonsterAttackSubMenu()
    }

    #createMainInfoPane() {
        const padding = 4;
        const rectangleHeight = 124;
        this.#scene.add.rectangle(padding, this.#scene.scale.height - rectangleHeight - padding, this.#scene.scale.width - padding * 2, rectangleHeight, 0xede4f3, 1)
            .setOrigin(0)
            .setStrokeStyle(8, 0xe4434a, 1)
    }

    #createSubInfoPane() {
        const rectangleWidth = 500;
        const rectangleHeight = 124;
        return this.#scene.add.rectangle(0, 0, rectangleWidth, rectangleHeight, 0xede4f3, 1)
            .setOrigin(0)
            .setStrokeStyle(8, 0x905ac2, 1)
    }
}