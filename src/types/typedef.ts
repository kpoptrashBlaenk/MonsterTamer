import {MonsterAssetKeys} from "../assets/asset-keys.ts";
import {AttackKeys} from "../battle/attacks/attack-keys.ts";

export interface BattleMonsterConfig {
    scene: Phaser.Scene,
    monsterDetails: Monster,
    scaleHealthBarBackgroundImageByY?: number,
    skipBattleAnimations?: boolean
}

export interface Monster{
    name: string,
    assetKey: MonsterAssetKeys,
    assetFrame?: string | number,
    currentLevel: number,
    maxHp: number,
    currentHp: number,
    baseAttack: number,
    attackIds: number[]
}

export interface Coordinate {
    x: number,
    y: number
}

export interface Attack {
    id: number,
    name: string,
    animationName: AttackKeys
}