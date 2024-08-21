import Phaser from './lib/phaser.js';
import {SCENE_KEYS} from "./lib/scenes/scene-keys.js";
import {PreloadScene} from "./lib/scenes/preload-scene.js";

// Launch game instance
const game = new Phaser.Game({
    parent: 'game-container',
})

game.scene.add(SCENE_KEYS.PRELOAD_SCENE, PreloadScene)
game.scene.start(SCENE_KEYS.PRELOAD_SCENE)