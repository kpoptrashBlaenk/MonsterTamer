import {BattleMonster} from "./battle-monster.js";

/**
 *
 * @type {Coordinate}
 */
const ENEMY_POSITION = Object.freeze({
    x: 769,
    y: 144
})

export class EnemyBattleMonster extends BattleMonster {
    /**
     *
     * @param {BattleMonsterConfig} config
     */
    constructor(config) {
        super({...config, scaleHealthBarBackgroundImageByY: 0.8}, ENEMY_POSITION);
    }
}