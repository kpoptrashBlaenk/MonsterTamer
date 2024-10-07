import Phaser from 'phaser'
import { HEALTH_BAR_ASSET_KEYS } from '../../assets/asset-keys'
import { AnimatedBar } from '../../common/animated-bar'

export class HealthBar extends AnimatedBar {
  constructor(scene: Phaser.Scene, x: number, y: number, width: number = 360) {
    super({
      scene,
      x,
      y,
      width,
      scaleY: 0.7,
      leftCapAssetKey: HEALTH_BAR_ASSET_KEYS.LEFT_CAP,
      leftShadowCapAssetKey: HEALTH_BAR_ASSET_KEYS.LEFT_CAP_SHADOW,
      middleCapAssetKey: HEALTH_BAR_ASSET_KEYS.MIDDLE,
      middleShadowCapAssetKey: HEALTH_BAR_ASSET_KEYS.MIDDLE_SHADOW,
      rightCapAssetKey: HEALTH_BAR_ASSET_KEYS.RIGHT_CAP,
      rightShadowCapAssetKey: HEALTH_BAR_ASSET_KEYS.RIGHT_CAP_SHADOW,
    })
  }
}
