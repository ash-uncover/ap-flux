import Logger from 'ap-utils-logger'
const LOGGER = new Logger('StoreRegistry')

export const normalizeName = (name) => name.toUpperCase()

export const extractPath = (path) => {
    return (path || '').split('/')
        .filter((elem) => (elem && elem.trim()))
        .map((elem) => elem.trim())
}

export const normalizePath = (path) => extractPath(path).join('/')

class StoreRegistryCreator {

    constructor () {
        this.reset()
    }

    reset() {
        this._stores = {}   
    }

    checkStore(store) {
        if (!store) {
            throw 'StoreRegistry.checkStore: store is undefined'
        }
        if (!store.name) {
            throw 'StoreRegistry.checkStore: store is missing name'
        }
        if (!store.register) {
            throw 'StoreRegistry.checkStore: store is missing register'
        }
        if (!store.unregister) {
            throw 'StoreRegistry.checkStore: store is missing unregister'
        }
    }

    registerStore (store) {
        this.checkStore(store)
        this._stores[normalizeName(store.name)] = store
    }

    register (storeName, path, callback) {
        this.getStore(storeName).register(normalizePath(path), callback)
    }

    unregister (storeName, path, callback) {
        this.getStore(storeName).unregister(normalizePath(path), callback)
    }

    getStore (storeName) {
        const name = normalizeName(storeName)
        return this._stores[name]
    }
}

const StoreRegistry = new StoreRegistryCreator()
export default StoreRegistry