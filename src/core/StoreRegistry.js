import ObjectBase from 'core/ObjectBase.js';

class StoreRegistry extends ObjectBase {

	constructor () {
		super({ name: 'StoreRegistry'});
		this._stores = {};
	}

	registerStore (store) {
		if (store.getName()) {
			this._stores[store.getName().toLowerCase()] = store;
		} else {
			console.log('StoreRegistry.register: cannot register store with no name');
		}
	}

	register (path, object, callback) {
		path = path.split("/");
		var store = path[0];
		path.splice(0, 1);
		this._getStore(store).register(path, object, callback);
	}

	unregister (store, object) {
    	this._getStore(store).unregister(object);
    }

    getStore (store) {
    	return this._stores[store.toLowerCase()];
    }

    _getStore (store) {
    	var s = this._stores[store.toLowerCase()];
    	if (s && s.register && s.unregister) {
    		return s;
    	} else {
    		if (s) {
    			if (s.register) {
    				throw "StoreRegistry.ERR: " + store + " missing unregister";
    			} else {
    				throw "StoreRegistry.ERR: " + store + " missing register";
    			}
    		} else {
    			throw "StoreRegistry.ERR: " + store + " missing store";
    		}
       	}
    };
}

// Singleton pattern: creates the StoreRegistry instance
var StoRegistry = new StoreRegistry();

// Exports the StoreRegistry unique instance
export default StoRegistry;