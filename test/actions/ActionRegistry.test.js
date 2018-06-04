import ActionBase from 'actions/ActionBase'
import ActionRegistry from 'actions/ActionRegistry'

describe('ActionRegistry', () => {

    beforeEach(() => {
        ActionRegistry.reset()
    })

    describe('initialState', () => {

        test('Contains not actions', () => {
            expect(ActionRegistry._actions).toEqual({})
        })
    })

    describe('registerAction', () => {

        test('throws an error when the action is not defined', () => {
            expect(() => ActionRegistry.registerAction()).toThrow()
        })
        test('throws an error when the action has no name', () => {
            expect(() => ActionRegistry.registerAction({})).toThrow()
        })
        test('properly stores actions', () => {
            ActionRegistry.registerAction({ name: 'test' })

            expect(ActionRegistry._actions.TEST).toBeDefined()
        })
    })

    describe('getAction', () => {
        
        test('returns undefined when no matching action is defined', () => {
            expect(ActionRegistry.getAction('test')).toBeUndefined()
        })
        test('returns undefined when the parameter is not defined', () => {
            expect(ActionRegistry.getAction(null)).toBeUndefined()
        })
        test('returns undefined when the parameter is not a string', () => {
            expect(ActionRegistry.getAction(true)).toBeUndefined()
        })
        test('returns the expected action if it exists', () => {
            const action = { name: 'TEST' }
            ActionRegistry.registerAction(action)
            
            expect(ActionRegistry.getAction('TEST')).toBe(action)
        })
        test('properly supports case', () => {
            const action = { name: 'TEST' }
            ActionRegistry.registerAction(action)
            
            expect(ActionRegistry.getAction('test')).toBe(action)
        })
    })

    describe('execute', () => {

        test('throws an error when no matching action is registered', () => {
            expect(() => ActionRegistry.execute('TEST')).toThrow()
        })
        test('throws an error when the action has no do', () => {
            ActionRegistry.registerAction({ name: 'TEST' })

            expect(() => ActionRegistry.execute('TEST')).toThrow()
        })
        test('throws an error when the action has no do', () => {
            const action = { 
                name: 'TEST',
                do: jest.fn()
            }
            const args = {}
            
            ActionRegistry.registerAction(action)
            ActionRegistry.execute('TEST', args)

            expect(action.do.mock.calls.length).toBe(1)
            expect(action.do.mock.calls[0][0]).toBe(args)
        })

    })
})