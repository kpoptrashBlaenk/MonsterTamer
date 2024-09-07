import Phaser from "../lib/phaser.ts";

// Unfinished class because I don't need it yet that's why placeholders

interface GlobalState {
    placeholder: {
        placeholder: {
            placeholder: string
        }
    }
}

const initialState: GlobalState = {
    placeholder: {
        placeholder: {
            placeholder: 'placeholder'
        }
    }
}

export const DATA_MANAGER_STORE_KEYS = Object.freeze({
    PLACEHOLDER: 'PLACEHOLDER'
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

    private updateDataManager(data: GlobalState): void {
        this.store.set({
            [DATA_MANAGER_STORE_KEYS.PLACEHOLDER]: data.placeholder
        })
    }
}

export const dataManager = new DataManager();
dataManager.getStore