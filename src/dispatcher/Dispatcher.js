import ObjectBase from 'core/ObjectBase'
import ActionRegistry from 'actions/ActionRegistry'

import Logger from 'ap-utils-logger'
const LOGGER = new Logger('Dispatcher')

export const STATUS = {
    ONGOING: 'ONGOING',
    SUCCESS: 'SUCCESS',
    FAILURE: 'FAILURE'
}

/**
 * The dispatcher receives actions request, triggers the actions and notify the registered stores.
 * Note: actions with no registered stores will NOT be executed.
 */
class Dispatcher {

    constructor() {
        this.reset()
    }

    /* GETTERS & SETTERS */

    get callbacksSuccess() {
        return this._callbacks
    }

    get callbacksError() {
        return this._errors
    }

    get currentActionCalls() {
        return this._onGoing
    }

    /* METHODS */

    reset() {
        this._callbacks = {}
        this._errors = {}
        this._onGoing = {}
    }

    register(action, success, error) {
        this.registerSuccess(action, success)
        this.registerError(action, success)
    }

    registerSuccess(action, callback) {
        const a = ActionRegistry.getAction(action)
        if (a) {
            if (callback) {
                this._callbacks[a.name] = this._callbacks[a.name] || []
                this._callbacks[a.name].push(callback)
            }
        } else {
            LOGGER.error(`registerSucess: unknown action: "${action}"`)
        }
    }

    registerError(action, callback) {
        const a = ActionRegistry.getAction(action)
        if (a) {
            if (callback) {
                this._errors[a.name] = this._errors[a.name] || []
                this._errors[a.name].push(callback)
            }
        } else {
            LOGGER.error(`registerError: unknown action: "${action}"`)
        }
    }

    issue (action, param) {
        const a = ActionRegistry.getAction(action)
        LOGGER.debug(`issue ${action} (${JSON.stringify(param)})`)
        if (a && a.do) {
            let execId = JSON.stringify(action) + JSON.stringify(param)
            if (this._onGoing[execId]) {
                LOGGER.debug(`>> ${STATUS.ONGOING} ${action}`)
                return new Promise(function(resolve, reject) {
                    resolve({ action: action, status: STATUS.ONGOING })
                })
            } else {
                return new Promise(function(resolve, reject) {
                    this._onGoing[execId] = true
                    a.do(param).
                    then(result => {
                        delete this._onGoing[execId]
                        LOGGER.debug('>> OK ' + action)
                        LOGGER.debug(result)
                        const callbacks = this._callbacks[a.name] || []
                        for (let i = 0 ; i < callbacks.length ; i++) {
                            callbacks[i](result, param)
                        }
                        if (result && result.id) {
                            resolve({ action: action, status: STATUS.SUCCESS, id: result.id })
                        } else {
                            resolve({ action: action, status: STATUS.SUCCESS })
                        }
                    }).
                    catch(error => {
                        delete this._onGoing[execId]
                        LOGGER.debug('>> ERR ')
                        LOGGER.debug(error)
                        const errors = this._errors[a.name] || []
                        for (let i = 0 ; i < errors.length ; i++) {
                            errors[i](error)
                        }
                        reject({ action: action, status: STATUS.FAILURE })
                    })
                }.bind(this))
            }
        } else if (a) {
            return new Promise(function(resolve, reject) {
                LOGGER.error(`missing do on action: ${action}`)
                reject( { action: action, status: STATUS.FAILURE } )
            })
        } else {
            return new Promise(function(resolve, reject) {
                LOGGER.error(`Unknown action: ${action}`)
                reject({ action: action, status: STATUS.FAILURE })
            })
        }
    }
}

const Disp = new Dispatcher()
export default Disp