import ObjectBase from 'core/ObjectBase'
import ActionRegistry from 'core/ActionRegistry'

let DEBUG = true;

function log(msg) {
	if (DEBUG) {
		console.log(msg)
	}
}

/**
 * The dispatcher receives actions request, triggers the actions and notify the registered stores.
 * Note: actions with no registered stores will NOT be executed.
 */
class Dispatcher extends ObjectBase {

	constructor() {
		super({ name: 'Dispatcher'})
		this._callbacks = []
		this._errors = []
		this._onGoing = {}
	}

	register(action, callback, error) {
		var a = ActionRegistry.getAction(action)
		if (a) {
			if (callback) {
				this._callbacks[a.getName()] = this._callbacks[a.getName()] || []
				this._callbacks[a.getName()].push(callback)
			}
			if (error) {
				this._errors[a.getName()] = this._errors[a.getName()] || []
				this._errors[a.getName()].push(error)
			}
		} else {
			console.error('Unknown action: ' + action)
		}
	}

	issue (action, param) {
		var a = ActionRegistry.getAction(action)
		log('Dispatcher >> RECEIVING ' + action + ' (' + JSON.stringify(param) + ')')
		if (a && a.do) {
			let execId = JSON.stringify(action) + JSON.stringify(param)
			if (this._onGoing[execId]) {
				log('Dispatcher >> ONGOING ' + action)
				return new Promise(function(resolve, reject) {
					resolve({ action: action, status: 'ongoing' })
				})
			} else {
				return new Promise(function(resolve, reject) {
					this._onGoing[execId] = true
					a.do(param).
					then( (result) => {
						delete this._onGoing[execId]
						log('Dispatcher >> OK ' + action)
						if (action !== 'GET_IMAGE') {
							log(result)
						}
						var callbacks = this._callbacks[a.getName()] || []
						var length = callbacks.length
						for (var i = 0 ; i < length ; i++) {
							callbacks[i](result, param)
						}
						if (result && result.id) {
							resolve({ action: action, status: 'ok', id: result.id })
                        } else {
                            resolve({ action: action, status: 'ok' })
                        }
					}).
					catch( (error) => {
						delete this._onGoing[execId]
						log("Dispatcher >> ERR ")
						log(error)
						var errors = this._errors[a.getName()] || []
						for (let i = 0 ; i < errors.length ; i++) {
							errors[i](error)
						}
						reject({ action: action, status: 'error' })
					})
				}.bind(this))
			}
		} else if (a) {
			return new Promise(function(resolve, reject) {
				console.error('missing do on action: ' + action)
				reject( { action: action, status: 'Missing do' } )
			})
		} else {
			return new Promise(function( resolve, reject) {
				console.error('Unknown action: ' + action)
				reject({ action: action, status: 'Unknown action' })
			})
		}
	}
}

var Disp = new Dispatcher()
export default Disp