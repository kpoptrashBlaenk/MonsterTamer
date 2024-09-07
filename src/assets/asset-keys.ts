export const BATTLE_BACKGROUND_ASSET_KEYS = Object.freeze({
    FOREST: 'FOREST'
})

export const MONSTER_ASSET_KEYS = Object.freeze({
    IGUANIGNITE: 'IGUANIGNITE',
    CARNODUSK: 'CARNODUSK'
})
export type MonsterAssetKeys = keyof typeof MONSTER_ASSET_KEYS

export const BATTLE_ASSET_KEYS = Object.freeze({
    HEALTH_BAR_BACKGROUND: 'HEALTH_BAR_BACKGROUND'
})

export const HEALTH_BAR_ASSET_KEYS = Object.freeze({
    LEFT_CAP: 'LEFT_CAP',
    RIGHT_CAP: 'RIGHT_CAP',
    MIDDLE: 'MIDDLE',
    LEFT_CAP_SHADOW: 'LEFT_CAP_SHADOW',
    RIGHT_CAP_SHADOW: 'RIGHT_CAP_SHADOW',
    MIDDLE_SHADOW: 'MIDDLE_SHADOW'
})

export const UI_ASSET_KEYS = Object.freeze({
    CURSOR: 'CURSOR',
    MENU_BACKGROUND: 'MENU_BACKGROUND',
})
export type UIAssetKeys = keyof typeof UI_ASSET_KEYS

export const DATA_ASSET_KEYS = Object.freeze({
    ATTACKS: 'ATTACKS',
    ANIMATIONS: 'ANIMATIONS'
})

export const ATTACK_ASSET_KEYS = Object.freeze({
    ICE_SHARD: 'ICE_SHARD',
    ICE_SHARD_START: 'ICE_SHARD_START',
    SLASH: 'SLASH'
})

export const TITLE_ASSET_KEYS = Object.freeze({
    BACKGROUND: 'BACKGROUND',
    TITLE: 'TITLE',
    PANEL: 'PANEL',
})