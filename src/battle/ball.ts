interface BallConfig {
  scene: Phaser.Scene
  assetKey: string
  assetFrame?: number
  skipBattleAnimations?: boolean
  scale?: number
}

export class Ball {
  private scene: Phaser.Scene
  private readonly ball: Phaser.GameObjects.PathFollower
  private ballPath: Phaser.Curves.Path
  private readonly skipBattleAnimations: boolean

  constructor(config: BallConfig) {
    if (config.assetFrame === undefined) {
      config.assetFrame = 0
    }
    if (config.scale === undefined) {
      config.scale = 1
    }
    if (config.skipBattleAnimations === undefined) {
      config.skipBattleAnimations = false
    }

    this.skipBattleAnimations = config.skipBattleAnimations
    this.scene = config.scene
    this.createCurvePath()
    this.ball = this.scene.add
      .follower(this.ballPath, 0, 500, config.assetKey, config.assetFrame)
      .setAlpha(0)
      .setScale(config.scale)
  }

  private createCurvePath(): void {
    const startPoint = new Phaser.Math.Vector2(0, 500)
    const controlPoint1 = new Phaser.Math.Vector2(200, 100)
    const controlPoint2 = new Phaser.Math.Vector2(725, 180)
    const endPoint = new Phaser.Math.Vector2(725, 180)
    const curve = new Phaser.Curves.CubicBezier(startPoint, controlPoint1, controlPoint2, endPoint)
    this.ballPath = new Phaser.Curves.Path(0, 500).add(curve)
  }

  public hide(): void {
    this.ball.setAlpha(0)
  }

  public playThrowBallAnimation(): Promise<void> {
    return new Promise((resolve) => {
      if (this.skipBattleAnimations) {
        this.ball.setPosition(725, 180).setAlpha(1)
        resolve()
        return
      }

      this.ball
        .setPosition(0, 500)
        .setAlpha(1)
        .startFollow({
          delay: 0,
          duration: 1000,
          ease: Phaser.Math.Easing.Sine.InOut,
          onComplete: () => {
            resolve()
          },
        })
    })
  }

  public playShakeBallAnimation(repeat: number = 2): Promise<void> {
    return new Promise((resolve) => {
      if (this.skipBattleAnimations) {
        resolve()
        return
      }

      this.scene.tweens.add({
        duration: 150,
        repeatDelay: 800,
        targets: this.ball,
        x: this.ball.x + 10,
        yoyo: true,
        repeat,
        delay: 200,
        ease: Phaser.Math.Easing.Sine.InOut,
        onComplete: () => {
          resolve()
        },
      })
    })
  }
}
