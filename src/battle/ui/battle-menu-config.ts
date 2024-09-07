import Phaser from '../../lib/phaser.ts'
import {CUSTOM_FONTS} from "../../assets/font-keys.ts";

export const BATTLE_UI_TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = Object.freeze({
    fontFamily: CUSTOM_FONTS.POKEROGUE,
    color: 'black',
    fontSize: '35px'
})