import ActionBase from 'actions/ActionBase'
import ActionRegistry from 'actions/ActionRegistry'

describe('ActionBase', () => {

    beforeEach(() => {
        ActionRegistry.registerAction = jest.fn()
    })

    describe('constructor', () => {
    
        test('throws an error when no name is provided', () => {
            expect(() => new ActionBase()).toThrow()
        })
        test('properly stores name when provided', () => {
            const action = new ActionBase({ name: 'test' })

            expect(action.name).toEqual('TEST')
        })
        test('properly calls action registry', () => {
            const action = new ActionBase({ name: 'test' })

            expect(ActionRegistry.registerAction.mock.calls.length).toBe(1)
            expect(ActionRegistry.registerAction.mock.calls[0][0]).toBe(action)
        })
    })

    describe('do', () => {
        test('throws an error when no "do" is provided', () => {
            const action = new ActionBase({ name: 'test' })

            expect(() => action.do()).toThrow()
        })
    })
})