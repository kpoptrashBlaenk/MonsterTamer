/* SETUP */
mklink /D C:\xampp\htdocs\MonsterTamer "C:\Users\AldinMUSIC\OneDrive - MEWO\Bureau\Repositories\MonsterTamer"
used for letting apache always start this server (use http://localhost/MonsterTamer/ in browser)

download phaser.d.ts and create jsconfig.json to see library in IDE

/* ASSETS */
initial-assets downloaded from https://github.com/devshareacademy/monster-tamer/releases/tag/assets

/* SCENES */
scene-keys.js has freeze to make object unchangeable
game.scene.add(name, class) to add a scene (scene-keys.js holds all the names)
game.scene.start(name) to start it