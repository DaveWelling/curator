import expect, {spyOn, restoreSpies} from 'expect';
import * as repository from '../../../src/repository/projectModelsRepository';
import {makeGetChildrenModels} from '../../../src/selectors/projectModelSelectors';
import * as eventSink from '../../../src/store/eventSink';

describe('selectors', () => {
    afterEach(()=>{
        restoreSpies();
    });
    describe('makeGetChildrenModels', () => {
        describe('given a valid parent', () => {
            let repositorySpy, target;
            let state = {};
            let props = {model:{treeNode:{_id: '1'}}};
            beforeEach(()=>{
                repositorySpy = spyOn(repository, 'getChildren').andReturn([{
                    _id: '2', title: 'child2'
                }]);
                target = makeGetChildrenModels();
            });
            it('should retrieve the children models', function () {
                let result = target(state, props);
                expect(result[0]._id).toEqual('2');
            });
            describe('when called more than once with the same props', () => {
                it('should not call the repository more than once', function () {
                    target(state, props);
                    target(state, props);
                    expect(repositorySpy.calls.length).toEqual(1);
                });
            });
            describe('given the child change reference is different between calls', () => {
                it('should cause memoization to reset', function () {
                    target(state, props);
                    eventSink.publish({
                        type:'update_project_model_success',
                        update: {
                            newModel: {
                                parentId: '1'
                            },
                            oldModel: {
                                parentId: '4'
                            }
                        }
                    });
                    target(state, props);
                    expect(repositorySpy.calls.length).toEqual(2);
                });
            });
        });
    });
});