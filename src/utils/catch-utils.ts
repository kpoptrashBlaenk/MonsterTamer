import { BattleMonster } from '../battle/monsters/battle-monster'

type CaptureMonsterResults = {
  requiredCaptureValue: number
  actualCaptureValue: number
  wasCaptured: boolean
}

export function calculateMinValueForCapture(monster: BattleMonster): number {
  let baseMin = 80
  const healthRatio = monster.currentHp / monster.maxHp

  if (healthRatio < 0.25) {
    baseMin -= 20
  } else if (healthRatio < 0.5) {
    baseMin -= 15
  } else if (healthRatio < 0.75) {
    baseMin -= 10
  } else if (healthRatio < 0.9) {
    baseMin -= 5
  }

  return baseMin
}

export function calculateMonsterCaptureResults(monster: BattleMonster): CaptureMonsterResults {
  const minValueRequiredForCapture = calculateMinValueForCapture(monster)
  const randomValue = Phaser.Math.Between(0, 100)
  return {
    requiredCaptureValue: minValueRequiredForCapture,
    actualCaptureValue: randomValue,
    wasCaptured: randomValue >= minValueRequiredForCapture,
  }
}
