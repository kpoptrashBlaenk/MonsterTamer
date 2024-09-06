/**
 * @typedef State
 * @type {Object}
 * @property {string} name
 * @property {() => void} [onEnter]
 */

export class StateMachine {
    /** @type {Map<string, State>} */
    #states;
    /** @type {State | undefined} */
    #currentState;
    /** @type {string} */
    #id;
    /** @type {Object | undefined} */
    #context;
    /** @type {boolean} */
    #isChangingState;
    /** @type {string[]} */
    #ChangingStateQueue;

    /**
     *
     * @param {string} id
     * @param {Object | undefined} context
     */
    constructor(id, context) {
        this.#id = id;
        this.#context = context;
        this.#isChangingState = false;
        this.#ChangingStateQueue = [];
        this.#currentState = undefined;
        this.#states = new Map();
    }

    /** @type {string | undefined} */
    get currentStateName() {
        return this.#currentState?.name;
    }

    update() {
        if (this.#ChangingStateQueue.length > 0) {
            this.setState(this.#ChangingStateQueue.shift())
        }
    }

    /**
     *
     * @param {string} name
     */
    setState(name) {
        const methodName = 'setState';

        if (!this.#states.has(name)) {
            console.warn(`[${StateMachine.name}-${this.#id}:${methodName}] tried to change to unknown state: ${name}`);
            return;
        }

        if (this.#isCurrentState(name)) {
            return;
        }

        if (this.#isChangingState) {
            this.#ChangingStateQueue.push(name);
            return;
        }

        this.#isChangingState = true;

        this.#currentState = this.#states.get(name);

        if (this.#currentState.onEnter) {
            this.#currentState.onEnter()
        }

        this.#isChangingState = false;
    }

    /**
     *
     * @param {Object} state
     */
    addState(state) {
        this.#states.set(state.name, {
            name: state.name,
            onEnter: this.#context ? state.onEnter?.bind(this.#context) : state.onEnter
        })
    }

    /**
     *
     * @param {string} name
     * @returns {boolean}
     */
    #isCurrentState(name) {
        if (!this.#currentState) {
            return false;
        }
        return this.#currentState.name === name;
    }
}