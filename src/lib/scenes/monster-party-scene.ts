import Phaser from "phaser";
import {SCENE_KEYS} from "./scene-keys";
import {BaseScene} from "./base-scene";

export class MonsterPartyScene extends BaseScene {

    constructor() {
        super({
            key: SCENE_KEYS.MONSTER_PARTY_SCENE,
        })
    }
}