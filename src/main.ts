import Phaser from 'phaser'
import {SCENE_KEYS} from "./lib/scenes/scene-keys";
import {PreloadScene} from "./lib/scenes/preload-scene";
import {TitleScene} from "./lib/scenes/title-scene";
import {BattleScene} from "./lib/scenes/battle-scene";
import {OptionsScene} from "./lib/scenes/options-scene";
import { TestScene } from './lib/scenes/test-scene';

// Launch game instance
const game = new Phaser.Game({
    type: Phaser.CANVAS,
    //pixelArt: true, // Removed because it makes fonts bug
    scale: {
        parent: 'game-container',
        width: 1024,
        height: 576,
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    backgroundColor: '#000000'
})

game.scene.add(SCENE_KEYS.PRELOAD_SCENE, PreloadScene)
game.scene.add(SCENE_KEYS.BATTLE_SCENE, TitleScene)
game.scene.add(SCENE_KEYS.BATTLE_SCENE, OptionsScene)
game.scene.add(SCENE_KEYS.BATTLE_SCENE, BattleScene)
game.scene.add(SCENE_KEYS.BATTLE_SCENE, TestScene)
game.scene.start(SCENE_KEYS.PRELOAD_SCENE)