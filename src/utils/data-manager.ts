import Phaser from "../lib/phaser.ts";
import {
    BATTLE_SCENE_OPTIONS,
    BattleSceneOptions,
    MenuColorOptions, SOUND_OPTIONS,
    SoundOptions, TEXT_SPEED_OPTIONS,
    TextSpeedOptions,
    VolumeOptions
} from "../common/options.ts";
import {TEXT_SPEED, TextSpeed} from "../config.ts";
import {exhaustiveGuard} from "./guard.ts";

const LOCAL_STORAGE_KEY = 'MONSTER_TAMER_DATA';

interface GlobalState {
    options: {
        textSpeed: TextSpeedOptions;
        battleScene: BattleSceneOptions;
        sound: SoundOptions;
        volume: VolumeOptions;
        menuColor: MenuColorOptions;
    }
}

const initialState: GlobalState = {
    options: {
        textSpeed: TEXT_SPEED_OPTIONS.SLOW,
        battleScene: BATTLE_SCENE_OPTIONS.ON,
        sound: SOUND_OPTIONS.ON,
        volume: 4,
        menuColor: 0
    }
}

export const DATA_MANAGER_STORE_KEYS = Object.freeze({
    OPTIONS_TEXT_SPEED: 'OPTIONS_TEXT_SPEED',
    OPTIONS_BATTLE_SCENE_ANIMATIONS: 'OPTIONS_BATTLE_SCENE_ANIMATIONS',
    OPTIONS_SOUND: 'OPTIONS_SOUND',
    OPTIONS_VOLUME: 'OPTIONS_VOLUME',
    OPTIONS_MENU_COLOR: 'OPTIONS_MENU_COLOR',
})

class DataManager extends Phaser.Events.EventEmitter {
    private readonly store: Phaser.Data.DataManager;

    constructor() {
        super();
        this.store = new Phaser.Data.DataManager(this);
        this.updateDataManager(initialState)
    }

    public get getStore(): Phaser.Data.DataManager {
        return this.store;
    }

    public loadData() {
        if (typeof Storage === 'undefined') {
            console.warn(`[${DataManager.name}:loadData]: localStorage is not supported, can't save data.`)
            return;
        }

        const savedData = localStorage.getItem(LOCAL_STORAGE_KEY)

        if (savedData === null) {
            return;
        }

        try {
            const parsedData: GlobalState = JSON.parse(savedData);
            this.updateDataManager(parsedData)
        } catch (error) {
            console.warn(`[${DataManager.name}:saveData]: Error when trying to parse and save data from localStorage.`)
        }
    }

    public saveData(): void {
        if (typeof Storage === 'undefined') {
            console.warn(`[${DataManager.name}:saveData]: localStorage is not supported, can't save data.`)
            return;
        }

        const dataToSave: GlobalState = this.dataManagerDataToGlobalStateObject();
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave))
    }

    public getAnimatedTextSpeed(): TextSpeed | undefined {
        const chosenTextSpeed: TextSpeedOptions = this.getStore.get(DATA_MANAGER_STORE_KEYS.OPTIONS_TEXT_SPEED)
        if (chosenTextSpeed === undefined) {
            return TEXT_SPEED.SLOW
        }

        switch (chosenTextSpeed) {
            case TEXT_SPEED_OPTIONS.SLOW:
                return TEXT_SPEED.SLOW
            case TEXT_SPEED_OPTIONS.MID:
                return TEXT_SPEED.MID
            case TEXT_SPEED_OPTIONS.FAST:
                return TEXT_SPEED.FAST
            default:
                exhaustiveGuard(chosenTextSpeed)
        }
    }

    private dataManagerDataToGlobalStateObject(): GlobalState {
        return {
            options: {
                textSpeed: this.getStore.get(DATA_MANAGER_STORE_KEYS.OPTIONS_TEXT_SPEED),
                battleScene: this.getStore.get(DATA_MANAGER_STORE_KEYS.OPTIONS_BATTLE_SCENE_ANIMATIONS),
                sound: this.getStore.get(DATA_MANAGER_STORE_KEYS.OPTIONS_SOUND),
                volume: this.getStore.get(DATA_MANAGER_STORE_KEYS.OPTIONS_VOLUME),
                menuColor: this.getStore.get(DATA_MANAGER_STORE_KEYS.OPTIONS_MENU_COLOR),
            }
        }
    }

    private updateDataManager(data: GlobalState): void {
        this.store.set({
            [DATA_MANAGER_STORE_KEYS.OPTIONS_TEXT_SPEED]: data.options.textSpeed,
            [DATA_MANAGER_STORE_KEYS.OPTIONS_BATTLE_SCENE_ANIMATIONS]: data.options.battleScene,
            [DATA_MANAGER_STORE_KEYS.OPTIONS_SOUND]: data.options.sound,
            [DATA_MANAGER_STORE_KEYS.OPTIONS_VOLUME]: data.options.volume,
            [DATA_MANAGER_STORE_KEYS.OPTIONS_MENU_COLOR]: data.options.menuColor
        })
    }
}

export const dataManager: DataManager = new DataManager();