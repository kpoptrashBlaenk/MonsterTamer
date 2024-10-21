type AnimateTextConfig = {
  callback?: () => void
  delay?: number
}

export function animateText(
  scene: Phaser.Scene,
  target: Phaser.GameObjects.Text,
  text: string | string[],
  config?: AnimateTextConfig
): void {
  const length: number = text.length
  let i: number = 0
  scene.time.addEvent({
    callback: () => {
      target.text += text[i]
      i++
      if (i === length - 1 && config?.callback) {
        config.callback()
      }
    },
    repeat: length - 1,
    delay: config?.delay ?? 50,
  })
}
