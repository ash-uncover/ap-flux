import ObjectBase from 'core/ObjectBase'
import StoreRegistry from 'core/StoreRegistry'

export default class StoreBase extends ObjectBase {

	constructor(props) {
		super(props)
		this._content = props.content || {}
		this._callbacks = {callbacks: []}
		StoreRegistry.registerStore(this)
	}

	getContent() {
		return this._content
	}

	setContent(content) {
		this._content = content
	}

	notify() {
		let length = this._callbacks.callbacks.length
		for (let i = 0 ; i < length ; i++) {
			let current = this._callbacks.callbacks[i]
			current.callback()
		}
	}
	
	notifyPath(path) {
		this.notify()
		let effectivePath = path
		if (path.charAt(0) == '/') {
			effectivePath = path.substring(1)
		}
		let arrayPath = effectivePath.split('/')
		var temp = this._callbacks
		for (var i = 0 ; i < arrayPath.length ; i++) {
			temp = temp[arrayPath[i]]
			if (typeof temp === 'undefined' || temp === null) {
				break
			}
			if (temp.callbacks && temp.callbacks.length) {
				for (let j = 0 ; j < temp.callbacks.length ; j++) {
					let current = temp.callbacks[j]
					current.callback()
				}
			}			
		}
	}
	
	register(path, controller, callback) {
		if (path.length === 0) {
			this._callbacks.callbacks.push({
				controller: controller,
				callback: callback
			})
		} else {
			var temp = this._callbacks
			for (var i = 0 ; i < path.length ; i++) {
				let p = path[i]
				temp[p] = temp[p] || {}
				temp = temp[p]
			}
			temp.callbacks = temp.callbacks || []
			temp.callbacks.push({
				controller: controller,
				callback: callback
			})
		}
	}
	
	deleteCallBacks(callBacks, controller) {
		for (let i = 0 ; i < callBacks.length ; i++) {
			let current = callBacks[i]
			if (current.controller === controller) {
				callBacks.splice(i, 1);
				i--
				length--
			}
		}
	}
	
	unregisterRecurse(node, controller) {
		for (var prop in node) {
			if (prop === 'callbacks') {
				this.deleteCallBacks(node[prop], controller)
			} else {
				this.unregisterRecurse(node[prop], controller)
			}
		}
	}
	
	unregister(controller) {
		this.unregisterRecurse(this._callbacks, controller)
	}

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

	storeToLocalStorage() {
		localStorage.setItem(this.getLocalStorageName(), JSON.stringify(this._content))
	}

	loadFromLocalStorage() {
		this.setContent(JSON.parse(localStorage.getItem(this.getLocalStorageName())) || {})
		this.notify()
	}

	removeFromLocalStorage() {
		localStorage.removeItem(this.getLocalStorageName())
		this.setContent({})
	}

	getLocalStorageName() {
		return 'AP-LS_' + this.name
	}
}
