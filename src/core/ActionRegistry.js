import ObjectBase from 'core/ObjectBase'

/**
 * This class lists the available actions in the application.
 * It is used as single entry point to access actions by the dispatcher.
 */
class ActionRegistry extends ObjectBase {
    
    constructor (props) {
        super({ name: 'ActionRegistry'})
        this._actions = {}
    }

    registerAction (action) {
        if (action.getName()) {
            this._actions[action.getName().toUpperCase()] = action
        } else {
            console.log("ActionRegistry.register: cannot register action with no name")
        }
    }

    getAction (action) {
        return this._actions[action.toUpperCase()]
    }

    execute (action, args) {
        let a = this.getAction(action)
        if (a && a.do) {
            return a.do(args)
        } else {
            if (a) {
                console.log("ERR: " + action + " missing do")
            } else {
                console.log("ERR: " + action + " missing action")
            }
        }
    }
}

var ActRegistry = new ActionRegistry()
export default ActRegistry