import {ATTACK_ASSET_KEYS} from "../assets/asset-keys.ts";

export interface Animations {
    key: ATTACK_ASSET_KEYS,
    frameRate: number,
    frames: number[],
    repeat: number,
    delay: number,
    yoyo: boolean,
    assetKey: ATTACK_ASSET_KEYS
}