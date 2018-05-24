import ObjectBase from 'core/ObjectBase'
import StoreRegistry from 'stores/StoreRegistry'
import { extractPath } from 'stores/StoreRegistry'

import Logger from 'ap-utils-logger'

const CALLBACKS = '__CALLBACKS__'

export default class StoreBase extends ObjectBase {

    constructor(props) {
        super(props)
        
        this._content = props.content || {}
        this._listeners = { [CALLBACKS]: [] }
        this._logger = new Logger(props.name)

        StoreRegistry.registerStore(this)
    }

    /* GETTERS & SETTERS */

    get content() {
        return this._content
    }
    set content(content) {
        this._content = content
    }

    get listeners() {
        return this._listeners
    }

    /* REGISTER & NOTIFY */

    register(path, controller, callback) {
        // Find the correct listener position
        const listener = extractPath(path).reduce((listeners, pathElem) => {
            listeners[pathElem] = Object.assign(
                { [CALLBACKS]: [] },
                listeners[pathElem]
            )
            return listeners[pathElem]
        }, this.listeners)
        // Add callback
        listener[CALLBACKS].push({
            controller: controller,
            callback: callback
        })
    }

    unregister(controller) {
        this._unregisterRecurse(this.listeners, controller)
    }
    _unregisterRecurse(listeners, controller) {
        Object.keys(listeners).forEach((key) => {
            if (key === CALLBACKS) {
                listeners[CALLBACKS] = listeners[CALLBACKS].filter((listener) => {
                    return listener.controller !== controller
                })
            } else {
                this._unregisterRecurse(listeners[key], controller)
            }
        })
    }

    notify() {
        this._notifyListeners(this.listeners)
    }
    notifyPath(path) {
        // call top level listeners
        this.notify()
        // Drill through the path
        extractPath(path).reduce((listeners, pathElem) => {
            if (listeners && listeners[pathElem]) {
                const result = listeners[pathElem]
                this._notifyListeners(result)
                return result
            }
        }, this.listeners)
    }
    _notifyListeners(listeners) {
        listeners[CALLBACKS].forEach((listener) => listener.callback())
    }

    /* DATA MANAGEMENT */

    getData(path) {
        if (path) {
            let spath = path.split('/')
            let current = this._content
            for (let i = 0 ; i < spath.length ; i++) {
                if (spath[i] !== '') {
                    current = current[spath[i]]
                    if (typeof current === 'undefined' || current === null) {
                        return undefined
                    }
                }
            }
            return current
        } else {
            return this._content
        }
    }

    setData(path, value) {
        if (path) {
            let spath = path.split('/').filter(function(s) { return !!s })
            if (spath.length) {
                let current = this._content
                for (let i = 0 ; i < spath.length - 1 ; i++) {
                    if (spath[i] !== '') {
                        let next = current[spath[i]]
                        if (typeof next === 'undefined' || next === null) {
                            current[spath[i]] = {}
                        }
                        current = current[spath[i]]
                    }
                }
                current[spath[spath.length - 1]] = value
            } else {
                throw 'must specify a real path'
            }
        } else {
            throw 'must specify a path'
        }
    }

    /* LOCAL STORAGE MANAGEMENT */

    get localStorageName() {
        return 'STORE_' + this.name
    }

    storeToLocalStorage() {
        try {
            const content = JSON.stringify(this.content)
            localStorage.setItem(this.localStorageName, content)
        } catch (error) {
            this._logger.error('failed to write local storage')
            this._logger.error(error)
        }
    }

    loadFromLocalStorage() {
        try {
            const content = localStorage.getItem(this.localStorageName)
            this.content = JSON.parse(content) || {}
            this.notify()
        } catch (error) {
            this._logger.error('failed to read local storage')
            this._logger.error(error)   
        }
    }

    removeFromLocalStorage() {
        try {
            localStorage.removeItem(this.localStorageName)
        } catch (error) {
            this._logger.error('failed to reset local storage')
            this._logger.error(error)
        }
        this.content = {}
    }
}
