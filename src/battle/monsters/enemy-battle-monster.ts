import { BattleMonster } from './battle-monster'
import { BattleMonsterConfig, Coordinate } from '../../types/typedef'

const ENEMY_POSITION: Coordinate = Object.freeze({
  x: 769,
  y: 144,
})

export class EnemyBattleMonster extends BattleMonster {
  constructor(config: BattleMonsterConfig) {
    super({ ...config, scaleHealthBarBackgroundImageByY: 0.8 }, ENEMY_POSITION)
  }

  public get baseExpValue(): number {
    return this.monsterDetails.baseExp
  }

  public playMonsterAppearAnimation(callback: () => void): void {
    const startXPosition: number = -30 // 100
    const endXPosition: number = ENEMY_POSITION.x
    this.phaserGameObject.setPosition(startXPosition, ENEMY_POSITION.y)
    this.phaserGameObject.setAlpha(1)

    if (this.skipBattleAnimations) {
      this.phaserGameObject.setX(endXPosition)
      callback()
      return
    }

    this.scene.tweens.add({
      delay: 0,
      duration: 1000,
      targets: this.phaserGameObject,
      x: endXPosition,
      onComplete: () => {
        callback()
      },
    })
  }

  public playMonsterHealthBarAppearAnimation(callback: () => void): void {
    const startXPosition = -600
    const endXPosition = 0
    this.phaserHealthBarGameContainer.setPosition(startXPosition, this.phaserHealthBarGameContainer.y)
    this.phaserHealthBarGameContainer.setAlpha(1)

    if (this.skipBattleAnimations) {
      this.phaserHealthBarGameContainer.setX(endXPosition)
      callback()
      return
    }

    this.scene.tweens.add({
      delay: 0,
      duration: 500,
      targets: this.phaserHealthBarGameContainer,
      x: endXPosition,
      onComplete: () => {
        callback()
      },
    })
  }

  public playMonsterDeathAnimation(callback: () => void): void {
    const endYPosition: number = this.phaserGameObject.y - 400

    if (this.skipBattleAnimations) {
      this.phaserGameObject.setY(endYPosition)
      callback()
      return
    }

    this.scene.tweens.add({
      delay: 0,
      duration: 1000,
      targets: this.phaserGameObject,
      y: endYPosition,
      onComplete: () => {
        callback()
      },
    })
  }

  public pickRandomMove() {
    return Phaser.Math.Between(0, this.monsterAttacks.length - 1)
  }

  public playCatchAnimation(): Promise<void> {
    return new Promise((resolve) => {
      if (this.skipBattleAnimations) {
        this.phaserGameObject.setAlpha(0)
        resolve()
        return
      }

      this.scene.tweens.add({
        duration: 500,
        targets: this.phaserGameObject,
        alpha: {
          from: 1,
          start: 1,
          to: 0,
        },
        ease: Phaser.Math.Easing.Sine.InOut,
        onComplete: () => {
          resolve()
        },
      })
    })
  }

  public playCatchAnimationFailed(): Promise<void> {
    return new Promise((resolve) => {
      if (this.skipBattleAnimations) {
        this.phaserGameObject.setAlpha(1)
        resolve()
        return
      }

      this.scene.tweens.add({
        duration: 500,
        targets: this.phaserGameObject,
        alpha: {
          from: 0,
          start: 0,
          to: 1,
        },
        ease: Phaser.Math.Easing.Sine.InOut,
        onComplete: () => {
          resolve()
        },
      })
    })
  }
}
