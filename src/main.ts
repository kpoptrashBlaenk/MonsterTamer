import Phaser from './lib/phaser.js';
import {SCENE_KEYS} from "./lib/scenes/scene-keys.ts";
import {PreloadScene} from "./lib/scenes/preload-scene.ts";
import {TitleScene} from "./lib/scenes/title-scene.js";
import {BattleScene} from "./lib/scenes/battle-scene.ts";

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
game.scene.add(SCENE_KEYS.BATTLE_SCENE, BattleScene)
game.scene.start(SCENE_KEYS.PRELOAD_SCENE)