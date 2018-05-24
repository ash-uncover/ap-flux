export default class ObjectBase {
    
    constructor(args = {}) {
        if (!args.name) {
            throw new Error('name is mandatory')
        }
        this._name = args.name.toUpperCase()
    }

    get name() {
        return this._name
    }
}