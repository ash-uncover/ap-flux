/**
 *
 */
export default class ObjectBase {
	
	/**
	 *
	 * @constructor
	 */
	constructor(props) {
		this.name = props.name.toUpperCase();
	}

	/**
	 *
	 */
	getName() {
		return this.name;
	}
}