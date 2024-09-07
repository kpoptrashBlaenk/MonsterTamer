interface Options {
    callback?: () => void;
    skipSceneTransition?: boolean;
}

export function sceneTransition(scene: Phaser.Scene, options: Options): void {
    const skipSceneTransition: boolean = options.skipSceneTransition || false;
    if (skipSceneTransition) {
        options.callback?.()
        return;
    }

    const {width, height}: {width: number; height: number} = scene.scale;
    const rectShape: Phaser.Geom.Rectangle = new Phaser.Geom.Rectangle(0, height/2, width, 0);
    const g = scene.add.graphics().fillRectShape(rectShape).setDepth(-1);
    const mask = g.createGeometryMask();
    scene.cameras.main.setMask(mask)

    scene.tweens.add({
        onUpdate: () => {
            g.clear().fillRectShape(rectShape)
        },
        delay: 400,
        duration: 800,
        height: {
            ease: Phaser.Math.Easing.Expo.InOut,
            from: 0,
            start: 0,
            to: height
        },
        y: {
            ease: Phaser.Math.Easing.Expo.InOut,
            from: height / 2,
            start: height / 2,
            to: 0
        },
        targets: rectShape,
        onComplete: () => {
            mask.destroy()
            scene.cameras.main.clearMask()
            options.callback?.()
        }
    })

    options.callback?.()
}