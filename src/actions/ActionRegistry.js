class ActionRegistryCreator {

    constructor() {
        this.reset()   
    }

    reset() {
        this._actions = {}
    }

    registerAction(action) {
        const name = action && action.name
        if (name) {
            this._actions[name.toUpperCase()] = action
        } else {
            throw new Error('ActionRegistry.registerAction: cannot register action with no name')
        }
    }

    getAction(action) {
        return this._actions[action.toUpperCase()]
    }

    execute(action, args) {
        const a = this.getAction(action)
        if (!a) {
            throw new Error('ActionRegistry.execute: ' + action + 'unknown action')
        }
        if (!a.do) {
            throw new Error('ActionRegistry.execute: ' + action + 'missing do')
        }
        return a.do(args)
    }
}

const ActionRegistry = new ActionRegistryCreator()
export default ActionRegistry