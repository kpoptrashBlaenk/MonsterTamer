import Phaser from '../../lib/phaser.js'
import {MONSTER_ASSET_KEYS, UI_ASSET_KEYS} from "../../assets/asset-keys.js";
import {DIRECTION} from "../../common/direction.js";
import {exhaustiveGuard} from "../../utils/guard.js";
import {ACTIVE_BATTLE_MENU, ATTACK_MOVE_OPTIONS, BATTLE_MENU_OPTIONS} from "../ui/battle-menu-options.js";
import {BATTLE_UI_TEXT_STYLE} from "../ui/battle-menu-config.js";

const BATTLE_MENU_CURSOR_POSITION = Object.freeze({
    x: 42,
    y: 35
})

const ATTACK_MENU_CURSOR_POSITION = Object.freeze({
    x: 42,
    y: 35
})

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
    /** @type {Phaser.GameObjects.Image} */
    #mainBattleMenuCursorPhaserImageGameObject;
    /** @type {Phaser.GameObjects.Image} */
    #attackBattleMenuCursorPhaserImageGameObject;
    /** @type {BattleMenuOptions} */
    #selectedBattleMenuOption;
    /** @type {AttackMoveOptions} */
    #selectedAttackMoveOption;
    /** @type {ActiveBattleMenu} */
    #activeBattleMenu;
    /** @type {string[]} */
    #queuedInfoPanelMessages;
    /** @type {() => void | undefined} */
    #queuedInfoPanelCallback;
    /** @type {boolean} */
    #waitingForPlayerInput;
    /** @type {number | undefined} */
    #selectedAttackIndex;
    /** @type {BattleMonster} */
    #activePlayerMonster

    /**
     *
     * @param {Phaser.Scene} scene The scene to be added
     * @param {BattleMonster} activePlayerMonster
     */
    constructor(scene, activePlayerMonster) {
        this.#scene = scene;
        this.#activePlayerMonster = activePlayerMonster;
        this.#activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_MAIN;
        this.#selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FIGHT;
        this.#selectedAttackMoveOption = ATTACK_MOVE_OPTIONS.MOVE_1;
        this.#queuedInfoPanelCallback = undefined;
        this.#queuedInfoPanelMessages = [];
        this.#waitingForPlayerInput = false;
        this.#selectedAttackIndex = undefined;
        this.#createMainInfoPane()
        this.#createMainBattleMenu()
        this.#createMonsterAttackSubMenu()
    }

    /** @type {number | undefined} */
    get selectedAttack() {
        if (this.#activeBattleMenu === ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT) {
            return this.#selectedAttackIndex;
        }
        return undefined;
    }

    showMainBattleMenu() {
        this.#activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_MAIN
        this.#battleTextGameObjectLine1.setText('What should')
        this.#mainBattleMenuPhaserContainerGameObject.setAlpha(1)
        this.#battleTextGameObjectLine1.setAlpha(1)
        this.#battleTextGameObjectLine2.setAlpha(1)

        this.#selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FIGHT
        this.#mainBattleMenuCursorPhaserImageGameObject.setPosition(BATTLE_MENU_CURSOR_POSITION.x, BATTLE_MENU_CURSOR_POSITION.y)
        this.#selectedAttackIndex = undefined;
    }

    hideMainBattleMenu() {
        this.#mainBattleMenuPhaserContainerGameObject.setAlpha(0)
        this.#battleTextGameObjectLine1.setAlpha(0)
        this.#battleTextGameObjectLine2.setAlpha(0)
    }

    showMonsterAttackSubMenu() {
        this.#activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT
        this.#moveSelectionSubMenuPhaserContainerGameObject.setAlpha(1)
    }

    hideMonsterAttackSubMenu() {
        this.#activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_MAIN;
        this.#moveSelectionSubMenuPhaserContainerGameObject.setAlpha(0)
    }

    /**
     *
     * @param {Direction | 'OK' | 'CANCEL'} input
     */
    handlePlayerInput(input) {
        if (this.#waitingForPlayerInput && (input === 'CANCEL' || input === 'OK')) {
            this.#updateInfoPaneWithMessage()
            return;
        }

        if (input === 'CANCEL') {
            this.#switchToMainBattleMenu()
            return;
        }
        if (input === 'OK') {
            if (this.#activeBattleMenu === ACTIVE_BATTLE_MENU.BATTLE_MAIN) {
                this.#handlePlayerChooseMainBattleOption()
                return;
            }

            if (this.#activeBattleMenu === ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT) {
                this.#handlePlayerChooseAttack()
                return;
            }
        }

        this.#updateSelectedBattleMenuOptionFromInput(input)
        this.#moveMainBattleMenuCursor()
        this.#updateSelectedAttackMoveOptionFromInput(input)
        this.#moveSubBattleMenuCursor()
    }

    /**
     *
     * @param {string[]} messages
     * @param {() => void} [callback]
     */
    updateInfoPaneMessagesAndWaitForInput(messages, callback) {
        this.#queuedInfoPanelMessages = messages;
        this.#queuedInfoPanelCallback = callback;

        this.#updateInfoPaneWithMessage()
    }

    #updateInfoPaneWithMessage() {
        this.#waitingForPlayerInput = false;
        this.#battleTextGameObjectLine1.setText('').setAlpha(1)

        // Check if all messages have been displayed in the queue and call callback
        if (this.#queuedInfoPanelMessages.length === 0) {
            if (this.#queuedInfoPanelCallback) {
                this.#queuedInfoPanelCallback()
                this.#queuedInfoPanelCallback = undefined;
            }
            return;
        }

        const messageToDisplay = this.#queuedInfoPanelMessages.shift();
        this.#battleTextGameObjectLine1.setText(messageToDisplay)
        this.#waitingForPlayerInput = true;
    }

    #createMainBattleMenu() {
        this.#battleTextGameObjectLine1 = this.#scene.add.text(20, 468, 'What should', BATTLE_UI_TEXT_STYLE)
        this.#battleTextGameObjectLine2 = this.#scene.add.text(20, 512, `${this.#activePlayerMonster.name} do next?`, BATTLE_UI_TEXT_STYLE)

        this.#mainBattleMenuCursorPhaserImageGameObject = this.#scene.add.image(BATTLE_MENU_CURSOR_POSITION.x, BATTLE_MENU_CURSOR_POSITION.y, UI_ASSET_KEYS.CURSOR, 0)
            .setOrigin(0.5)
            .setScale(1.5)

        this.#mainBattleMenuPhaserContainerGameObject = this.#scene.add.container(520, 448, [
            this.#createSubInfoPane(),
            this.#scene.add.text(55, 22, BATTLE_MENU_OPTIONS.FIGHT, BATTLE_UI_TEXT_STYLE),
            this.#scene.add.text(240, 22, BATTLE_MENU_OPTIONS.SWITCH, BATTLE_UI_TEXT_STYLE),
            this.#scene.add.text(55, 70, BATTLE_MENU_OPTIONS.ITEM, BATTLE_UI_TEXT_STYLE),
            this.#scene.add.text(240, 70, BATTLE_MENU_OPTIONS.FLEE, BATTLE_UI_TEXT_STYLE),
            this.#mainBattleMenuCursorPhaserImageGameObject
        ])

        //this.hideMainBattleMenu() // Commented out because technically useless
    }

    #createMonsterAttackSubMenu() {
        this.#attackBattleMenuCursorPhaserImageGameObject = this.#scene.add.image(42, 35, UI_ASSET_KEYS.CURSOR, 0)
            .setOrigin(0.5)
            .setScale(1.5)

        /** @type {string[]} */
        const attackNames = [];
        for (let i = 0; i < 4; i++) {
            attackNames.push(this.#activePlayerMonster.attacks[i]?.name || '-')
        }

        this.#moveSelectionSubMenuPhaserContainerGameObject = this.#scene.add.container(0, 448, [
            this.#scene.add.text(55, 22, attackNames[0], BATTLE_UI_TEXT_STYLE),
            this.#scene.add.text(240, 22, attackNames[1], BATTLE_UI_TEXT_STYLE),
            this.#scene.add.text(55, 70, attackNames[2], BATTLE_UI_TEXT_STYLE),
            this.#scene.add.text(240, 70, attackNames[3], BATTLE_UI_TEXT_STYLE),
            this.#attackBattleMenuCursorPhaserImageGameObject
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

    /**
     *
     * @param {Direction} direction
     */
    #updateSelectedBattleMenuOptionFromInput(direction) {
        if (this.#activeBattleMenu !== ACTIVE_BATTLE_MENU.BATTLE_MAIN) {
            return;
        }

        if (this.#selectedBattleMenuOption === BATTLE_MENU_OPTIONS.FIGHT) {
            switch (direction) {
                case DIRECTION.RIGHT:
                    this.#selectedBattleMenuOption = BATTLE_MENU_OPTIONS.SWITCH
                    return;
                case DIRECTION.DOWN:
                    this.#selectedBattleMenuOption = BATTLE_MENU_OPTIONS.ITEM
                    return;
                case DIRECTION.LEFT:
                    return;
                case DIRECTION.UP:
                    return;
                case DIRECTION.NONE:
                    return;
                default:
                    exhaustiveGuard(direction)
            }
            return;
        }

        if (this.#selectedBattleMenuOption === BATTLE_MENU_OPTIONS.SWITCH) {
            switch (direction) {
                case DIRECTION.DOWN:
                    this.#selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FLEE
                    return;
                case DIRECTION.LEFT:
                    this.#selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FIGHT
                    return;
                case DIRECTION.RIGHT:
                    return;
                case DIRECTION.UP:
                    return;
                case DIRECTION.NONE:
                    return;
                default:
                    exhaustiveGuard(direction)
            }
            return;
        }

        if (this.#selectedBattleMenuOption === BATTLE_MENU_OPTIONS.ITEM) {
            switch (direction) {
                case DIRECTION.RIGHT:
                    this.#selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FLEE
                    return;
                case DIRECTION.UP:
                    this.#selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FIGHT
                    return;
                case DIRECTION.DOWN:
                    return;
                case DIRECTION.LEFT:
                    return;
                case DIRECTION.NONE:
                    return;
                default:
                    exhaustiveGuard(direction)
            }
            return;
        }

        if (this.#selectedBattleMenuOption === BATTLE_MENU_OPTIONS.FLEE) {
            switch (direction) {
                case DIRECTION.LEFT:
                    this.#selectedBattleMenuOption = BATTLE_MENU_OPTIONS.ITEM
                    return;
                case DIRECTION.UP:
                    this.#selectedBattleMenuOption = BATTLE_MENU_OPTIONS.SWITCH
                    return;
                case DIRECTION.RIGHT:
                    return;
                case DIRECTION.DOWN:
                    return;
                case DIRECTION.NONE:
                    return;
                default:
                    exhaustiveGuard(direction)
            }
            return;
        }

        exhaustiveGuard(this.#selectedBattleMenuOption)
    }

    #moveMainBattleMenuCursor() {
        if (this.#activeBattleMenu !== ACTIVE_BATTLE_MENU.BATTLE_MAIN) {
            return;
        }
        switch (this.#selectedBattleMenuOption) {
            case BATTLE_MENU_OPTIONS.FIGHT:
                this.#mainBattleMenuCursorPhaserImageGameObject.setPosition(BATTLE_MENU_CURSOR_POSITION.x, BATTLE_MENU_CURSOR_POSITION.y)
                return;
            case BATTLE_MENU_OPTIONS.SWITCH:
                this.#mainBattleMenuCursorPhaserImageGameObject.setPosition(228, BATTLE_MENU_CURSOR_POSITION.y)
                return;
            case BATTLE_MENU_OPTIONS.ITEM:
                this.#mainBattleMenuCursorPhaserImageGameObject.setPosition(BATTLE_MENU_CURSOR_POSITION.x, 83)
                return;
            case BATTLE_MENU_OPTIONS.FLEE:
                this.#mainBattleMenuCursorPhaserImageGameObject.setPosition(228, 83)
                return;
            default:
                exhaustiveGuard(this.#selectedBattleMenuOption)
        }
    }

    /**
     *
     * @param {Direction} direction
     */
    #updateSelectedAttackMoveOptionFromInput(direction) {
        if (this.#activeBattleMenu !== ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT) {
            return;
        }

        if (this.#selectedAttackMoveOption === ATTACK_MOVE_OPTIONS.MOVE_1) {
            switch (direction) {
                case DIRECTION.RIGHT:
                    this.#selectedAttackMoveOption = ATTACK_MOVE_OPTIONS.MOVE_2
                    return;
                case DIRECTION.DOWN:
                    this.#selectedAttackMoveOption = ATTACK_MOVE_OPTIONS.MOVE_3
                    return;
                case DIRECTION.LEFT:
                    return;
                case DIRECTION.UP:
                    return;
                case DIRECTION.NONE:
                    return;
                default:
                    exhaustiveGuard(direction)
            }
            return;
        }

        if (this.#selectedAttackMoveOption === ATTACK_MOVE_OPTIONS.MOVE_2) {
            switch (direction) {
                case DIRECTION.LEFT:
                    this.#selectedAttackMoveOption = ATTACK_MOVE_OPTIONS.MOVE_1
                    return;
                case DIRECTION.DOWN:
                    this.#selectedAttackMoveOption = ATTACK_MOVE_OPTIONS.MOVE_4
                    return;
                case DIRECTION.RIGHT:
                    return;
                case DIRECTION.UP:
                    return;
                case DIRECTION.NONE:
                    return;
                default:
                    exhaustiveGuard(direction)
            }
            return;
        }

        if (this.#selectedAttackMoveOption === ATTACK_MOVE_OPTIONS.MOVE_3) {
            switch (direction) {
                case DIRECTION.RIGHT:
                    this.#selectedAttackMoveOption = ATTACK_MOVE_OPTIONS.MOVE_4
                    return;
                case DIRECTION.UP:
                    this.#selectedAttackMoveOption = ATTACK_MOVE_OPTIONS.MOVE_1
                    return;
                case DIRECTION.LEFT:
                    return;
                case DIRECTION.DOWN:
                    return;
                case DIRECTION.NONE:
                    return;
                default:
                    exhaustiveGuard(direction)
            }
            return;
        }

        if (this.#selectedAttackMoveOption === ATTACK_MOVE_OPTIONS.MOVE_4) {
            switch (direction) {
                case DIRECTION.LEFT:
                    this.#selectedAttackMoveOption = ATTACK_MOVE_OPTIONS.MOVE_3
                    return;
                case DIRECTION.UP:
                    this.#selectedAttackMoveOption = ATTACK_MOVE_OPTIONS.MOVE_2
                    return;
                case DIRECTION.RIGHT:
                    return;
                case DIRECTION.DOWN:
                    return;
                case DIRECTION.NONE:
                    return;
                default:
                    exhaustiveGuard(direction)
            }
        }
    }

    #moveSubBattleMenuCursor() {
        if (this.#activeBattleMenu !== ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT) {
            return;
        }
        switch (this.#selectedAttackMoveOption) {
            case ATTACK_MOVE_OPTIONS.MOVE_1:
                this.#attackBattleMenuCursorPhaserImageGameObject.setPosition(ATTACK_MENU_CURSOR_POSITION.x, ATTACK_MENU_CURSOR_POSITION.y)
                return;
            case ATTACK_MOVE_OPTIONS.MOVE_2:
                this.#attackBattleMenuCursorPhaserImageGameObject.setPosition(228, ATTACK_MENU_CURSOR_POSITION.y)
                return;
            case ATTACK_MOVE_OPTIONS.MOVE_3:
                this.#attackBattleMenuCursorPhaserImageGameObject.setPosition(ATTACK_MENU_CURSOR_POSITION.x, 83)
                return;
            case ATTACK_MOVE_OPTIONS.MOVE_4:
                this.#attackBattleMenuCursorPhaserImageGameObject.setPosition(228, 83)
                return;
            default:
                exhaustiveGuard(this.#selectedAttackMoveOption)
        }
    }

    #switchToMainBattleMenu() {
        this.hideMonsterAttackSubMenu()
        this.showMainBattleMenu()
    }

    #handlePlayerChooseMainBattleOption() {
        this.hideMainBattleMenu()

        if (this.#selectedBattleMenuOption === BATTLE_MENU_OPTIONS.FIGHT) {
            this.showMonsterAttackSubMenu()
            this.#activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT;
            return;
        }

        if (this.#selectedBattleMenuOption === BATTLE_MENU_OPTIONS.SWITCH) {
            this.updateInfoPaneMessagesAndWaitForInput(['You have no other monsters...'], () => {
                this.#switchToMainBattleMenu()
            })
            this.#activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_SWITCH;
            return;
        }

        if (this.#selectedBattleMenuOption === BATTLE_MENU_OPTIONS.ITEM) {
            this.updateInfoPaneMessagesAndWaitForInput(['Your bag is empty...'], () => {
                this.#switchToMainBattleMenu()
            })
            this.#activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_ITEM;
            return;
        }

        if (this.#selectedBattleMenuOption === BATTLE_MENU_OPTIONS.FLEE) {
            this.updateInfoPaneMessagesAndWaitForInput(["You can't flee..."], () => {
                this.#switchToMainBattleMenu()
            })
            this.#activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_FLEE;
            return;
        }

        exhaustiveGuard(this.#selectedBattleMenuOption)
    }

    #handlePlayerChooseAttack() {
        let selectedAttackMoveIndex;
        switch (this.#selectedAttackMoveOption) {
            case ATTACK_MOVE_OPTIONS.MOVE_1:
                selectedAttackMoveIndex = 0;
                break;
            case ATTACK_MOVE_OPTIONS.MOVE_2:
                selectedAttackMoveIndex = 1;
                break;
            case ATTACK_MOVE_OPTIONS.MOVE_3:
                selectedAttackMoveIndex = 2;
                break;
            case ATTACK_MOVE_OPTIONS.MOVE_4:
                selectedAttackMoveIndex = 3;
                break;
            default:
                exhaustiveGuard(this.#selectedAttackMoveOption)
        }

        this.#selectedAttackIndex = selectedAttackMoveIndex;
    }
}