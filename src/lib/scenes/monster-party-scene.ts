import {SCENE_KEYS} from "./scene-keys";
import {BaseScene} from "./base-scene";
import {HealthBar} from "../../battle/ui/health-bar";
import {BATTLE_ASSET_KEYS, MONSTER_PARTY_ASSET_KEYS, UI_ASSET_KEYS} from "../../assets/asset-keys";
import Phaser from "phaser";
import {CUSTOM_FONTS} from "../../assets/font-keys";

const UI_TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = Object.freeze({
    fontFamily: CUSTOM_FONTS.POKEROGUE,
    color: '#FFFFFF',
    fontSize: '30px'
})

export class MonsterPartyScene extends BaseScene {
    private monsterPartyBackgrounds: Phaser.GameObjects.Image[]
    private cancelButton: Phaser.GameObjects.Image
    private infoTextGameObject: Phaser.GameObjects.Text
    private healthBars: HealthBar[]
    private healthTextGameObjects: Phaser.GameObjects.Text[]
    private selectedPartyMonsterIndex: number

    constructor() {
        super({
            key: SCENE_KEYS.MONSTER_PARTY_SCENE,
        })

        this.monsterPartyBackgrounds = []
        this.healthBars = []
        this.healthTextGameObjects = []
        this.selectedPartyMonsterIndex = 0
    }

    create() {
        super.create()

        // Create Background
        this.add.tileSprite(0, 0, this.scale.width, this.scale.height, MONSTER_PARTY_ASSET_KEYS.PARTY_BACKGROUND, 0) // TileSprite takes frame and multiplies it to fill image
            .setOrigin(0)
            .setAlpha(0.7)

        // Create Button
        const buttonContainer = this.add.container(883, 519, [])
        this.cancelButton = this.add.image(0,0, UI_ASSET_KEYS.BLUE_BUTTON, 0)
            .setOrigin(0)
            .setScale(0.7, 1)
            .setAlpha(0.7)
        const cancelText = this.add.text(66.5, 20.6, 'Cancel', UI_TEXT_STYLE).setOrigin(0.5)
        buttonContainer.add([this.cancelButton, cancelText])

        // Info Container
        const infoContainer = this.add.container(4, this.scale.height - 69, [])
        const infoDisplay = this.add.rectangle(0, 0, 867, 65, 0xede4f3, 1)
            .setOrigin(0)
            .setStrokeStyle(8, 0x905ec2, 1)
        this.infoTextGameObject = this.add.text(15, 8, '', {
            fontFamily: CUSTOM_FONTS.POKEROGUE,
            color: '#000000',
            fontSize: '25px'
        })
        infoContainer.add([infoDisplay, this.infoTextGameObject])
        this.updateInfoContainerText()

        // Create Monsters
        this.add.image(0, 10, BATTLE_ASSET_KEYS.HEALTH_BAR_BACKGROUND).setOrigin(0).setScale(1.1, 1.2)
        this.add.image(510, 40, BATTLE_ASSET_KEYS.HEALTH_BAR_BACKGROUND).setOrigin(0).setScale(1.1, 1.2).setAlpha(0.7)
        this.add.image(0, 160, BATTLE_ASSET_KEYS.HEALTH_BAR_BACKGROUND).setOrigin(0).setScale(1.1, 1.2).setAlpha(0.7)
        this.add.image(510, 190, BATTLE_ASSET_KEYS.HEALTH_BAR_BACKGROUND).setOrigin(0).setScale(1.1, 1.2).setAlpha(0.7)
        this.add.image(0, 310, BATTLE_ASSET_KEYS.HEALTH_BAR_BACKGROUND).setOrigin(0).setScale(1.1, 1.2).setAlpha(0.7)
        this.add.image(510, 340, BATTLE_ASSET_KEYS.HEALTH_BAR_BACKGROUND).setOrigin(0).setScale(1.1, 1.2).setAlpha(0.35)
    }

    private updateInfoContainerText() {
        if(this.selectedPartyMonsterIndex < -1) {
            this.infoTextGameObject.setText('Go back to previous menu.')
            return
        }
        this.infoTextGameObject.setText('Choose a monster.')
    }
}