import { ActionBase } from 'index'
import { ActionRegistry } from 'index'
import { Dispatcher } from 'index'
import { ObjectBase } from 'index'
import { StoreBase } from 'index'
import { StoreRegistry } from 'index'

describe('ap-flux', () => {

    describe('ActionBase', () => {
    
        test('isDefined', () => {
            expect(ActionBase).toBeDefined()
        })        
    })

    describe('ActionRegistry', () => {
    
        test('isDefined', () => {
            expect(ActionRegistry).toBeDefined()
        })        
    })

    describe('Dispatcher', () => {
    
        test('isDefined', () => {
            expect(Dispatcher).toBeDefined()
        })        
    })

    describe('ObjectBase', () => {
    
        test('isDefined', () => {
            expect(ObjectBase).toBeDefined()
        })        
    })

    describe('StoreBase', () => {
    
        test('isDefined', () => {
            expect(StoreBase).toBeDefined()
        })        
    })

    describe('StoreRegistry', () => {
    
        test('isDefined', () => {
            expect(StoreRegistry).toBeDefined()
        })        
    })
})