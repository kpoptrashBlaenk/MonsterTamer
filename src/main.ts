import Phaser from 'phaser'
import { SCENE_KEYS } from './scenes/scene-keys'
import { PreloadScene } from './scenes/preload-scene'
import { TitleScene } from './scenes/title-scene'
import { BattleScene } from './scenes/battle-scene'
import { OptionsScene } from './scenes/options-scene'
import { TestScene } from './scenes/test-scene'
import { MainGameScene } from './scenes/main-game-menu'
import { MonsterPartyScene } from './scenes/monster-party-scene'
import { MonsterDetailsScene } from './scenes/monster-details-scene'
import { InventoryScene } from './scenes/inventory-scene'

// Launch game instance
const game = new Phaser.Game({
  type: Phaser.CANVAS,
  //pixelArt: true, // Removed because it makes fonts bug
  scale: {
    parent: 'game-container',
    width: 1024,
    height: 576,
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  backgroundColor: '#000000',
})

game.scene.add(SCENE_KEYS.PRELOAD_SCENE, PreloadScene)
game.scene.add(SCENE_KEYS.BATTLE_SCENE, TitleScene)
game.scene.add(SCENE_KEYS.BATTLE_SCENE, MainGameScene)
game.scene.add(SCENE_KEYS.BATTLE_SCENE, OptionsScene)
game.scene.add(SCENE_KEYS.BATTLE_SCENE, BattleScene)
game.scene.add(SCENE_KEYS.BATTLE_SCENE, MonsterPartyScene)
game.scene.add(SCENE_KEYS.MONSTER_DETAILS_SCENE, MonsterDetailsScene)
game.scene.add(SCENE_KEYS.INVENTORY_SCENE, InventoryScene)
game.scene.add(SCENE_KEYS.BATTLE_SCENE, TestScene)
game.scene.start(SCENE_KEYS.PRELOAD_SCENE)
