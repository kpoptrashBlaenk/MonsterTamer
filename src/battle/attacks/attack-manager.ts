import {ATTACK_KEYS} from "./attack-keys.ts";
import {exhaustiveGuard} from "../../utils/guard.ts";
import {IceShard} from "./ice-shard.ts";
import {Slash} from "./slash.ts";

/**
 * @typedef {keyof typeof ATTACK_TARGET} AttackTarget
 */

/** @enum {AttackTarget} */
export const ATTACK_TARGET = Object.freeze({
    PLAYER: 'PLAYER',
    ENEMY: 'ENEMY'
})

export class AttackManager {
    /** @type {Phaser.Scene} */
    #scene;
    /** @type {boolean} */
    #skipBattleAnimations;
    /** @type {IceShard} */
    #iceShardAttack
    /** @type {Slash} */;
    #slashAttack;

    /**
     *
     * @param {Phaser.Scene} scene
     * @param {boolean} skipBattleAnimations
     */
    constructor(scene, skipBattleAnimations) {
        this.#scene = scene;
        this.#skipBattleAnimations = skipBattleAnimations
    }

    /**
     *
     * @param {ATTACK_KEYS} attack
     * @param {ATTACK_TARGET} target
     * @param {() => void} callback
     * @returns {() => void}
     */
    playAttackAnimation(attack, target, callback) {
        if (this.#skipBattleAnimations) {
            callback()
            return;
        }

        let x = 745;
        let y = 140;
        if (target === ATTACK_TARGET.PLAYER) {
             x = 256;
             y = 344;
        }

        switch (attack) {
            case ATTACK_KEYS.ICE_SHARD:
                if(!this.#iceShardAttack) {
                    this.#iceShardAttack = new IceShard(this.#scene, {x,y});
                }
                this.#iceShardAttack.getGameObject().setPosition(x,y)
                this.#iceShardAttack.playAnimation(callback)
                break;
            case ATTACK_KEYS.SLASH:
                if(!this.#slashAttack) {
                    this.#slashAttack = new Slash(this.#scene, {x,y});
                }
                this.#slashAttack.getGameObject().setPosition(x,y)
                this.#slashAttack.playAnimation(callback)
                break;
            default:
                exhaustiveGuard(attack);
        }
    }
}