export default class ObjectBase {
	
	constructor(props) {
		this.name = props.name.toUpperCase()
	}

	getName() {
		return this.name
	}
}