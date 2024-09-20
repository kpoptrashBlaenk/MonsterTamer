import Phaser from "phaser";
import {
    BATTLE_SCENE_OPTIONS,
    BattleSceneOptions,
    MenuColorOptions, SOUND_OPTIONS,
    SoundOptions, TEXT_SPEED_OPTIONS,
    TextSpeedOptions,
    VolumeOptions
} from "../common/options";
import {TEXT_SPEED, TextSpeed} from "../config";
import {exhaustiveGuard} from "./guard";
import {Monster} from "../types/typedef";
import {MONSTER_ASSET_KEYS} from "../assets/asset-keys";

const LOCAL_STORAGE_KEY = 'MONSTER_TAMER_DATA';

interface MonsterData {
    inParty: Monster[]
}

interface GlobalState {
    options: {
        textSpeed: TextSpeedOptions;
        battleScene: BattleSceneOptions;
        sound: SoundOptions;
        volume: VolumeOptions;
        menuColor: MenuColorOptions;
    }
    gameStarted: boolean;
    monsters: MonsterData
}

const initialState: GlobalState = {
    options: {
        textSpeed: TEXT_SPEED_OPTIONS.SLOW,
        battleScene: BATTLE_SCENE_OPTIONS.ON,
        sound: SOUND_OPTIONS.ON,
        volume: 4,
        menuColor: 0
    },
    gameStarted: false,
    monsters: {
        inParty: [
            {
                id: 1,
                monsterId: 1,
                name: MONSTER_ASSET_KEYS.IGUANIGNITE,
                assetKey: MONSTER_ASSET_KEYS.IGUANIGNITE,
                assetFrame: 0,
                currentLevel: 5,
                currentHp: 25,
                maxHp: 25,
                attackIds: [1, 2],
                baseAttack: 15
            }
        ]
    }
}

export const DATA_MANAGER_STORE_KEYS = Object.freeze({
    OPTIONS_TEXT_SPEED: 'OPTIONS_TEXT_SPEED',
    OPTIONS_BATTLE_SCENE_ANIMATIONS: 'OPTIONS_BATTLE_SCENE_ANIMATIONS',
    OPTIONS_SOUND: 'OPTIONS_SOUND',
    OPTIONS_VOLUME: 'OPTIONS_VOLUME',
    OPTIONS_MENU_COLOR: 'OPTIONS_MENU_COLOR',
    GAME_STARTED: 'GAME_STARTED',
    MONSTERS_IN_PARTY: 'MONSTERS_IN_PARTY'
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

    public startNewGame() {
        // get existing data, keep settings data, then erase data
        const existingData = {...this.dataManagerDataToGlobalStateObject()}
        // existingData.player.position = {...initialState.player.position} for erasing data
        existingData.gameStarted = initialState.gameStarted
        existingData.monsters = {
            inParty: {...initialState.monsters.inParty}
        }

        this.store.reset()
        this.updateDataManager(existingData)
        this.saveData()
    }

    private dataManagerDataToGlobalStateObject(): GlobalState {
        return {
            options: {
                textSpeed: this.getStore.get(DATA_MANAGER_STORE_KEYS.OPTIONS_TEXT_SPEED),
                battleScene: this.getStore.get(DATA_MANAGER_STORE_KEYS.OPTIONS_BATTLE_SCENE_ANIMATIONS),
                sound: this.getStore.get(DATA_MANAGER_STORE_KEYS.OPTIONS_SOUND),
                volume: this.getStore.get(DATA_MANAGER_STORE_KEYS.OPTIONS_VOLUME),
                menuColor: this.getStore.get(DATA_MANAGER_STORE_KEYS.OPTIONS_MENU_COLOR),
            },
            gameStarted: this.getStore.get(DATA_MANAGER_STORE_KEYS.GAME_STARTED),
            monsters: {
                inParty: {...this.getStore.get(DATA_MANAGER_STORE_KEYS.MONSTERS_IN_PARTY)}
            }
        }
    }

    private updateDataManager(data: GlobalState): void {
        this.store.set({
            [DATA_MANAGER_STORE_KEYS.OPTIONS_TEXT_SPEED]: data.options.textSpeed,
            [DATA_MANAGER_STORE_KEYS.OPTIONS_BATTLE_SCENE_ANIMATIONS]: data.options.battleScene,
            [DATA_MANAGER_STORE_KEYS.OPTIONS_SOUND]: data.options.sound,
            [DATA_MANAGER_STORE_KEYS.OPTIONS_VOLUME]: data.options.volume,
            [DATA_MANAGER_STORE_KEYS.OPTIONS_MENU_COLOR]: data.options.menuColor,
            [DATA_MANAGER_STORE_KEYS.GAME_STARTED]: data.gameStarted,
            [DATA_MANAGER_STORE_KEYS.MONSTERS_IN_PARTY]: data.monsters.inParty

        })
    }
}

export const dataManager: DataManager = new DataManager();