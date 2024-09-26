import Phaser from "phaser";
import {SCENE_KEYS} from "./scene-keys";

export class MonsterPartyScene extends Phaser.Scene {

    constructor() {
        super({
            key: SCENE_KEYS.MONSTER_PARTY_SCENE,
        })
    }
}