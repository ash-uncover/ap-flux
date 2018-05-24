import StoreBase from 'stores/StoreBase'
import StoreRegistry from 'stores/StoreRegistry'

import { normalizeName, extractPath, normalizePath } from 'stores/StoreRegistry'

describe('normalizeName', () => {

    test('Returns the expected name', () => {
        const name = 'test'
        expect(normalizeName(name)).toEqual('TEST')
    })
})

describe('extractPath', () => {

    test('returns empty array when path is undefined', () => {
        expect(extractPath()).toEqual([])
    })
    test('returns empty array when path is null', () => {
        const path = null
        expect(extractPath(path)).toEqual([])
    })
    test('returns empty array when path is empty', () => {
        const path = ''
        expect(extractPath(path)).toEqual([])
    })
    test('returns expected array when path valid', () => {
        const path = 'first/second/third'
        expect(extractPath(path)).toEqual(['first','second','third'])
    })
    test('ignores useless slashes', () => {
        const path = '//first////second/third//'
        expect(extractPath(path)).toEqual(['first','second','third'])
    })
    test('ignores white spaces', () => {
        const path = '//  first  /  / // second/third  //  '
        expect(extractPath(path)).toEqual(['first','second','third'])
    })
})


describe('normalizePath', () => {

    test('returns the expected path', () => {
        const path = '  / /  first/ /// second / third//   '
        expect(normalizePath(path)).toEqual('first/second/third')
    })
})


describe('StoreRegistry', () => {

    beforeEach(() => {
        StoreRegistry.reset()
    })

    describe('checkStore', () => {

        test('throws an error when store is not defined', () => {
            const store = null
            expect(() => StoreRegistry.checkStore(store)).toThrow()
        })
        test('throws an error when store has no name', () => {
            const store = {}
            expect(() => StoreRegistry.checkStore(store)).toThrow()
        })
        test('throws an error when store has no register', () => {
            const store = { name: 'name' }
            expect(() => StoreRegistry.checkStore(store)).toThrow()
        })
        test('throws an error when store has no unregister', () => {
            const store = { 
                name: 'name', 
                register: jest.fn() 
            }
            expect(() => StoreRegistry.checkStore(store)).toThrow()
        })
        test('does nothing when the store is compliant', () => {
            const store = { 
                name: 'name', 
                register: jest.fn(),
                unregister: jest.fn() 
            }
            expect(() => StoreRegistry.checkStore(store)).not.toThrow()
        })
    })

    describe('registerStore', () => {

        test('properly register valid stores', () => {
            const store = { 
                name: 'store', 
                register: jest.fn(),
                unregister: jest.fn() 
            }

            expect(StoreRegistry._stores['STORE']).toBeUndefined()
            StoreRegistry.registerStore(store)

            expect(StoreRegistry._stores['STORE']).toBeDefined()
        })
    })

    describe('register', () => {

        test('properly calls the store method', () => {
            const store = { 
                name: 'store', 
                register: jest.fn(),
                unregister: jest.fn() 
            }
            const path = '//1/2//'
            const object = {}
            const callback = jest.fn()
            StoreRegistry.registerStore(store)

            StoreRegistry.register('sTorE', path, object, callback)

            expect(store.register.mock.calls.length).toBe(1)
            expect(store.register.mock.calls[0][0]).toEqual('1/2')
            expect(store.register.mock.calls[0][1]).toEqual(object)
            expect(store.register.mock.calls[0][2]).toEqual(callback)
        })
    })

    describe('unregister', () => {

        test('properly calls the store method', () => {
            const store = { 
                name: 'store', 
                register: jest.fn(),
                unregister: jest.fn() 
            }
            const path = '//1/2//'
            const object = {}
            const callback = jest.fn()
            StoreRegistry.registerStore(store)

            StoreRegistry.register('sTorE', path, object, callback)
            StoreRegistry.unregister('sTorE', object)

            expect(store.unregister.mock.calls.length).toBe(1)
            expect(store.unregister.mock.calls[0][0]).toEqual(object)
        })
    })

    describe('getStore', () => {

        test('properly returns a registered store', () => {
            const store = {}
            expect(StoreRegistry.getStore('store')).toBeUndefined()
            StoreRegistry._stores['STORE'] = store

            expect(StoreRegistry.getStore('store')).toBeDefined()
        })
    })
})