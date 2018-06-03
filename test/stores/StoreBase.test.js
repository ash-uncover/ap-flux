import StoreBase from 'stores/StoreBase'
import StoreRegistry from 'stores/StoreRegistry'

import { getLocalStorageMock } from 'ap-utils-test'

import { LOG_CONFIG } from 'ap-utils-logger'
LOG_CONFIG.off()

describe('StoreBase', () => {

    beforeEach(() => {
        global.localStorage = getLocalStorageMock()        
    })

    let store

    beforeEach(() => {
        StoreRegistry.registerStore = jest.fn()
        store = new StoreBase({ name: 'test' })
    })

    describe('constructor', () => {
    
        test('throws an error when no name is provided', () => {
            expect(() => new StoreBase()).toThrow()
        })
        test('properly stores name when provided', () => {
            expect(store.name).toEqual('TEST')
            expect(store.content).toEqual({})
            expect(store.listeners).toEqual({ __CALLBACKS__: [] })
        })
        test('properly calls store registry', () => {
            expect(StoreRegistry.registerStore.mock.calls.length).toBe(1)
            expect(StoreRegistry.registerStore.mock.calls[0][0]).toBe(store)
        })
    })

    describe('_getListeners', () => {
        
        test('contains nothing initially', () => {
            expect(store._getListeners()).toEqual({
                 __CALLBACKS__: []
            })
        })
        test('returns listerns from the expected level', () => {
            const callback1 = jest.fn()
            const callback2 = jest.fn()

            store._listeners = {
                 __CALLBACKS__: [],
                 path1: {
                    __CALLBACKS__: [ callback1 ]
                 },
                 path2: {
                    __CALLBACKS__: [ callback2 ]
                 }
            }

            expect(store._getListeners('path1')).toEqual({
                 __CALLBACKS__: [ callback1 ]
            })
        })
    })

    describe('register', () => {
        
        test('register on top level when path is empty', () => {
            const callback = jest.fn()

            store.register('', callback)
            
            expect(store.listeners).toEqual({
                __CALLBACKS__: [ callback ]
            })
        })
        test('creates the expected callback hierarchy', () => {
            const callback = jest.fn()

            store.register('path1/path2', callback)
            
            expect(store.listeners).toEqual({
                __CALLBACKS__: [],
                path1: {
                    __CALLBACKS__: [],
                    path2: {
                        __CALLBACKS__: [ callback ]
                    }
                }
            })
        })
        test('creates the expected callback hierarchy when several callbacks are set', () => {
            const callback1 = jest.fn()
            const callback2 = jest.fn()

            store.register('path1/path2', callback1)
            store.register('path1/path3', callback2)
            
            expect(store.listeners).toEqual({
                __CALLBACKS__: [],
                path1: {
                    __CALLBACKS__: [],
                    path2: {
                        __CALLBACKS__: [
                            callback1
                        ]
                    },
                    path3: {
                        __CALLBACKS__: [
                            callback2
                        ]
                    }
                }
            })
        })
        test('creates the expected callback hierarchy when several callbacks are set at same position', () => {
            const callback1 = jest.fn()
            const callback2 = jest.fn()

            store.register('path1/path2', callback1)
            store.register('path1/path2', callback2)
            
            expect(store.listeners).toEqual({
                __CALLBACKS__: [],
                path1: {
                    __CALLBACKS__: [],
                    path2: {
                        __CALLBACKS__: [
                            callback1,
                            callback2
                        ]
                    }
                }
            })
        })  
    })

    describe('unregister', () => {

        test('removes listeners when on top level', () => {
            const callback = jest.fn()

            store.register('', callback)
            store.unregister('', callback)
            
            expect(store.listeners).toEqual({
                __CALLBACKS__: []
            })
        })
        test('removes listeners all along the path', () => {
            const callback = jest.fn()

            store.register('', callback)
            store.register('path1/path2', callback)
            store.register('path1', callback)
            store.unregister('path1', callback)
            
            expect(store.listeners).toEqual({
                __CALLBACKS__: [ callback ],
                path1: {
                    __CALLBACKS__: [],
                    path2: {
                        __CALLBACKS__: [ callback ]
                    }    
                }
            })
        })
        test('does not removes listeners from other controllers', () => {
            const callback1 = jest.fn()
            const callback2 = jest.fn()

            store.register('path1', callback1)
            store.register('path1', callback2)

            store.unregister('path1', callback1)
            
            expect(store.listeners).toEqual({
                __CALLBACKS__: [],
                path1: {
                    __CALLBACKS__: [ callback2 ]
                }
            })
        })
    })

    describe('notify', () => {

        test('calls the top level callbacks when no path is specified', () => {
            const callback = jest.fn()

            store.register('', callback)
            store.notify()
            
            expect(callback.mock.calls.length).toBe(1)
        })
        test('calls callbacks all along the path', () => {
            const callback = jest.fn()
            const callback1 = jest.fn()
            const callback2 = jest.fn()

            store.register('', callback)
            store.register('path1', callback1)
            store.register('/path1/path2/', callback2)
            store.notify('path1/path2')
            
            expect(callback.mock.calls.length).toBe(1)
            expect(callback1.mock.calls.length).toBe(1)
            expect(callback2.mock.calls.length).toBe(1)
        })
        test('does not call callbacks outside the path', () => {
            const callback = jest.fn()
            const callback1 = jest.fn()
            const callback2 = jest.fn()

            store.register('', callback)
            store.register('path1', callback1)
            store.register('/path1/path2/', callback2)
            store.notify('path1/path3')
            
            expect(callback.mock.calls.length).toBe(1)
            expect(callback1.mock.calls.length).toBe(1)
            expect(callback2.mock.calls.length).toBe(0)
        })
        test('support unbound path', () => {
            const callback = jest.fn()

            store.register('path1/path2/path3', callback)
            store.notify('a/b/c/d')
            
            expect(callback.mock.calls.length).toBe(0)
        })
    })

    describe('getData', () => {

        test('properly retrieves data from root when no path specified', () => {
            store.content = {
                key1: { key11: 'value11' },
                key2: 'value2'
            }
            
            expect(store.getData()).toEqual({
                key1: {
                    key11: 'value11'
                },
                key2: 'value2'
            })
        })
        test('properly retrieves data from specified path', () => {
            store.content = {
                key1: { key11: 'value11' },
                key2: 'value2'
            }
            
            expect(store.getData('key1/key11')).toEqual('value11')
        })
        test('finds nothing when path does not exists', () => {
            store.content = {
                key1: { key11: 'value11' },
                key2: 'value2'
            }
            
            expect(store.getData('key3/key2')).toEqual(undefined)
        })
    })

    describe('setData', () => {

        test('properly stores data in root when no path specified', () => {
            store.setData(null, { key2: 'value2' })

            expect(store.content).toEqual({
                key2: 'value2'
            })
        })
        test('properly sets data in specified path', () => {
            store.setData('key1/key11', 'value1')
            
            expect(store.content).toEqual({
                key1: {
                    key11: 'value1'
                }
            })
        })
        test('properly updates an existing path', () => {
            store.setData('key1/key2/key3', 'value1')
            store.setData('key1/key2/key4', 'value2')
            
            expect(store.content).toEqual({
                key1: {
                    key2: {
                        key3: 'value1',
                        key4: 'value2'
                    }
                }
            })
        })
    })

    describe('localStorageName', () => {

        test('is correct', () => {
            expect(store.localStorageName).toEqual('STORE_TEST')
        })
    })

    describe('storeToLocalStorage', () => {

        test('handles error scenario without crashing', () => {
            store._content = {}
            localStorage.setItem = jest.fn(() => { throw new Error('') })

            expect(() => store.storeToLocalStorage()).not.toThrow()
            expect(localStorage.setItem.mock.calls.length).toBe(1)
        })
        test('stores the current content is the local storage', () => {
            const content = { test: 'storeToLocalStorage' }
            store._content = content

            store.storeToLocalStorage()
            expect(localStorage.getItem(store.localStorageName)).toEqual(JSON.stringify(content))
        })
    })

    describe('loadFromLocalStorage', () => {

        test('handles error scenario without crashing', () => {
            localStorage.getItem = jest.fn(() => { throw new Error('') })

            expect(() => store.loadFromLocalStorage()).not.toThrow()
            expect(localStorage.getItem.mock.calls.length).toBe(1)
        })
        test('sets empty content when local storage was empty', () => {
            store.loadFromLocalStorage()
            expect(store.content).toEqual({})
        })
        test('retrieves data from local storage', () => {
            const content = { test: 'loadFromLocalStorage' }
            localStorage.setItem(store.localStorageName, JSON.stringify(content))

            store.loadFromLocalStorage()

            expect(store.content).toEqual(content)
        })
    })

    describe('removeFromLocalStorage', () => {

        test('handles error scenario without crashing', () => {
            localStorage.removeItem = jest.fn(() => { throw new Error('') })

            expect(() => store.removeFromLocalStorage()).not.toThrow()
            expect(localStorage.removeItem.mock.calls.length).toBe(1)
        })
        test('resets data within local storage', () => {
            const content = { test: 'loadFromLocalStorage' }
            localStorage.setItem(store.localStorageName, JSON.stringify(content))
            
            store.removeFromLocalStorage()

            expect(localStorage.getItem(store.localStorageName)).toBe(null)
        })
        test('resets store content', () => {
            const content = { test: 'loadFromLocalStorage' }
            store._content = content
            
            store.removeFromLocalStorage()

            expect(store._content).toEqual({})
        })
    })
})