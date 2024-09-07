import Phaser from '../lib/phaser.ts'
import * as WebFontLoader from "../lib/webfontloader.ts";

export class WebFontFileLoader extends Phaser.Loader.File {
    private readonly fontNames: string[];

    constructor(loader: Phaser.Loader.LoaderPlugin, fontNames: string[]) {
        super(loader, {
            type: 'webfont',
            key: fontNames.toString()
        });
        this.fontNames = fontNames;
    }

    load() {
        WebFontLoader.default.load({
            custom: {
                families: this.fontNames
            },
            active: () => {
                this.loader.nextFile(this, true)
            },
            inactive: () => {
                console.error(`Failed to load custom fonts ${JSON.stringify(this.fontNames)}`)
                this.loader.nextFile(this, false)
            }
        })
    }
}