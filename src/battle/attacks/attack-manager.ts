import {ATTACK_KEYS, AttackKeys} from "./attack-keys"
import {exhaustiveGuard} from "../../utils/guard"
import {IceShard} from "./ice-shard"
import {Slash} from "./slash"

export const ATTACK_TARGET = Object.freeze({
    PLAYER: 'PLAYER',
    ENEMY: 'ENEMY'
})
export type AttackTarget = keyof typeof ATTACK_TARGET

export class AttackManager {
    private readonly scene: Phaser.Scene
    private readonly skipBattleAnimations: boolean
    private iceShardAttack: IceShard
    private slashAttack: Slash

    constructor(scene: Phaser.Scene, skipBattleAnimations: boolean) {
        this.scene = scene
        this.skipBattleAnimations = skipBattleAnimations
    }

    public playAttackAnimation(attack: AttackKeys, target: AttackTarget, callback: () => void): void {
        if (this.skipBattleAnimations) {
            callback()
            return
        }

        let x: number = 745
        let y: number = 140
        if (target === ATTACK_TARGET.PLAYER) {
            x = 256
            y = 344
        }

        switch (attack) {
            case ATTACK_KEYS.ICE_SHARD:
                if (!this.iceShardAttack) {
                    this.iceShardAttack = new IceShard(this.scene, {x, y})
                }

                this.iceShardAttack.getGameObject()?.setPosition(x, y)
                this.iceShardAttack.playAnimation(callback)
                break
            case ATTACK_KEYS.SLASH:
                if (!this.slashAttack) {
                    this.slashAttack = new Slash(this.scene, {x, y})
                }
                this.slashAttack.getGameObject()?.setPosition(x, y)
                this.slashAttack.playAnimation(callback)
                break
            default:
                exhaustiveGuard(attack)
        }
    }
}