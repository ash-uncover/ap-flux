import ObjectBase from 'core/ObjectBase'
import ActionRegistry from 'core/ActionRegistry'

export default class ActionBase extends ObjectBase {

	constructor(props) {
		super(props);
		ActionRegistry.registerAction(this);
	}

	do() {
		console.log("This action has not been implemented");
	}
}