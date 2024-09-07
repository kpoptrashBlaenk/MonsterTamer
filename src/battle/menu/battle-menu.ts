import Phaser from '../../lib/phaser.ts'
import {UI_ASSET_KEYS} from "../../assets/asset-keys.ts";
import {Direction, DIRECTION} from "../../common/direction.ts";
import {exhaustiveGuard} from "../../utils/guard.ts";
import {
    ACTIVE_BATTLE_MENU,
    ATTACK_MOVE_OPTIONS,
    BATTLE_MENU_OPTIONS,
    BattleMenuOptions,
    AttackMoveOptions,
    ActiveBattleMenu
} from "../ui/battle-menu-options.ts";
import {BATTLE_UI_TEXT_STYLE} from "../ui/battle-menu-config.ts";
import {animateText} from "../../utils/text-utils.ts";
import {SKIP_BATTLE_ANIMATIONS} from "../../config.ts";
import {BattleMonster} from "../monsters/battle-monster.ts";

const BATTLE_MENU_CURSOR_POSITION = Object.freeze({
    x: 42,
    y: 42
})

const ATTACK_MENU_CURSOR_POSITION = Object.freeze({
    x: 42,
    y: 42
})

const PLAYER_INPUT_CURSOR_POSITION = Object.freeze({
    y: 480
})

export class BattleMenu {
    private readonly scene: Phaser.Scene;
    private mainBattleMenuPhaserContainerGameObject: Phaser.GameObjects.Container;
    private moveSelectionSubMenuPhaserContainerGameObject: Phaser.GameObjects.Container;
    private battleTextGameObjectLine1: Phaser.GameObjects.Text;
    private battleTextGameObjectLine2: Phaser.GameObjects.Text;
    private mainBattleMenuCursorPhaserImageGameObject: Phaser.GameObjects.Image;
    private attackBattleMenuCursorPhaserImageGameObject: Phaser.GameObjects.Image;
    private selectedBattleMenuOption: BattleMenuOptions;
    private selectedAttackMoveOption: AttackMoveOptions;
    private activeBattleMenu: ActiveBattleMenu;
    private queuedInfoPanelMessages: string[];
    private queuedInfoPanelCallback: (() => void) | undefined;
    private waitingForPlayerInput: boolean;
    private selectedAttackIndex: number | undefined;
    private activePlayerMonster: BattleMonster;
    private userInputCursorPhaserImageObject: Phaser.GameObjects.Image;
    private userInputCursorPhaserTween: Phaser.Tweens.Tween;
    private queuedMessagesSkipAnimation: boolean;
    private queuedMessageAnimationPlaying: boolean;

    constructor(scene: Phaser.Scene, activePlayerMonster: BattleMonster) {
        this.scene = scene;
        this.activePlayerMonster = activePlayerMonster;
        this.activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_MAIN;
        this.selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FIGHT;
        this.selectedAttackMoveOption = ATTACK_MOVE_OPTIONS.MOVE_1;
        this.queuedInfoPanelCallback = undefined;
        this.queuedInfoPanelMessages = [];
        this.waitingForPlayerInput = false;
        this.selectedAttackIndex = undefined;
        this.queuedMessagesSkipAnimation = false;
        this.queuedMessageAnimationPlaying = false;
        this.createMainInfoPane()
        this.createMainBattleMenu()
        this.createMonsterAttackSubMenu()
        this.createPlayerInputCursor()

        this.hideMonsterAttackSubMenu()
        this.hideMainBattleMenu()
    }

    get selectedAttack(): number | undefined {
        if (this.activeBattleMenu === ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT) {
            return this.selectedAttackIndex;
        }
        return undefined;
    }

    showMainBattleMenu(): void {
        this.activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_MAIN
        this.battleTextGameObjectLine1.setText('What should')
        this.mainBattleMenuPhaserContainerGameObject.setAlpha(1)
        this.battleTextGameObjectLine1.setAlpha(1)
        this.battleTextGameObjectLine2.setAlpha(1)

        this.selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FIGHT
        this.mainBattleMenuCursorPhaserImageGameObject.setPosition(BATTLE_MENU_CURSOR_POSITION.x, BATTLE_MENU_CURSOR_POSITION.y)
        this.selectedAttackIndex = undefined;
    }

    hideMainBattleMenu(): void {
        this.mainBattleMenuPhaserContainerGameObject.setAlpha(0)
        this.battleTextGameObjectLine1.setAlpha(0)
        this.battleTextGameObjectLine2.setAlpha(0)
    }

    showMonsterAttackSubMenu(): void {
        this.activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT
        this.moveSelectionSubMenuPhaserContainerGameObject.setAlpha(1)
    }

    hideMonsterAttackSubMenu(): void {
        this.activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_MAIN;
        this.moveSelectionSubMenuPhaserContainerGameObject.setAlpha(0)
    }

    playInputCursorAnimation(): void {
        this.userInputCursorPhaserImageObject.setPosition(
            this.battleTextGameObjectLine1.displayWidth + this.userInputCursorPhaserImageObject.displayWidth * 3.5,
            this.userInputCursorPhaserImageObject.y
        ).setAlpha(1)

        this.userInputCursorPhaserTween.restart()
    }

    hideInputCursor(): void {
        this.userInputCursorPhaserImageObject.setAlpha(0)
        this.userInputCursorPhaserTween.pause()
    }

    handlePlayerInput(input: Direction | 'OK' | 'CANCEL'): void {
        if (this.queuedMessageAnimationPlaying && input === 'OK') {
            return;
        }

        if (this.waitingForPlayerInput && (input === 'CANCEL' || input === 'OK')) {
            this.updateInfoPaneWithMessage()
            return;
        }

        if (input === 'CANCEL') {
            this.switchToMainBattleMenu()
            return;
        }
        if (input === 'OK') {
            if (this.activeBattleMenu === ACTIVE_BATTLE_MENU.BATTLE_MAIN) {
                this.handlePlayerChooseMainBattleOption()
                return;
            }

            if (this.activeBattleMenu === ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT) {
                this.handlePlayerChooseAttack()
                return;
            }
        }

        this.updateSelectedBattleMenuOptionFromInput(input as Direction)
        this.moveMainBattleMenuCursor()
        this.updateSelectedAttackMoveOptionFromInput(input as Direction)
        this.moveSubBattleMenuCursor()
    }

    updateInfoPaneMessagesAndWaitForInput(messages: string[], callback: () => void, skipAnimation: boolean = false): void {
        this.queuedInfoPanelMessages = messages;
        this.queuedInfoPanelCallback = callback;
        this.queuedMessagesSkipAnimation = skipAnimation;

        this.updateInfoPaneWithMessage()
    }

    updateInfoPaneMessagesNoInputRequired(message: string, callback: () => void, skipAnimation: boolean = false): void {
        console.log(skipAnimation) // only here because IDE is crying that skiAnimation is not being used

        this.battleTextGameObjectLine1.setText('').setAlpha(1)
        this.battleTextGameObjectLine1.setText(message)
        this.waitingForPlayerInput = false;
        if (callback) {
            callback()
            return;
        }

        animateText(this.scene, this.battleTextGameObjectLine1, message, {
            callback: () => {
                this.waitingForPlayerInput = true;
            }
        })
    }

    private updateInfoPaneWithMessage() {
        this.waitingForPlayerInput = false;
        this.battleTextGameObjectLine1.setText('').setAlpha(1)
        this.hideInputCursor()

        // Check if all messages have been displayed in the queue and call callback
        if (this.queuedInfoPanelMessages.length === 0) {
            if (this.queuedInfoPanelCallback) {
                this.queuedInfoPanelCallback()
                this.queuedInfoPanelCallback = undefined;
            }
            return;
        }

        const messageToDisplay: string[] = (this.queuedInfoPanelMessages.shift() as string[] | undefined) || [];
        if (this.queuedMessagesSkipAnimation) {
            this.battleTextGameObjectLine1.setText(messageToDisplay)
            this.queuedMessageAnimationPlaying = false;
            this.waitingForPlayerInput = true;
            this.playInputCursorAnimation()
            return;
        }

        this.queuedMessageAnimationPlaying = true;
        animateText(this.scene, this.battleTextGameObjectLine1, messageToDisplay, {
            callback: () => {
                this.playInputCursorAnimation()
                this.waitingForPlayerInput = true;
                this.queuedMessageAnimationPlaying = false;
            }
        })
    }

    private createMainBattleMenu() {
        this.battleTextGameObjectLine1 = this.scene.add.text(20, 468, 'What should', BATTLE_UI_TEXT_STYLE)
        this.battleTextGameObjectLine2 = this.scene.add.text(20, 512, `${this.activePlayerMonster.name} do next?`, BATTLE_UI_TEXT_STYLE)

        this.mainBattleMenuCursorPhaserImageGameObject = this.scene.add.image(BATTLE_MENU_CURSOR_POSITION.x, BATTLE_MENU_CURSOR_POSITION.y, UI_ASSET_KEYS.CURSOR, 0)
            .setOrigin(0.5)
            .setScale(1.5)

        this.mainBattleMenuPhaserContainerGameObject = this.scene.add.container(520, 448, [
            this.createSubInfoPane(),
            this.scene.add.text(55, 22, BATTLE_MENU_OPTIONS.FIGHT, BATTLE_UI_TEXT_STYLE),
            this.scene.add.text(240, 22, BATTLE_MENU_OPTIONS.SWITCH, BATTLE_UI_TEXT_STYLE),
            this.scene.add.text(55, 70, BATTLE_MENU_OPTIONS.ITEM, BATTLE_UI_TEXT_STYLE),
            this.scene.add.text(240, 70, BATTLE_MENU_OPTIONS.FLEE, BATTLE_UI_TEXT_STYLE),
            this.mainBattleMenuCursorPhaserImageGameObject
        ])

        //this.hideMainBattleMenu() // Commented out because technically useless
    }

    private createMonsterAttackSubMenu() {
        this.attackBattleMenuCursorPhaserImageGameObject = this.scene.add.image(42, 42, UI_ASSET_KEYS.CURSOR, 0)
            .setOrigin(0.5)
            .setScale(1.5)

        const attackNames: string[] = [];
        for (let i = 0; i < 4; i++) {
            attackNames.push(this.activePlayerMonster.attacks[i]?.name || '-')
        }

        this.moveSelectionSubMenuPhaserContainerGameObject = this.scene.add.container(0, 448, [
            this.scene.add.text(55, 22, attackNames[0], BATTLE_UI_TEXT_STYLE),
            this.scene.add.text(240, 22, attackNames[1], BATTLE_UI_TEXT_STYLE),
            this.scene.add.text(55, 70, attackNames[2], BATTLE_UI_TEXT_STYLE),
            this.scene.add.text(240, 70, attackNames[3], BATTLE_UI_TEXT_STYLE),
            this.attackBattleMenuCursorPhaserImageGameObject
        ])

        this.hideMonsterAttackSubMenu()
    }

    private createMainInfoPane() {
        const padding: number = 4;
        const rectangleHeight: number = 124;
        this.scene.add.rectangle(padding, this.scene.scale.height - rectangleHeight - padding, this.scene.scale.width - padding * 2, rectangleHeight, 0xede4f3, 1)
            .setOrigin(0)
            .setStrokeStyle(8, 0xe4434a, 1)
    }

    private createSubInfoPane() {
        const rectangleWidth = 500;
        const rectangleHeight = 124;
        return this.scene.add.rectangle(0, 0, rectangleWidth, rectangleHeight, 0xede4f3, 1)
            .setOrigin(0)
            .setStrokeStyle(8, 0x905ac2, 1)
    }

    private updateSelectedBattleMenuOptionFromInput(direction: Direction) {
        if (this.activeBattleMenu !== ACTIVE_BATTLE_MENU.BATTLE_MAIN) {
            return;
        }

        if (this.selectedBattleMenuOption === BATTLE_MENU_OPTIONS.FIGHT) {
            switch (direction) {
                case DIRECTION.RIGHT:
                    this.selectedBattleMenuOption = BATTLE_MENU_OPTIONS.SWITCH
                    return;
                case DIRECTION.DOWN:
                    this.selectedBattleMenuOption = BATTLE_MENU_OPTIONS.ITEM
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

        if (this.selectedBattleMenuOption === BATTLE_MENU_OPTIONS.SWITCH) {
            switch (direction) {
                case DIRECTION.DOWN:
                    this.selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FLEE
                    return;
                case DIRECTION.LEFT:
                    this.selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FIGHT
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

        if (this.selectedBattleMenuOption === BATTLE_MENU_OPTIONS.ITEM) {
            switch (direction) {
                case DIRECTION.RIGHT:
                    this.selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FLEE
                    return;
                case DIRECTION.UP:
                    this.selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FIGHT
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

        if (this.selectedBattleMenuOption === BATTLE_MENU_OPTIONS.FLEE) {
            switch (direction) {
                case DIRECTION.LEFT:
                    this.selectedBattleMenuOption = BATTLE_MENU_OPTIONS.ITEM
                    return;
                case DIRECTION.UP:
                    this.selectedBattleMenuOption = BATTLE_MENU_OPTIONS.SWITCH
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

        exhaustiveGuard(this.selectedBattleMenuOption)
    }

    private moveMainBattleMenuCursor() {
        if (this.activeBattleMenu !== ACTIVE_BATTLE_MENU.BATTLE_MAIN) {
            return;
        }
        switch (this.selectedBattleMenuOption) {
            case BATTLE_MENU_OPTIONS.FIGHT:
                this.mainBattleMenuCursorPhaserImageGameObject.setPosition(BATTLE_MENU_CURSOR_POSITION.x, BATTLE_MENU_CURSOR_POSITION.y)
                return;
            case BATTLE_MENU_OPTIONS.SWITCH:
                this.mainBattleMenuCursorPhaserImageGameObject.setPosition(228, BATTLE_MENU_CURSOR_POSITION.y)
                return;
            case BATTLE_MENU_OPTIONS.ITEM:
                this.mainBattleMenuCursorPhaserImageGameObject.setPosition(BATTLE_MENU_CURSOR_POSITION.x, 90)
                return;
            case BATTLE_MENU_OPTIONS.FLEE:
                this.mainBattleMenuCursorPhaserImageGameObject.setPosition(228, 90)
                return;
            default:
                exhaustiveGuard(this.selectedBattleMenuOption)
        }
    }

    private updateSelectedAttackMoveOptionFromInput(direction: Direction) {
        if (this.activeBattleMenu !== ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT) {
            return;
        }

        if (this.selectedAttackMoveOption === ATTACK_MOVE_OPTIONS.MOVE_1) {
            switch (direction) {
                case DIRECTION.RIGHT:
                    this.selectedAttackMoveOption = ATTACK_MOVE_OPTIONS.MOVE_2
                    return;
                case DIRECTION.DOWN:
                    this.selectedAttackMoveOption = ATTACK_MOVE_OPTIONS.MOVE_3
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

        if (this.selectedAttackMoveOption === ATTACK_MOVE_OPTIONS.MOVE_2) {
            switch (direction) {
                case DIRECTION.LEFT:
                    this.selectedAttackMoveOption = ATTACK_MOVE_OPTIONS.MOVE_1
                    return;
                case DIRECTION.DOWN:
                    this.selectedAttackMoveOption = ATTACK_MOVE_OPTIONS.MOVE_4
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

        if (this.selectedAttackMoveOption === ATTACK_MOVE_OPTIONS.MOVE_3) {
            switch (direction) {
                case DIRECTION.RIGHT:
                    this.selectedAttackMoveOption = ATTACK_MOVE_OPTIONS.MOVE_4
                    return;
                case DIRECTION.UP:
                    this.selectedAttackMoveOption = ATTACK_MOVE_OPTIONS.MOVE_1
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

        if (this.selectedAttackMoveOption === ATTACK_MOVE_OPTIONS.MOVE_4) {
            switch (direction) {
                case DIRECTION.LEFT:
                    this.selectedAttackMoveOption = ATTACK_MOVE_OPTIONS.MOVE_3
                    return;
                case DIRECTION.UP:
                    this.selectedAttackMoveOption = ATTACK_MOVE_OPTIONS.MOVE_2
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

    private moveSubBattleMenuCursor() {
        if (this.activeBattleMenu !== ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT) {
            return;
        }
        switch (this.selectedAttackMoveOption) {
            case ATTACK_MOVE_OPTIONS.MOVE_1:
                this.attackBattleMenuCursorPhaserImageGameObject.setPosition(ATTACK_MENU_CURSOR_POSITION.x, ATTACK_MENU_CURSOR_POSITION.y)
                return;
            case ATTACK_MOVE_OPTIONS.MOVE_2:
                this.attackBattleMenuCursorPhaserImageGameObject.setPosition(228, ATTACK_MENU_CURSOR_POSITION.y)
                return;
            case ATTACK_MOVE_OPTIONS.MOVE_3:
                this.attackBattleMenuCursorPhaserImageGameObject.setPosition(ATTACK_MENU_CURSOR_POSITION.x, 90)
                return;
            case ATTACK_MOVE_OPTIONS.MOVE_4:
                this.attackBattleMenuCursorPhaserImageGameObject.setPosition(228, 90)
                return;
            default:
                exhaustiveGuard(this.selectedAttackMoveOption)
        }
    }

    private switchToMainBattleMenu() {
        this.waitingForPlayerInput = false;
        this.hideInputCursor()

        this.hideMonsterAttackSubMenu()
        this.showMainBattleMenu()
    }

    private handlePlayerChooseMainBattleOption() {
        this.hideMainBattleMenu()

        if (this.selectedBattleMenuOption === BATTLE_MENU_OPTIONS.FIGHT) {
            this.showMonsterAttackSubMenu()
            this.activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT;
            return;
        }

        if (this.selectedBattleMenuOption === BATTLE_MENU_OPTIONS.SWITCH) {
            this.updateInfoPaneMessagesAndWaitForInput(['You have no other monsters...'], () => {
                this.switchToMainBattleMenu()
            }, SKIP_BATTLE_ANIMATIONS)
            this.activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_SWITCH;
            return;
        }

        if (this.selectedBattleMenuOption === BATTLE_MENU_OPTIONS.ITEM) {
            this.updateInfoPaneMessagesAndWaitForInput(['Your bag is empty...'], () => {
                this.switchToMainBattleMenu()
            }, SKIP_BATTLE_ANIMATIONS)
            this.activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_ITEM;
            return;
        }

        if (this.selectedBattleMenuOption === BATTLE_MENU_OPTIONS.FLEE) {
            this.updateInfoPaneMessagesAndWaitForInput(["You can't flee..."], () => {
                this.switchToMainBattleMenu()
            }, SKIP_BATTLE_ANIMATIONS)
            this.activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_FLEE;
            return;
        }

        exhaustiveGuard(this.selectedBattleMenuOption)
    }

    private handlePlayerChooseAttack() {
        let selectedAttackMoveIndex: number;
        switch (this.selectedAttackMoveOption) {
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
                exhaustiveGuard(this.selectedAttackMoveOption)
                selectedAttackMoveIndex = -1;
        }

        this.selectedAttackIndex = selectedAttackMoveIndex;
    }

    private createPlayerInputCursor() {
        this.userInputCursorPhaserImageObject = this.scene.add.image(390, 0, UI_ASSET_KEYS.CURSOR)
            .setAngle(90)
            .setScale(2.0, 1.5)
            .setAlpha(0)

        this.userInputCursorPhaserTween = this.scene.add.tween({
            delay: 0,
            duration: 800,
            repeat: -1,
            y: {
                from: PLAYER_INPUT_CURSOR_POSITION.y + 7,
                start: PLAYER_INPUT_CURSOR_POSITION.y + 7,
                to: PLAYER_INPUT_CURSOR_POSITION.y + 12
            },
            targets: this.userInputCursorPhaserImageObject
        })
        this.userInputCursorPhaserTween.pause()
    }
}