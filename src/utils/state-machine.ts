type State = {
  name: string
  onEnter?: () => void
}

export class StateMachine {
  private states: Map<string, State>
  private currentState: State | undefined
  private readonly id: string
  private readonly context: Object | undefined
  private isChangingState: boolean
  private ChangingStateQueue: string[]

  constructor(id: string, context: Object | undefined) {
    this.id = id
    this.context = context
    this.isChangingState = false
    this.ChangingStateQueue = []
    this.currentState = undefined
    this.states = new Map()
  }

  public get currentStateName(): string | undefined {
    return this.currentState?.name
  }

  update() {
    if (this.ChangingStateQueue.length > 0) {
      this.setState(this.ChangingStateQueue.shift())
    }
  }

  public setState(name: string | undefined): void {
    const methodName = 'setState'

    if (!this.states.has(name as string)) {
      console.warn(
        `[${StateMachine.name}-${this.id}:${methodName}] tried to change to unknown state: ${name}`
      )
      return
    }

    if (this.isCurrentState(name as string)) {
      return
    }

    if (this.isChangingState) {
      this.ChangingStateQueue.push(name as string)
      return
    }

    this.isChangingState = true

    this.currentState = this.states.get(name as string)

    if (this.currentState) {
      this.currentState.onEnter?.()
    }

    this.isChangingState = false
  }

  public addState(state: State): void {
    this.states.set(state.name, {
      name: state.name,
      onEnter: this.context ? state.onEnter?.bind(this.context) : state.onEnter,
    })
  }

  private isCurrentState(name: string): boolean {
    if (!this.currentState) {
      return false
    }
    return this.currentState.name === name
  }
}
