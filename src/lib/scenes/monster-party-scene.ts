import {SCENE_KEYS} from "./scene-keys"
import {BaseScene} from "./base-scene"
import {CUSTOM_FONTS} from "../../assets/font-keys";
import {Item} from "../../types/typedef";

const UI_TEXT_STYLE = {
    fontFamily: CUSTOM_FONTS.POKEROGUE,
    color: '#FFFFFF',
    fontSize: '24px',
}

const MONSTER_PARTY_POSITIONS = Object.freeze({
    EVEN: {
        x: 0,
        y: 10,
    },
    ODD: {
        x: 510,
        y: 40,
    },
    increment: 150,
})

export interface MonsterPartySceneData {
    previousSceneName: string
    itemSelected?: Item
    activeBattleMonsterPartyIndex?: number
    activeMonsterKnockedOut?: boolean
}

export class MonsterPartyScene extends BaseScene {

    constructor() {
        super({
            key: SCENE_KEYS.MONSTER_PARTY_SCENE,
        })
    }
}