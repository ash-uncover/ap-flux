import ObjectBase from 'core/ObjectBase'

class ActionRegistry extends ObjectBase {

	constructor (props) {
		super({ name: 'ActionRegistry'})
		this._actions = {}
	}

	registerAction (action) {
		if (action.getName()) {
			this._actions[action.getName().toUpperCase()] = action
		} else {
			console.log('ActionRegistry.register: cannot register action with no name')
		}
	}

	getAction (action) {
		return this._actions[action.toUpperCase()]
	}

	execute (action, args) {
		var a = this.getAction(action)
		if (a && a.do) {
			return a.do(args)
		} else {
			if (a) console.log('ERR: ' + action + ' missing do')
			else console.log('ERR: ' + action + ' missing action')
		}
	}
}

var ActRegistry = new ActionRegistry()
export default ActRegistry