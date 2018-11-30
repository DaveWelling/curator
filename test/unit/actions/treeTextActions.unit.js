import expect, {spyOn, restoreSpies, createSpy} from 'expect';
import * as treeTextActions from '../../../src/actions/treeTextActions';
import cuid from 'cuid';
import * as projectModelActions from '../../../src/actions/projectModelActions';

describe('keyCode', function(){
    let _id, createNextSiblingOfModelSpy, projectModelChangeSpy, input, dispatchSpy, preventDefaultSpy;
    beforeEach(function(){
        input = {};
        dispatchSpy = createSpy();
        preventDefaultSpy = createSpy();
        _id = cuid();
    });
    afterEach(function(){
        restoreSpies();
    });
    describe('Enter', function(){
        beforeEach(function(){
            createNextSiblingOfModelSpy = spyOn(projectModelActions, 'createNextSiblingOfModel');
            projectModelChangeSpy = spyOn(projectModelActions, 'projectModelChange');
        });
        describe('cursor is at the end of current input', function(){
            beforeEach(function(){
                input.selectionStart = 3;
                input.selectionEnd = 3;
                input.value = 'dog';
            });
            it('calls makeNextSiblingOfModel with empty title', function(){
                projectModelChangeSpy.andReturn(()=>{});
                createNextSiblingOfModelSpy.andCall((modelId, nextSiblingModel)=>{
                    return ()=>{
                        expect(modelId).toEqual(_id);
                        expect(nextSiblingModel.title).toEqual('');
                    };
                });
                treeTextActions.keyDown(13, preventDefaultSpy, input, {_id})(dispatchSpy);
                expect(createNextSiblingOfModelSpy).toHaveBeenCalled();
            });
        });
        describe('cursor is inside title', function(){
            beforeEach(function(){
                input.selectionStart = 4;
                input.selectionEnd = 4;
                input.value = 'dog bones';
            });
            it('calls makeNextSiblingOfModel with remainder of title', function(){
                projectModelChangeSpy.andReturn(()=>{});
                createNextSiblingOfModelSpy.andCall((modelId, nextSiblingModel)=>{
                    return ()=>{
                        expect(modelId).toEqual(_id);
                        expect(nextSiblingModel.title).toEqual('bones');
                    };
                });
                treeTextActions.keyDown(13, preventDefaultSpy, input, {_id})(dispatchSpy);
                expect(createNextSiblingOfModelSpy).toHaveBeenCalled();
            });
            it('calls projectModelChange on existing model with first part of title', function(){
                createNextSiblingOfModelSpy.andReturn(()=>{});
                projectModelChangeSpy.andCall((newModelValue, propertyName, model)=>{
                    return ()=>{
                        expect(model._id).toEqual(_id);
                        expect(newModelValue).toEqual('dog');
                        expect(propertyName).toEqual('title');
                    };
                });
                treeTextActions.keyDown(13, preventDefaultSpy, input, {_id})(dispatchSpy);
                expect(projectModelChangeSpy).toHaveBeenCalled();
            });
        });
    });
});