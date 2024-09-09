export const OPTION_MENU_OPTIONS = Object.freeze({
    TEXT_SPEED: 'TEXT_SPEED',
    BATTLE_SCENE: 'BATTLE_SCENE',
    SOUND: 'SOUND',
    VOLUME: 'VOLUME',
    MENU_COLOR: 'MENU_COLOR',
    CLOSE: 'CLOSE'
})
export type OptionMenuOptions = keyof typeof OPTION_MENU_OPTIONS

export const TEXT_SPEED_OPTIONS = Object.freeze({
    SLOW: 'SLOW',
    MID: 'MID',
    FAST: 'FAST'
})
export type TextSpeedOptions = keyof typeof TEXT_SPEED_OPTIONS

export const BATTLE_SCENE_OPTIONS = Object.freeze({
    ON: 'ON',
    OFF: 'OFF'
})
export type BattleSceneOptions = keyof typeof BATTLE_SCENE_OPTIONS

export const SOUND_OPTIONS = Object.freeze({
    ON: 'ON',
    OFF: 'OFF'
})
export type SoundOptions = keyof typeof SOUND_OPTIONS

export type VolumeOptions = 0 | 1 | 2 | 3 | 4;
export type MenuColorOptions = 0 | 1 | 2;