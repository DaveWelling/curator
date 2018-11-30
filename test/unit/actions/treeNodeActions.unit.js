import expect, { spyOn, createSpy, restoreSpies } from 'expect';
import * as treeNodeActions from '../../../src/actions/treeNodeActions';
import cuid from 'cuid';
import * as modelActions from '../../../src/actions/projectModelActions';

describe('treeNodeActions', () => {
    afterEach(restoreSpies);
    describe('setAsNextSiblingOfModel', function(){
        it('calls projectModelChange with the new parentId', function(){
            throw new Error('not implemented');
            let currentParentNode = {_id: cuid()};
            let currentNode = {_id: cuid(), parentId: currentParentNode._id};
            let state = {
                treeNodesByParentId: {
                    [currentParentNode._id]: [currentNode]
                }
            };
            let getStateSpy = ()=> state;
            let dispatchSpy = createSpy();
        });
    });
    describe('makeNextSiblingOfParent', function(){
        describe('model is at root', function(){
            it('does nothing', function(done){
                // Current node is inside root
                let currentParentNode = {_id: cuid()}; // <= root node
                let currentNode = {_id: cuid(), parentId: currentParentNode._id};
                spyOn(modelActions, 'getCachedModel').andReturn(Promise.resolve(undefined));
                let setAsNextSiblingOfModel = spyOn(treeNodeActions, 'setAsNextSiblingOfModel');
                treeNodeActions.makeNextSiblingOfParent(currentNode)(()=>{}, ()=>{}).then(()=>{
                    expect(setAsNextSiblingOfModel).toNotHaveBeenCalled();
                    done();
                }).catch(done);
            });
        });
        describe('parent exists', function(){
            it('makes model the next sibling of its parent', function(done){
                let currentParentNode = {_id: cuid()};
                let currentNode = {_id: cuid(), parentId: currentParentNode._id};
                spyOn(modelActions, 'getCachedModel').andReturn(Promise.resolve(currentParentNode));
                let setAsNextSiblingOfModel = spyOn(treeNodeActions, 'setAsNextSiblingOfModel');
                treeNodeActions.makeNextSiblingOfParent(currentNode)(()=>{}, ()=>{}).then(()=>{
                    expect(setAsNextSiblingOfModel).toHaveBeenCalled();
                    done();
                }).catch(done);
            });
        });
    });
    describe('getPreviousNodeInSequence', function(){
        describe('previous sibling exists', function(){
            describe('prevous sibling has children', function(){
                describe('children are expanded', function(){
                    it('returns the last node in previous sibling\'s children', function(){
                        let parentId = cuid();
                        let currentModel = {_id: cuid(), ui: {sequence: 1}, parentId};
                        let previousModel = {_id: cuid(), ui: {sequence: 0, collapsed: false}, parentId};
                        let anotherChildModel = {_id: cuid(), ui: {sequence: 0}, parentId: previousModel._id};
                        let lastChildModel = {_id: cuid(), ui: {sequence: 1}, parentId: previousModel._id};
                        let state = {
                            treeNodesByParentId: {
                                [parentId]: [currentModel, previousModel],
                                [previousModel._id]: [lastChildModel, anotherChildModel]
                            }
                        };
                        let result = treeNodeActions.getPreviousNodeInSequence(currentModel, state);
                        expect(result).toBe(lastChildModel);
                    });
                });
                describe('children are collapsed', function(){
                    it('returns the previous sibling', function(){
                        let parentId = cuid();
                        let currentModel = {_id: cuid(), ui: {sequence: 1}, parentId};
                        let previousModel = {_id: cuid(), ui: {sequence: 0, collapsed: true}, parentId};
                        let anotherChildModel = {_id: cuid(), ui: {sequence: 0}, parentId: previousModel._id};
                        let lastChildModel = {_id: cuid(), ui: {sequence: 1}, parentId: previousModel._id};
                        let state = {
                            treeNodesByParentId: {
                                [parentId]: [currentModel, previousModel],
                                [previousModel._id]: [lastChildModel, anotherChildModel]
                            }
                        };
                        let result = treeNodeActions.getPreviousNodeInSequence(currentModel, state);
                        expect(result).toBe(previousModel);
                    });
                });
            });
            describe('previous sibling has no children', function(){
                it('returns the previous sibling', function(){
                    let parentId = cuid();
                    let currentModel = {_id: cuid(), ui: {sequence: 1}, parentId};
                    let previousModel = {_id: cuid(), ui: {sequence: 0}, parentId};
                    let state = {
                        treeNodesByParentId: {
                            [parentId]: [currentModel, previousModel]
                        }
                    };
                    let result = treeNodeActions.getPreviousNodeInSequence(currentModel, state);
                    expect(result).toBe(previousModel);
                });
            });
        });
        describe('previous sibling does not exist', function(){
            it('returns undefined', function(){
                let parentId = cuid();
                let currentModel = {_id: cuid(), ui: {sequence: 1}, parentId};
                let state = {
                    treeNodesByParentId: {
                        [parentId]: [currentModel]
                    }
                };
                let result = treeNodeActions.getPreviousNodeInSequence(currentModel, state);
                expect(result).toBe(undefined);
            });
        });
    });
    describe('getNextNodeInSequence', function(){
        describe('current node has children', function(){
            describe('children are not collapsed', function(){
                it('returns first child of current node', function(){
                    let parentId = cuid();
                    let currentModel = {_id: cuid(), ui: {sequence: 0, collapsed: false}, parentId};
                    let firstChildModel = {_id: cuid(), ui: {sequence: 0}, parentId: currentModel._id};
                    let nextModel = {_id: cuid(), ui: {sequence: 1}, parentId};
                    let state = {
                        treeNodesByParentId: {
                            [parentId]: [currentModel, nextModel],
                            [currentModel._id]: [firstChildModel]
                        }
                    };
                    let result = treeNodeActions.getNextNodeInSequence(currentModel, state);
                    expect(result).toBe(firstChildModel);
                });
            });
            describe('children are collapsed', function(){
                it('returns next sibling', function(){
                    let parentId = cuid();
                    let currentModel = {_id: cuid(), ui: {sequence: 0, collapsed: true}, parentId};
                    let firstChildModel = {_id: cuid(), ui: {sequence: 0}, parentId: currentModel._id};
                    let nextModel = {_id: cuid(), ui: {sequence: 1}, parentId};
                    let state = {
                        treeNodesByParentId: {
                            [parentId]: [currentModel, nextModel],
                            [currentModel._id]: [firstChildModel]
                        }
                    };
                    let result = treeNodeActions.getNextNodeInSequence(currentModel, state);
                    expect(result).toBe(nextModel);
                });
            });
        });
        describe('current node has no children', function(){
            describe('a sibling exists after the current node', function(){
                it('returns sibling after current node', function(){
                    let parentId = cuid();
                    let currentModel = {_id: cuid(), ui: {sequence: 0}, parentId};
                    let nextModel = {_id: cuid(), ui: {sequence: 1}, parentId};
                    let state = {
                        treeNodesByParentId: {
                            [parentId]: [currentModel, nextModel]
                        }
                    };
                    let result = treeNodeActions.getNextNodeInSequence(currentModel, state);
                    expect(result).toBe(nextModel);
                });
            });
            describe('as sibling does NOT exist after the current node', function(){
                it('returns undefined', function(){
                    let parentId = cuid();
                    let currentModel = {_id: cuid(), ui: {sequence: 0}, parentId};
                    let state = {
                        treeNodesByParentId: {
                            [parentId]: [currentModel]
                        }
                    };
                    let result = treeNodeActions.getNextNodeInSequence(currentModel, state);
                    expect(result).toBe(undefined);
                });
            });
        });

    });
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
                    projectModelChangeSpy.andCall((value, propertyName, {_id}) => {
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
                    projectModelChangeSpy.andCall((value, propertyName, {_id}) => {
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
                    projectModelChangeSpy.andCall((value, propertyName, {_id}) => {
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
                    projectModelChangeSpy.andCall((value, propertyName, {_id}) => {
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
                    projectModelChangeSpy.andCall((value, propertyName, {_id}) => {
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
            describe('only bottom level collapsed', function() {
                it('collapses the second level', function() {
                    node1.ui.collapsed = false;
                    node2.ui.collapsed = false;
                    node3.ui.collapsed = true;
                    projectModelChangeSpy.andCall((value, propertyName, {_id}) => {
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
