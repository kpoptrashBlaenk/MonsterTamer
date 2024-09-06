import Phaser from "../lib/phaser.ts";

// Unfinished class because i don't need it yet that's why placeholders

/**
 *
 * @typedef GlobalState
 * @type {Object}
 * @property {Object} placeholder
 * @property {Object} placeholder.placeholder
 * @property {string} placeholder.placeholder.placeholder
 */

/** @type {GlobalState} */
const initialState = {
    placeholder: {
        placeholder: {
            placeholder: 'placeholder'
        }
    }
}

export const DATA_MANAGER_STORE_KEYS = Object.freeze({
    PLACEHOLDER: 'PLACEHOLDER'
})

class DataManager extends Phaser.Events.EventEmitter{
    /** @type {Phaser.Data.DataManager} */
    #store;
    constructor() {
        super();
        this.#store = new Phaser.Data.DataManager(this);
        this.#updateDataManager(initialState)
    }

    /** @type {Phaser.Data.DataManager} */
    get store() {
        return this.#store;
    }

    /**
     *
     * @param {GlobalState} data
     */
    #updateDataManager(data) {
        this.#store.set({
            [DATA_MANAGER_STORE_KEYS.PLACEHOLDER] : data.placeholder
        })
    }
}

export const dataManager = new DataManager();
dataManager.store.get()