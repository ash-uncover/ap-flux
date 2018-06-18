import { ActionBase } from 'index'
import { ActionRegistry } from 'index'
import { Dispatcher } from 'index'
import { ObjectBase } from 'index'
import { StoreBase } from 'index'
import { StoreRegistry } from 'index'

describe('ap-flux', () => {
    
    ActionRegistry.reset()
    new ActionBase({
        name: 'action_1',
        do: () => new Promise((resolve, reject) => {

        })
    })
    new ActionBase({
        name: 'action_2',
        do: () => new Promise((resolve, reject) => {

        })
    })

    const store1 = new StoreBase ({ name: 'store_1' })
    const store2 = new StoreBase ({ name: 'store_2' })
    
    StoreRegistry.registerStore(store1)
    StoreRegistry.registerStore(store2)

    store1.callback = (result, param) => {
        store1.setData(result.path, result.value)
        store1.notify(result.path)
    }
    store1.callbackError = (result, param) => {
        store1.setData(result.path, result.value)
        store1.notify(result.path)
    }
    Dispatcher.register('ACTION_1', store1.callback)
    Dispatcher.registerError('ACTION_1', store1.callbackError)

    store2.callback = (result, param) => {
        store2.setData(result.path, result.value)
        store2.notify(result.path)
    }
    store2.callbackError = (result, param) => {
        store2.setData(result.path, result.value)
        store2.notify(result.path)
    }
    Dispatcher.register('ACTION_2', store2.callback)
    Dispatcher.registerError('ACTION_2', store2.callbackError)

    beforeEach(() => {
        store1.reset()
        store2.reset()
    })

    test('check initial state', () => {
        expect(Dispatcher._callbacks.ACTION_1.length).toBe(1)
        expect(Dispatcher._callbacks.ACTION_1[0]).toBe(store1.callback)
        expect(Dispatcher._errors.ACTION_1.length).toBe(1)
        expect(Dispatcher._errors.ACTION_1[0]).toBe(store1.callbackError)

        expect(Dispatcher._callbacks.ACTION_2.length).toBe(1)
        expect(Dispatcher._callbacks.ACTION_2[0]).toBe(store2.callback)
        expect(Dispatcher._errors.ACTION_2.length).toBe(1)
        expect(Dispatcher._errors.ACTION_2[0]).toBe(store2.callbackError)
    })

    test('registering callbacks properly handled by the dispatcher', () => {
        const callback = jest.fn()
        StoreRegistry.register('STORE_1', '/path/data1', callback)

        expect(store1.listeners.__CALLBACKS__.length).toBe(0)
        expect(store1.listeners.path.__CALLBACKS__.length).toBe(0)
        expect(store1.listeners.path.data1.__CALLBACKS__.length).toBe(1)

        StoreRegistry.register('STORE_1', '/path/data1', callback)
        expect(store1.listeners.__CALLBACKS__.length).toBe(0)
        expect(store1.listeners.path.__CALLBACKS__.length).toBe(0)
        expect(store1.listeners.path.data1.__CALLBACKS__.length).toBe(2)

        StoreRegistry.register('STORE_1', '/path', callback)
        expect(store1.listeners.__CALLBACKS__.length).toBe(0)
        expect(store1.listeners.path.__CALLBACKS__.length).toBe(1)
        expect(store1.listeners.path.data1.__CALLBACKS__.length).toBe(2)
    })

    test('unregistering callbacks properly handled by the dispatcher', () => {
        const callback = jest.fn()
        StoreRegistry.register('STORE_1', '/path/data1', callback)
        StoreRegistry.register('STORE_1', '/path/data2', callback)
        StoreRegistry.register('STORE_1', '/path', callback)
        StoreRegistry.register('STORE_1', '', callback)

        expect(store1.listeners.__CALLBACKS__.length).toBe(1)
        expect(store1.listeners.path.__CALLBACKS__.length).toBe(1)
        expect(store1.listeners.path.data1.__CALLBACKS__.length).toBe(1)
        expect(store1.listeners.path.data2.__CALLBACKS__.length).toBe(1)

        StoreRegistry.unregister('STORE_1', '/path/data1', callback)
        expect(store1.listeners.__CALLBACKS__.length).toBe(1)
        expect(store1.listeners.path.__CALLBACKS__.length).toBe(1)
        expect(store1.listeners.path.data1.__CALLBACKS__.length).toBe(0)
        expect(store1.listeners.path.data2.__CALLBACKS__.length).toBe(1)

        StoreRegistry.unregister('STORE_1', '/path/data2', callback)
        expect(store1.listeners.__CALLBACKS__.length).toBe(1)
        expect(store1.listeners.path.__CALLBACKS__.length).toBe(1)
        expect(store1.listeners.path.data1.__CALLBACKS__.length).toBe(0)
        expect(store1.listeners.path.data2.__CALLBACKS__.length).toBe(0)

        StoreRegistry.unregister('STORE_1', '/path', callback)
        expect(store1.listeners.__CALLBACKS__.length).toBe(1)
        expect(store1.listeners.path.__CALLBACKS__.length).toBe(0)
        expect(store1.listeners.path.data1.__CALLBACKS__.length).toBe(0)
        expect(store1.listeners.path.data2.__CALLBACKS__.length).toBe(0)

        StoreRegistry.unregister('STORE_1', '', callback)
        expect(store1.listeners.__CALLBACKS__.length).toBe(0)
        expect(store1.listeners.path.__CALLBACKS__.length).toBe(0)
        expect(store1.listeners.path.data1.__CALLBACKS__.length).toBe(0)
        expect(store1.listeners.path.data2.__CALLBACKS__.length).toBe(0)

    })
})