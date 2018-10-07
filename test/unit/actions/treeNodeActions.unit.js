import expect, {spyOn, createSpy, restoreSpies} from 'expect';
import {toggleCollapse} from '../../../src/actions/treeNodeActions';
import cuid from 'cuid';
import * as modelActions from '../../../src/actions/projectModelActions';

describe('treeNodeActions', () => {
    afterEach(restoreSpies);
    describe('toggleCollapse', function(){
        describe('passed node is collapsed', function(){
            it('requests a projectModelChange with collapsed = false', function(){
                let updateSpy = spyOn(modelActions, 'projectModelChange');
                let treeNode = {
                    _id: cuid(),
                    title: cuid(),
                    ui: {
                        collapsed: true
                    }
                };
                let dispatchSpy = createSpy();
                toggleCollapse(treeNode)(dispatchSpy);
                updateSpy.andCall((value, propertyName, model)=>{
                    expect(value).toBe(false);
                    expect(propertyName).toEqual('ui.collapsed');
                    expect(model).toBe(treeNode);
                });
                expect(updateSpy).toHaveBeenCalled();
            });
        });
    });
});