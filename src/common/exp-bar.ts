import { AnimatedBar } from "./animated-bar";
import {EXP_BAR_ASSET_KEYS} from "../assets/asset-keys";

export class ExpBar extends AnimatedBar {
    constructor(scene: Phaser.Scene, x: number, y: number, width: number = 360, scaleY: number = 0.4) {
        super({
            scene,
            x,
            y,
            width,
            scaleY,
            leftCapAssetKey: EXP_BAR_ASSET_KEYS.EXP_LEFT_CAP,
            leftShadowCapAssetKey: EXP_BAR_ASSET_KEYS.EXP_LEFT_CAP,
            middleCapAssetKey: EXP_BAR_ASSET_KEYS.EXP_LEFT_CAP,
            middleShadowCapAssetKey: EXP_BAR_ASSET_KEYS.EXP_LEFT_CAP,
            rightCapAssetKey: EXP_BAR_ASSET_KEYS.EXP_LEFT_CAP,
            rightShadowCapAssetKey: EXP_BAR_ASSET_KEYS.EXP_LEFT_CAP
        })
    }
}