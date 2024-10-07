import { Menu } from "./menu"

export const CONFIRMATION_MENU_OPTIONS = Object.freeze({
  YES: 'YES',
  NO: 'NO',
})

export class ConfirmationMenu extends Menu {
  constructor(scene: Phaser.Scene) {
    super(scene, [CONFIRMATION_MENU_OPTIONS.YES, CONFIRMATION_MENU_OPTIONS.NO])
  }
}
