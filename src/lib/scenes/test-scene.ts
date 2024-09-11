import Phaser from '../phaser.ts'
import {Background} from '../../battle/background.ts';
import {ATTACK_KEYS, AttackKeys} from '../../battle/attacks/attack-keys.ts';
import {IceShard} from '../../battle/attacks/ice-shard.ts';
import {Slash} from '../../battle/attacks/slash.ts';
import {MONSTER_ASSET_KEYS} from '../../assets/asset-keys.ts';
import {SCENE_KEYS} from './scene-keys.ts';
import {makeDraggable} from '../../utils/draggable.ts';

export class TestScene extends Phaser.Scene {
    private selectedAttack: AttackKeys;
    private iceShardAttack: IceShard;
    private slashAttack: Slash;
    private playerMonster: Phaser.GameObjects.Image;
    private enemyMonster: Phaser.GameObjects.Image;

    constructor() {
        super({key: SCENE_KEYS.TEST_SCENE});
    }

    init() {
        this.selectedAttack = ATTACK_KEYS.SLASH;
    }

    create() {
        const background: Background = new Background(this);
        background.showForest()

        this.playerMonster = this.add.image(256, 316, MONSTER_ASSET_KEYS.IGUANIGNITE, 0).setFlipX(true)
        this.enemyMonster = this.add.image(768, 144, MONSTER_ASSET_KEYS.CARNODUSK, 0).setFlipX(false)
        makeDraggable(this.enemyMonster);

        this.iceShardAttack = new IceShard(this, {x: 256, y: 344});
        this.slashAttack = new Slash(this, {x: 745, y: 140});

        this.addDataGui();
    }

    private addDataGui(): void {
        const pane = new TweakPane.Pane();


        const monstersFolder = pane.addFolder({
            title: 'Monsters',
            expanded: true,
        })

        const playerMonsterFolder = monstersFolder.addFolder({
            title: 'Player',
            expanded: true,
        })
        playerMonsterFolder.addBinding(this.playerMonster, 'x', {
            min: 0,
            max: 1024,
            step: 1,
            readonly: false
        })
        playerMonsterFolder.addBinding(this.playerMonster, 'y', {
            min: 0,
            max: 576,
            step: 1,
            readonly: false
        })

        const enemyMonsterFolder = monstersFolder.addFolder({
            title: 'Enemy',
            expanded: true,
        })
        enemyMonsterFolder.addBinding(this.enemyMonster, 'x', {
            min: 0,
            max: 1024,
            step: 1,
            readonly: false
        })
        enemyMonsterFolder.addBinding(this.enemyMonster, 'y', {
            min: 0,
            max: 576,
            step: 1,
            readonly: false
        })

        const attacksFolder = pane.addFolder({
            title: 'Attacks',
            expanded: true,
        })
    }

    private updateAttackGameObjectPosition(param: 'x' | 'y', value: number): void {
        if (param === 'x') {
            if (this.selectedAttack === ATTACK_KEYS.SLASH) {
                this.slashAttack.getGameObject()?.setX(value)
                return;
            }
            if (this.selectedAttack === ATTACK_KEYS.ICE_SHARD) {
                this.iceShardAttack.getGameObject()?.setX(value);
                return;
            }
        }
        if (this.selectedAttack === ATTACK_KEYS.SLASH) {
            this.slashAttack.getGameObject()?.setY(value);
            return;
        }
        if (this.selectedAttack === ATTACK_KEYS.ICE_SHARD) {
            this.iceShardAttack.getGameObject()?.setY(value);
        }
    }
}