import Dispatcher from 'dispatcher/Dispatcher'

import { LOG_CONFIG } from 'ap-utils-logger'
LOG_CONFIG.off()

describe('Dispatcher', () => {

    describe('constructor', () => {
    
        test('properly instanciate object', () => {
            expect(Dispatcher.callbacksSuccess).toEqual([])
            expect(Dispatcher.callbacksError).toEqual([])
            expect(Dispatcher.currentActionCalls).toEqual({})
        })
    })

    describe('register', () => {

        let success
        let error

        beforeEach(() => {
            success = jest.fn()
            error = jest.fn()
        })

        test('does nothing when specified action is not found', () => {
            Dispatcher.register('test', success, error)

            expect(Dispatcher.callbacksSuccess).toEqual([])
            expect(Dispatcher.callbacksError).toEqual([])
        })
    })

    describe('issue', () => {
        
        test('', () => {
        })
    })
})
