import Dispatcher from 'dispatcher/Dispatcher'
import ActionBase from 'actions/ActionBase'
import ActionRegistry from 'actions/ActionRegistry'

import { LOG_CONFIG } from 'ap-utils-logger'
LOG_CONFIG.off()

describe('Dispatcher', () => {

    let successCallback
    let errorCallback

    beforeEach(() => {
        ActionRegistry.reset()
        Dispatcher.reset()

        const actionTest = new ActionBase({ name: 'test' })
        actionTest.do = (arg) => new Promise((resolve, reject) => {
            if (arg) {
                resolve(arg)
            } else {
                reject(arg)
            }
        })
        const actionTestB = new ActionBase({ name: 'testB' })
        actionTestB.do = (arg) => new Promise((resolve, reject) => {
            if (arg) {
                resolve(arg)
            } else {
                reject(arg)
            }
        })
        successCallback = jest.fn()
        Dispatcher.registerSuccess('test', successCallback)
        errorCallback = jest.fn()
        Dispatcher.registerError('test', errorCallback)
    })

    describe('constructor', () => {
    
        test('properly instanciate object', () => {
            expect(Object.keys(Dispatcher.callbacksSuccess).length).toEqual(1)
            expect(Object.keys(Dispatcher.callbacksError).length).toEqual(1)
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
            Dispatcher.register('testX', success, error)

            expect(Object.keys(Dispatcher.callbacksSuccess).length).toEqual(1)
            expect(Object.keys(Dispatcher.callbacksError).length).toEqual(1)
        })
    })

    describe('registerSuccess', () => {

        test('does nothing when no callback is sent', () => {
            Dispatcher.registerSuccess('test')
            expect(Object.keys(Dispatcher.callbacksSuccess).length).toEqual(1)
            expect(Object.keys(Dispatcher.callbacksError).length).toEqual(1)
        })
    })

    describe('registerError', () => {

        test('does nothing when no callback is sent', () => {
            Dispatcher.registerError('test')
            expect(Object.keys(Dispatcher.callbacksSuccess).length).toEqual(1)
            expect(Object.keys(Dispatcher.callbacksError).length).toEqual(1)
        })
    })


    describe('issue', () => {

        test('return error when action does not exists', () => {
            return Dispatcher.issue('test2', {}).then(result => {
                // this should not happen
                expect(true).toBe(false)
            }).catch(error => {
                expect(error).toEqual({
                    action: 'test2',
                    status: 'FAILURE'
                })
            })
        })
        test('return error when action has no "do" method', () => {
            const actionTest2 = new ActionBase({ name: 'test2' })
            actionTest2.do = null
            return Dispatcher.issue('test2', {}).then(result => {
                // this should not happen
                expect(true).toBe(false)
            }).catch(error => {
                expect(error).toEqual({
                    action: 'test2',
                    status: 'FAILURE'
                })
            })
        })
        test('return error when action "do" method was not implemented', () => {
            const actionTest2 = new ActionBase({ name: 'test2' })
            return Dispatcher.issue('test2', {}).then(result => {
                // this should not happen
                expect(true).toBe(false)
            }).catch(error => {
                expect(error).toEqual(new Error('This action has not been implemented'))
            })
        })
        test('calls error callbacks when action fails', () => {
            return Dispatcher.issue('test', false).then(result => {
                // this should not happen
                expect(true).toBe(false)
            }).catch(error => {
                expect(error).toEqual({
                    action: 'test',
                    status: 'FAILURE'
                })
                expect(successCallback.mock.calls.length).toBe(0)
                expect(errorCallback.mock.calls.length).toBe(1)
            })
        })
        test('calls success callbacks when action succeeds', () => {
            return Dispatcher.issue('test', true).then(result => {
                expect(result).toEqual({
                    action: 'test',
                    status: 'SUCCESS'
                })
                expect(successCallback.mock.calls.length).toBe(1)
                expect(errorCallback.mock.calls.length).toBe(0)
            }).catch(error => {
                // this should not happen
                expect(true).toBe(false)
            })
        })
        test('calls success callbacks and returns id when action succeeds', () => {
            return Dispatcher.issue('test', { id: 'myId' }).then(result => {
                expect(result).toEqual({
                    action: 'test',
                    status: 'SUCCESS',
                    id: 'myId'
                })
                expect(successCallback.mock.calls.length).toBe(1)
                expect(errorCallback.mock.calls.length).toBe(0)
            }).catch(error => {
                // this should not happen
                expect(true).toBe(false)
            })
        })
        test('tags the call as ongoing when the action is already under resolution', () => {
            Dispatcher.issue('test', true)
            return Dispatcher.issue('test', true).then(result => {
                expect(result).toEqual({
                    action: 'test',
                    status: 'ONGOING'
                })
            }).catch(error => {
                // this should not happen
                expect(true).toBe(false)
            })
        })
        test('does nothing when there are no listeners for the action', () => {
            return Dispatcher.issue('testB', true).then(result => {
                expect(result).toEqual({
                    action: 'testB',
                    status: 'SUCCESS'
                })
                expect(successCallback.mock.calls.length).toBe(0)
                expect(errorCallback.mock.calls.length).toBe(0)
            }).catch(error => {
                // this should not happen
                expect(true).toBe(false)
            })
        })
        test('does nothing when there are no listeners for the action and it failed', () => {
            return Dispatcher.issue('testB', false).then(result => {
                // this should not happen
                expect(true).toBe(false)
            }).catch(error => {
                expect(error).toEqual({
                    action: 'testB',
                    status: 'FAILURE'
                })
                expect(successCallback.mock.calls.length).toBe(0)
                expect(errorCallback.mock.calls.length).toBe(0)
            })
        })
    })
})
