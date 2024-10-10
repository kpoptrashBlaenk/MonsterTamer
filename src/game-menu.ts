import { Menu } from './common/menu/menu'

export const MENU_OPTIONS = Object.freeze({
  MONSTERDEX: 'MONSTERDEX',
  SAVE: 'SAVE',
  EXIT: 'EXIT',
})
export type MenuOptions = keyof typeof MENU_OPTIONS

export class GameMenu extends Menu {
  constructor(scene: Phaser.Scene) {
    super(scene, [MENU_OPTIONS.SAVE, MENU_OPTIONS.EXIT])
  }
}
