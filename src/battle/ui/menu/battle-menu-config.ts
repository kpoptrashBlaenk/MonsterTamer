import Phaser from 'phaser'
import { CUSTOM_FONTS } from '../../../assets/font-keys'

export const BATTLE_UI_TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = Object.freeze({
  fontFamily: CUSTOM_FONTS.POKEROGUE,
  color: 'black',
  fontSize: '35px',
})
