import ObjectBase from '../core/ObjectBase'
import StoreRegistry from '../stores/StoreRegistry'
import { extractPath } from '../stores/StoreRegistry'

import Logger from 'ap-utils-logger'

const CALLBACKS = '__CALLBACKS__'

export default class StoreBase extends ObjectBase {

    constructor(props = {}) {
        super(props)
        
        this._baseContent = props.content || {}

        this.reset()

        StoreRegistry.registerStore(this)
    }

    reset() {
        this._content = this._baseContent
        this._listeners = { [CALLBACKS]: [] }
        this._logger = new Logger(this.name)
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

    register(path, callback) {
        const listener = this._getListeners(path)
        listener[CALLBACKS].push(callback)
    }

    unregister(path, callback) {
        const listener = this._getListeners(path)
        listener[CALLBACKS].splice(listener[CALLBACKS].indexOf(callback), 1)
    }

    notify(path) {
        // call top level listeners
        this._notifyListeners(this.listeners)
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
        listeners[CALLBACKS].forEach((callback) => callback())
    }

    _getListeners(path) {
        return extractPath(path).reduce((listeners, pathElem) => {
            listeners[pathElem] = Object.assign(
                { [CALLBACKS]: [] },
                listeners[pathElem]
            )
            return listeners[pathElem]
        }, this.listeners)
    }

    /* DATA MANAGEMENT */

    getData(path) {
        return extractPath(path).reduce((data, pathElem) => {
            if (data) {
                return data[pathElem]                
            }
        }, this.content)
    }

    setData(path, value) {
        let done = false
        const concretePath = extractPath(path)
        let data = concretePath.reduce((data, pathElem, index) => {
            if (index === concretePath.length - 1) {
                data[pathElem] = value
                done = true
            } else {
                data[pathElem] = data[pathElem] || {}    
            }
            return data[pathElem]
        }, this.content)
        if (!done) {
            this.content = value
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
            if (content) {
                this.content = JSON.parse(content)    
            } else {
                this.content = {}
            }
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
