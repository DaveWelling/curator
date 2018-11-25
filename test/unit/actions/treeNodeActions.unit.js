import expect, { spyOn, createSpy, restoreSpies } from 'expect';
import * as treeNodeActions from '../../../src/actions/treeNodeActions';
import cuid from 'cuid';
import * as modelActions from '../../../src/actions/projectModelActions';

describe('treeNodeActions', () => {
    afterEach(restoreSpies);
    describe('toggleCollapse', function() {
        describe('passed node is collapsed', function() {
            it('requests a projectModelChange with collapsed = false', function() {
                let dispatchFunction = createSpy();
                let updateSpy = spyOn(modelActions, 'projectModelChange').andReturn(dispatchFunction);
                let treeNode = {
                    _id: cuid(),
                    title: cuid(),
                    ui: {
                        collapsed: true
                    }
                };
                let dispatchSpy = createSpy();
                treeNodeActions.toggleCollapse(treeNode)(dispatchSpy);
                updateSpy.andCall((value, propertyName, model) => {
                    expect(value).toBe(false);
                    expect(propertyName).toEqual('ui.collapsed');
                    expect(model).toBe(treeNode);
                });
                expect(updateSpy).toHaveBeenCalled();
            });
        });
    });
    describe('3 deep hierarchy', function() {
        let projectModelChangeSpy, node1, node2, node3, getStateSpy, dispatchSpy;
        beforeEach(function() {
            let dispatchFunction = createSpy();
            projectModelChangeSpy = spyOn(modelActions, 'projectModelChange').andReturn(dispatchFunction);
            const rootId = cuid();
            const node1Id = cuid();
            node1 = { _id: node1Id, ui: { collapsed: true } };
            const node2Id = cuid();
            node2 = { _id: node2Id, ui: { collapsed: true } };
            const node3Id = cuid();
            node3 = { _id: node3Id, ui: {} };
            let state = {
                treeNodesByParentId: {
                    [rootId]: [node1],
                    [node1Id]: [node2],
                    [node2Id]: [node3]
                }
            };
            getStateSpy = createSpy().andReturn(state);
            dispatchSpy = createSpy();
        });
        describe('tryDescendingExpansion', function() {
            describe('top of hierarchy collapsed', function() {
                it('expands top hierarchy', function() {
                    projectModelChangeSpy.andCall((value, propertyName, _id) => {
                        return ()=>{
                            expect(value).toBe(false);
                            expect(propertyName).toEqual('ui.collapsed');
                            expect(_id).toBe(node1._id);
                        };
                    });
                    treeNodeActions.tryDescendingExpansion(node1)(dispatchSpy, getStateSpy);
                    expect(projectModelChangeSpy).toHaveBeenCalled();
                });
            });
            describe('top level expanded and second level collapsed', function() {
                it('expands the second level', function() {
                    node1.ui.collapsed = false;
                    node2.ui.collapsed = true;
                    projectModelChangeSpy.andCall((value, propertyName, _id) => {
                        return ()=>{
                            expect(value).toBe(false);
                            expect(propertyName).toEqual('ui.collapsed');
                            expect(_id).toBe(node2._id);
                        };
                    });
                    treeNodeActions.tryDescendingExpansion(node1)(dispatchSpy, getStateSpy);
                    expect(projectModelChangeSpy).toHaveBeenCalled();
                });
            });
            describe('only bottom level collapsed', function() {
                it('expands the bottom level', function() {
                    node1.ui.collapsed = false;
                    node2.ui.collapsed = false;
                    node3.ui.collapsed = true;
                    projectModelChangeSpy.andCall((value, propertyName, _id) => {
                        return ()=>{
                            expect(value).toBe(false);
                            expect(propertyName).toEqual('ui.collapsed');
                            expect(_id).toBe(node3._id);
                        };
                    });
                    treeNodeActions.tryDescendingExpansion(node1)(dispatchSpy, getStateSpy);
                    expect(projectModelChangeSpy).toHaveBeenCalled();
                });
            });
        });
        describe('tryAscendingCollapse', function(){
            describe('top of hierarchy collapsed', function() {
                it('returns false', function() {
                    node1.ui.collapsed = true;
                    let result = treeNodeActions.tryAscendingCollapse(node1)(dispatchSpy, getStateSpy);
                    expect(result).toBe(false);
                    expect(projectModelChangeSpy).toNotHaveBeenCalled();
                });
            });
            describe('top of hierarchy expanded', function() {
                it('collapses top hierarchy', function() {
                    node1.ui.collapsed = false;
                    node2.ui.collapsed = true;
                    node3.ui.collapsed = true;
                    projectModelChangeSpy.andCall((value, propertyName, _id) => {
                        return ()=>{
                            expect(value).toBe(true);
                            expect(propertyName).toEqual('ui.collapsed');
                            expect(_id).toBe(node1._id);
                        };
                    });

                    treeNodeActions.tryAscendingCollapse(node1)(dispatchSpy, getStateSpy);
                    expect(projectModelChangeSpy).toHaveBeenCalled();
                });
            });
            describe('top level expanded and second level collapsed', function() {
                it('collapses the second level', function() {
                    node1.ui.collapsed = false;
                    node2.ui.collapsed = true;
                    projectModelChangeSpy.andCall((value, propertyName, model) => {
                        return ()=>{
                            expect(value).toBe(true);
                            expect(propertyName).toEqual('ui.collapsed');
                            expect(model).toBe(node1._id);
                        };
                    });
                    treeNodeActions.tryAscendingCollapse(node1)(dispatchSpy, getStateSpy);
                    expect(projectModelChangeSpy).toHaveBeenCalled();
                });
            });
            describe('only bottom level collapsed', function() {
                it('collapses the second level', function() {
                    node1.ui.collapsed = false;
                    node2.ui.collapsed = false;
                    node3.ui.collapsed = true;
                    projectModelChangeSpy.andCall((value, propertyName, _id) => {
                        return ()=>{
                            expect(value).toBe(true);
                            expect(propertyName).toEqual('ui.collapsed');
                            expect(_id).toBe(node2._id);
                        };
                    });
                    treeNodeActions.tryAscendingCollapse(node1)(dispatchSpy, getStateSpy);
                    expect(projectModelChangeSpy).toHaveBeenCalled();
                });
            });
        });
    });
});
