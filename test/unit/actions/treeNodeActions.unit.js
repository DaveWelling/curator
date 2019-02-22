import expect, { spyOn, createSpy, restoreSpies } from 'expect';
import * as treeNodeActions from '../../../src/actions/treeNodeActions';
import cuid from 'cuid';
import * as modelActions from '../../../src/actions/projectModelActions';

describe('treeNodeActions', () => {
    afterEach(restoreSpies);
    describe('ensureVisible', function(){
        describe('node parent is collapsed', function(){
            it('expands parent', function(done){
                let parentNode = {_id: cuid(), ui:{collapsed:true}};
                let currentNode = {_id: cuid(), parentId: parentNode._id};
                let state = {
                    treeNodesByParentId: {
                        [parentNode._id]: [currentNode]
                    }
                };
                let getStateMock = ()=> state;
                let lookupCount = 0;
                spyOn(modelActions, 'getCachedModel').andCall(()=>{
                    lookupCount++;
                    switch (lookupCount) {
                        case 1:
                            return Promise.resolve(parentNode);
                        default:
                            return Promise.resolve(undefined);
                    }
                });

                let projectModelChangeSpy = spyOn(modelActions, 'projectModelChange').andReturn(()=>Promise.resolve(undefined));
                treeNodeActions.ensureVisible(currentNode)(()=>{}, getStateMock).then(()=>{
                    expect(projectModelChangeSpy).toHaveBeenCalled();
                    let callParms = projectModelChangeSpy.calls[0].arguments;
                    expect(callParms[1]).toEqual('ui.collapsed');
                    expect(callParms[0]).toEqual(false);
                    done();
                }).catch(done);
            });
        });
        describe('node parent\'s parent is collapsed', function(){
            it('expands grandparent', function(done){
                let grandparentNode = {_id: cuid(), ui:{collapsed:true}};
                let parentNode = {_id: cuid(), ui:{collapsed:false}};
                let currentNode = {_id: cuid(), parentId: parentNode._id};
                let state = {
                    treeNodesByParentId: {
                        [parentNode._id]: [currentNode],
                        [grandparentNode._id]: [parentNode]
                    }
                };
                let getStateMock = ()=> state;
                let lookupCount = 0;
                spyOn(modelActions, 'getCachedModel').andCall(()=>{
                    lookupCount++;
                    switch (lookupCount) {
                        case 1:
                            return Promise.resolve(parentNode);
                        case 2:
                            return Promise.resolve(grandparentNode);
                        default:
                            return Promise.resolve(undefined);
                    }
                });

                let projectModelChangeSpy = spyOn(modelActions, 'projectModelChange').andReturn(()=>Promise.resolve(undefined));
                treeNodeActions.ensureVisible(currentNode)(()=>{}, getStateMock).then(()=>{
                    expect(projectModelChangeSpy).toHaveBeenCalled();
                    let callParms = projectModelChangeSpy.calls[0].arguments;
                    expect(callParms[2]).toBe(grandparentNode);
                    expect(callParms[1]).toEqual('ui.collapsed');
                    expect(callParms[0]).toEqual(false);
                    done();
                }).catch(done);
            });
        });
    });
    describe('makeChildOfPreviousSibling', function(){
        describe('previous sibling does not exist', function(){
            it('does nothing', function(){
                let parentNode = {_id: cuid()};
                let currentNode = {_id: cuid(), parentId: parentNode._id};
                let state = {
                    treeNodesByParentId: {
                        [parentNode._id]: [currentNode]
                    }
                };
                let getStateMock = ()=> state;
                let projectModelChangeSpy = spyOn(modelActions, 'projectModelChanges').andReturn(()=>Promise.resolve(undefined));
                treeNodeActions.makeChildOfPreviousSibling(currentNode)(()=>{}, getStateMock);
                expect(projectModelChangeSpy).toNotHaveBeenCalled();
            });
        });
        describe('previous sibling has children', function(){
            let projectModelChangeSpy, siblingNode;
            beforeEach(function(){

                let currentParentId = cuid();
                siblingNode = {_id: cuid(), parentId: currentParentId, ui: {sequence: 0}};
                let currentNode = {_id: cuid(), parentId: currentParentId, ui: {sequence: 1}};
                let siblingChildNode = {_id: cuid(), parentId: siblingNode._id, ui: {sequence: 0}};
                let state = {
                    treeNodesByParentId: {
                        [siblingNode._id]: [siblingChildNode],
                        [currentParentId]: [currentNode, siblingNode]
                    }
                };
                let getStateMock = ()=> state;
                projectModelChangeSpy = spyOn(modelActions, 'projectModelChanges').andReturn(()=>Promise.resolve(undefined));
                treeNodeActions.makeChildOfPreviousSibling(currentNode)(()=>{}, getStateMock);
            });
            it('sets model as new child', function(){
                expect(projectModelChangeSpy).toHaveBeenCalled();
                let changes = projectModelChangeSpy.calls[0].arguments[0];
                expect(changes[0].value).toEqual(siblingNode._id);
                expect(changes[0].propertyPath).toEqual('parentId');
            });
            it('sets model as last in sequence', function(){
                let changes = projectModelChangeSpy.calls[0].arguments[0];
                expect(changes[1].value).toEqual(1);
                expect(changes[1].propertyPath).toEqual('ui.sequence');
            });
        });
        describe('previous sibling has NO children', function(){
            it('sets model as only child', function(){
                let currentParentId = cuid();
                let siblingNode = {_id: cuid(), parentId: currentParentId, ui: {sequence: 0}};
                let currentNode = {_id: cuid(), parentId: currentParentId, ui: {sequence: 1}};
                let state = {
                    treeNodesByParentId: {
                        [currentParentId]: [currentNode, siblingNode]
                    }
                };
                let getStateMock = ()=> state;
                let projectModelChangeSpy = spyOn(modelActions, 'projectModelChanges').andReturn(()=>Promise.resolve(undefined));
                treeNodeActions.makeChildOfPreviousSibling(currentNode)(()=>{}, getStateMock);
                expect(projectModelChangeSpy).toHaveBeenCalled();
                let changes = projectModelChangeSpy.calls[0].arguments[0];
                expect(changes[0].value).toEqual(siblingNode._id);
                expect(changes[0].propertyPath).toEqual('parentId');
                expect(changes[1].value).toEqual(0);
                expect(changes[1].propertyPath).toEqual('ui.sequence');
            });
        });
    });

    describe('setAsNextSiblingOfModel', function(){
        it('calls projectModelChange to change parent of moving model', function(done){
            let siblingParentNode = {_id: cuid()};
            let currentNode = {_id: cuid()};
            let siblingNode = {_id: cuid(), parentId: siblingParentNode._id};
            let state = {
                treeNodesByParentId: {
                    [siblingParentNode._id]: [siblingNode]
                }
            };
            let getStateMock = ()=> state;
            let projectModelChangeSpy = spyOn(modelActions, 'projectModelChanges').andReturn(()=>Promise.resolve(undefined));
            treeNodeActions.setAsNextSiblingOfModel(currentNode._id, siblingNode)(()=>{}, getStateMock).then(()=>{
                expect(projectModelChangeSpy).toHaveBeenCalled();
                let changes = projectModelChangeSpy.calls[0].arguments[0];
                expect(changes[0].value).toEqual(siblingParentNode._id);
                expect(changes[0].propertyPath).toEqual('parentId');
                done();
            }).catch(done);
        });
    });
    describe('makeNextSiblingOfParent', function(){
        describe('model is at root', function(){
            it('does nothing', function(done){
                // Current node is inside root
                let currentParentNode = {_id: cuid()}; // <= root node
                let currentNode = {_id: cuid(), parentId: currentParentNode._id};
                spyOn(modelActions, 'getCachedModel').andReturn(Promise.resolve(undefined));
                let projectModelChangeSpy = spyOn(modelActions, 'projectModelChanges').andReturn(()=>Promise.resolve(undefined));
                treeNodeActions.makeNextSiblingOfParent(currentNode)(()=>{}, ()=>{}).then(()=>{
                    expect(projectModelChangeSpy).toNotHaveBeenCalled();
                    done();
                }).catch(done);
            });
        });
        describe('parent exists', function(){
            it('calls projectModelChange to change parent of moving model', function(done){
                let grandparentId = cuid();
                let currentParentNode = {_id: cuid(), parentId: grandparentId};
                let currentNode = {_id: cuid(), parentId: currentParentNode._id};
                let state = {
                    treeNodesByParentId: {
                        [grandparentId]: [currentParentNode],
                        [currentParentNode._id]: [currentNode]
                    }
                };
                let getStateSpy = ()=> state;
                spyOn(modelActions, 'getCachedModel').andReturn(Promise.resolve(currentParentNode));
                let projectModelChangeSpy = spyOn(modelActions, 'projectModelChanges').andReturn(()=>Promise.resolve(undefined));
                treeNodeActions.makeNextSiblingOfParent(currentNode)(()=>{}, getStateSpy).then(()=>{
                    expect(projectModelChangeSpy).toHaveBeenCalled();
                    let changes = projectModelChangeSpy.calls[0].arguments[0];
                    expect(changes[0].value).toEqual(grandparentId);
                    expect(changes[0].propertyPath).toEqual('parentId');
                    done();
                }).catch(done);
            });
        });
    });
    describe('getPreviousUncollapsedNodeInTree', function(){
        describe('previous sibling exists', function(){
            describe('prevous sibling has children', function(){
                describe('children are expanded', function(){
                    it('returns the last node in previous sibling\'s children', function(done){
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
                        treeNodeActions.getPreviousUncollapsedNodeInTree(currentModel, state, ()=>{}).then(result=>{
                            expect(result).toBe(lastChildModel);
                            done();
                        }).catch(done);
                    });
                });
                describe('children are collapsed', function(){
                    it('returns the previous sibling', function(done){
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
                        treeNodeActions.getPreviousUncollapsedNodeInTree(currentModel, state, ()=>{}).then(result=>{
                            expect(result).toBe(previousModel);
                            done();
                        }).catch(done);
                    });
                });
            });
            describe('previous sibling has no children', function(){
                it('returns the previous sibling', function(done){
                    let parentId = cuid();
                    let currentModel = {_id: cuid(), ui: {sequence: 1}, parentId};
                    let previousModel = {_id: cuid(), ui: {sequence: 0}, parentId};
                    let state = {
                        treeNodesByParentId: {
                            [parentId]: [currentModel, previousModel]
                        }
                    };
                    treeNodeActions.getPreviousUncollapsedNodeInTree(currentModel, state, ()=>{}).then(result=>{
                        expect(result).toBe(previousModel);
                        done();
                    }).catch(done);
                });
            });
        });
        describe('previous sibling does not exist', function(){
            describe('parent exists', function(){
                it('returns parent', function(done){

                    let parentId = cuid();
                    let parentNode = {_id: parentId};
                    let currentModel = {_id: cuid(), ui: {sequence: 1}, parentId};
                    let state = {
                        treeNodesByParentId: {
                            [parentId]: [currentModel]
                        }
                    };
                    spyOn(modelActions, 'getCachedModel').andReturn(Promise.resolve(parentNode));
                    treeNodeActions.getPreviousUncollapsedNodeInTree(currentModel, state, ()=>{}).then(result=>{
                        expect(result).toBe(parentNode);
                        done();
                    }).catch(done);
                });
            });
            describe('NO parent exists', function(){
                it('returns undefined', function(done){
                    let parentId = cuid();
                    let currentModel = {_id: cuid(), ui: {sequence: 1}, parentId};
                    let state = {
                        treeNodesByParentId: {
                            [parentId]: [currentModel]
                        }
                    };
                    spyOn(modelActions, 'getCachedModel').andReturn(Promise.resolve());
                    treeNodeActions.getPreviousUncollapsedNodeInTree(currentModel, state, ()=>{}).then(result=>{
                        expect(result).toBe(undefined);
                        done();
                    }).catch(done);
                });
            });
        });
    });
    describe('getNextUncollapsedNodeInTree', function(){
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
                    let result = treeNodeActions.getNextUncollapsedNodeInTree(currentModel, state);
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
                    let result = treeNodeActions.getNextUncollapsedNodeInTree(currentModel, state);
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
                    let result = treeNodeActions.getNextUncollapsedNodeInTree(currentModel, state);
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
                    let result = treeNodeActions.getNextUncollapsedNodeInTree(currentModel, state);
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
    describe('mergeWithPreviousSibling', function(){
        let projectModelChangeSpy, removeNodeSpy, rootId, node1, node2, node3, getStateSpy, dispatchSpy, state;
        beforeEach(function(){
            let dispatchFunction = createSpy();
            removeNodeSpy = spyOn(modelActions, 'removeNode').andReturn(dispatchFunction);
            projectModelChangeSpy = spyOn(modelActions, 'projectModelChange').andReturn(dispatchFunction);
            rootId = cuid();
            const node1Id = cuid();
            node1 = { _id: node1Id, title: 'node1', ui: { collapsed: true, sequence: 0 } };
            const node2Id = cuid();
            node2 = { _id: node2Id, title: 'node2', ui: { collapsed: true, sequence: 1 } };
            const node3Id = cuid();
            node3 = { _id: node3Id, title: 'node3', ui: {} };
            state = {
                treeNodesByParentId: {
                }
            };
            getStateSpy = createSpy().andReturn(state);
            dispatchSpy = createSpy();
        });
        describe('previous sibling does not exist', function(){
            it('does nothing', function(){
                node1.parentId = rootId;
                state.treeNodesByParentId[rootId] = [node1];
                treeNodeActions.mergeWithPreviousSibling(node1)(dispatchSpy, getStateSpy);
                expect(projectModelChangeSpy).toNotHaveBeenCalled();
            });
        });
        describe('previous sibling exists', function(){
            describe('previous sibling has children', function(){
                it('does nothing', function(){
                    node1.parentId = rootId;
                    node2.parentId = rootId;
                    node3.parentId = node1._id;
                    state.treeNodesByParentId[rootId] = [node1, node2];
                    state.treeNodesByParentId[node1._id] = [node3];
                    treeNodeActions.mergeWithPreviousSibling(node2)(dispatchSpy, getStateSpy);
                    expect(projectModelChangeSpy).toNotHaveBeenCalled();
                });
            });
            describe('previous sibling does not having children', function(){
                describe('merging model does not have children', function(){
                    beforeEach(function(){
                        node1.parentId = rootId;
                        node2.parentId = rootId;
                        state.treeNodesByParentId[rootId] = [node1, node2];
                        treeNodeActions.mergeWithPreviousSibling(node2)(dispatchSpy, getStateSpy);
                    });
                    it('merging model text is merged into previous sibling text', function(){
                        expect(projectModelChangeSpy).toHaveBeenCalled();
                        let args = projectModelChangeSpy.calls[0].arguments;
                        expect(args[0]).toEqual('node1node2');
                        expect(args[1]).toEqual('title');
                        expect(args[2]).toBe(node1);
                    });
                    it('merging model is deleted', function(){
                        expect(removeNodeSpy).toHaveBeenCalledWith(node2);
                    });
                });
                describe('merging model has children', function(){
                    beforeEach(function(){
                        node1.parentId = rootId;
                        node2.parentId = rootId;
                        node3.parentId = node2.parentId;
                        state.treeNodesByParentId[rootId] = [node1, node2];
                        state.treeNodesByParentId[node2._id] = [node3];
                        treeNodeActions.mergeWithPreviousSibling(node2)(dispatchSpy, getStateSpy);
                    });
                    it('merging model text is merged into previous sibling text', function(){
                        expect(projectModelChangeSpy).toHaveBeenCalled();
                        let args = projectModelChangeSpy.calls[0].arguments;
                        expect(args[0]).toEqual('node1node2');
                        expect(args[1]).toEqual('title');
                        expect(args[2]).toBe(node1);
                    });
                    it('merging model children are merged as children of previous sibling', function(){
                        let args = projectModelChangeSpy.calls[1].arguments;
                        expect(args[0]).toEqual(node1._id);
                        expect(args[1]).toEqual('parentId');
                        expect(args[2]).toBe(node3);
                    });
                });
            });
        });
    });
});
