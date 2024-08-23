/**
 * @typedef {keyof typeof BATTLE_MENU_OPTIONS} BattleMenuOptions
 */

/** @enum {BattleMenuOptions} */
export const BATTLE_MENU_OPTIONS = Object.freeze({
    FIGHT: 'FIGHT',
    SWITCH: 'SWITCH',
    ITEM: 'ITEM',
    FLEE: 'FLEE'
})

/**
 * @typedef {keyof typeof ATTACK_MOVE_OPTIONS} AttackMoveOptions
 */

/** @enum {AttackMoveOptions} */
export const ATTACK_MOVE_OPTIONS = Object.freeze({
    MOVE_1: 'MOVE_1',
    MOVE_2: 'MOVE_2',
    MOVE_3: 'MOVE_3',
    MOVE_4: 'MOVE_4'
})