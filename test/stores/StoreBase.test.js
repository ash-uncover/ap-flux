import StoreBase from 'stores/StoreBase'
import StoreRegistry from 'stores/StoreRegistry'

describe('StoreBase', () => {

    beforeEach(() => {
        StoreRegistry.registerStore = jest.fn()
    })

    describe('constructor', () => {
    
        test('throws an error when no name is provided', () => {
            expect(() => new StoreBase()).toThrow()
        })
        test('properly stores name when provided', () => {
            const store = new StoreBase({ name: 'test' })

            expect(store.name).toEqual('TEST')
            expect(store.content).toEqual({})
            expect(store.listeners).toEqual({ __CALLBACKS__: [] })
        })
        test('properly calls store registry', () => {
            const store = new StoreBase({ name: 'test' })

            expect(StoreRegistry.registerStore.mock.calls.length).toBe(1)
            expect(StoreRegistry.registerStore.mock.calls[0][0]).toBe(store)
        })
    })

    describe('register', () => {
        
        test('register on top level when path is empty', () => {
            const store = new StoreBase({ name: 'test' })
            const controller = {}
            const callback = jest.fn()

            store.register('', controller, callback)
            
            expect(store.listeners).toEqual({
                __CALLBACKS__: [{
                    controller: controller,
                    callback: callback
                }]
            })
        })
        test('creates the expected callback hierarchy', () => {
            const store = new StoreBase({ name: 'test' })
            const controller = {}
            const callback = jest.fn()

            store.register('path1/path2', controller, callback)
            
            expect(store.listeners).toEqual({
                __CALLBACKS__: [],
                path1: {
                    __CALLBACKS__: [],
                    path2: {
                        __CALLBACKS__: [
                            { controller: controller, callback: callback }
                        ]
                    }
                }
            })
        })
        test('creates the expected callback hierarchy when several callbacks are set', () => {
            const store = new StoreBase({ name: 'test' })
            const controller1 = {}
            const callback1 = jest.fn()
            const controller2 = {}
            const callback2 = jest.fn()

            store.register('path1/path2', controller1, callback1)
            store.register('path1/path3', controller2, callback2)
            
            expect(store.listeners).toEqual({
                __CALLBACKS__: [],
                path1: {
                    __CALLBACKS__: [],
                    path2: {
                        __CALLBACKS__: [
                            { controller: controller1, callback: callback1 }
                        ]
                    },
                    path3: {
                        __CALLBACKS__: [
                            { controller: controller2, callback: callback2 }
                        ]
                    }
                }
            })
        })
        test('creates the expected callback hierarchy when several callbacks are set at same position', () => {
            const store = new StoreBase({ name: 'test' })
            const controller1 = {}
            const callback1 = jest.fn()
            const controller2 = {}
            const callback2 = jest.fn()

            store.register('path1/path2', controller1, callback1)
            store.register('path1/path2', controller2, callback2)
            
            expect(store.listeners).toEqual({
                __CALLBACKS__: [],
                path1: {
                    __CALLBACKS__: [],
                    path2: {
                        __CALLBACKS__: [
                            { controller: controller1, callback: callback1 },
                            { controller: controller2, callback: callback2 }
                        ]
                    }
                }
            })
        })  
    })

    describe('unregister', () => {

        test('removes listeners when on top level', () => {
            const store = new StoreBase({ name: 'test' })
            const controller = {}
            const callback = jest.fn()

            store.register('', controller, callback)
            store.unregister(controller)
            
            expect(store.listeners).toEqual({
                __CALLBACKS__: []
            })
        })
        test('removes listeners all along the path', () => {
            const store = new StoreBase({ name: 'test' })
            const controller = {}
            const callback = jest.fn()

            store.register('', controller, callback)
            store.register('path1/path2', controller, callback)
            store.register('path1', controller, callback)
            store.unregister(controller)
            
            expect(store.listeners).toEqual({
                __CALLBACKS__: [],
                path1: {
                    __CALLBACKS__: [],
                    path2: {
                        __CALLBACKS__: []
                    }    
                }
            })
        })
        test('does not removes listeners from other controllers', () => {
            const store = new StoreBase({ name: 'test' })
            const controller = { id: 'controller' }
            const controller1 = { id: 'controller1' }
            const callback = jest.fn()

            store.register('', controller, callback)
            store.register('path1/path2', controller, callback)
            store.register('path1', controller, callback)
            store.register('path1', controller1, callback)
            store.unregister(controller)
            
            expect(store.listeners).toEqual({
                __CALLBACKS__: [],
                path1: {
                    __CALLBACKS__: [ { controller: controller1, callback: callback }],
                    path2: {
                        __CALLBACKS__: []
                    }    
                }
            })
        })
    })

    describe('notify', () => {

        test('calls the top level callbacks', () => {
            const store = new StoreBase({ name: 'test' })
            const controller = {}
            const callback = jest.fn()

            store.register('', controller, callback)
            store.notify()
            
            expect(callback.mock.calls.length).toBe(1)
        })
        test('does not call the deep callbacks', () => {
            const store = new StoreBase({ name: 'test' })
            const controller = {}
            const callback = jest.fn()

            store.register('path1', controller, callback)
            store.notify()
            
            expect(callback.mock.calls.length).toBe(0)
        }) 
    })

    describe('notifyPath', () => {

        test('calls the top level callbacks when no path is specified', () => {
            const store = new StoreBase({ name: 'test' })
            const controller = {}
            const callback = jest.fn()

            store.register('', controller, callback)
            store.notifyPath()
            
            expect(callback.mock.calls.length).toBe(1)
        })
        test('calls callbacks all along the path', () => {
            const store = new StoreBase({ name: 'test' })
            const controller = {}
            const callback = jest.fn()
            const controller1 = {}
            const callback1 = jest.fn()
            const controller2 = {}
            const callback2 = jest.fn()

            store.register('', controller, callback)
            store.register('path1', controller1, callback1)
            store.register('/path1/path2/', controller2, callback2)
            store.notifyPath('path1/path2')
            
            expect(callback.mock.calls.length).toBe(1)
            expect(callback1.mock.calls.length).toBe(1)
            expect(callback2.mock.calls.length).toBe(1)
        })
        test('does not call callbacks outside the path', () => {
            const store = new StoreBase({ name: 'test' })
            const controller = {}
            const callback = jest.fn()
            const controller1 = {}
            const callback1 = jest.fn()
            const controller2 = {}
            const callback2 = jest.fn()

            store.register('', controller, callback)
            store.register('path1', controller1, callback1)
            store.register('/path1/path2/', controller2, callback2)
            store.notifyPath('path1/path3')
            
            expect(callback.mock.calls.length).toBe(1)
            expect(callback1.mock.calls.length).toBe(1)
            expect(callback2.mock.calls.length).toBe(0)
        })
        test('support unbound path', () => {
            const store = new StoreBase({ name: 'test' })
            const controller = {}
            const callback = jest.fn()

            store.register('path1/path2/path3', controller, callback)
            store.notifyPath('a/b/c/d')
            
            expect(callback.mock.calls.length).toBe(0)
        })
    })
})