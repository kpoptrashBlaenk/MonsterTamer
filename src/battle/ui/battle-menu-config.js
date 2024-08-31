import Phaser from '../../lib/phaser.js'
import {CUSTOM_FONTS} from "../../assets/font-keys.js";

/** @type {Phaser.Types.GameObjects.Text.TextStyle} */
export const BATTLE_UI_TEXT_STYLE = Object.freeze({
    fontFamily: CUSTOM_FONTS.POKEROGUE,
    color: 'black',
    fontSize: '35px'
})