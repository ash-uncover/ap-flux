import ObjectBase from '../core/ObjectBase'
import ActionRegistry from '../actions/ActionRegistry'

export default class ActionBase extends ObjectBase {

    constructor(props) {
        super(props)
        ActionRegistry.registerAction(this)
        if (props.do) {
            this.do = props.do
        }
    }

    do() {
        throw new Error('This action has not been implemented')
    }
}