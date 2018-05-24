import ObjectBase from 'core/ObjectBase'

describe('ObjectBase', () => {

    describe('constructor', () => {
    
        test('throws an error when no name is provided', () => {
            expect(() => new ObjectBase()).toThrow()
        })
        test('properly stores name when provided', () => {
            const object = new ObjectBase({ name: 'test' })

            expect(object.name).toEqual('TEST')
        })
    })
})