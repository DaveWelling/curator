import expect, { createSpy, spyOn, restoreSpies } from 'expect';
import React from 'react';
import { mount } from 'enzyme';
import TreeText from '../../../src/components/TreeText';
import * as projectModelActions from '../../../src/actions/projectModelActions';
import * as focusActions from '../../../src/actions/focusActions';
import { Provider } from 'react-redux';

describe('<TreeText/>', function(){
    let props, wrapper, onTitleKeystrokeSpy, onChangeSpy, projectModelChangeSpy, createNextSiblingOfModelSpy, dispatchSpy;
    function mountWithDefaults(overrides){
        props = {
            ... {
                model: {
                    _id: '123456789',
                    title: 'test123'
                }
            },
            ... overrides
        };
        const store = {
            dispatch: dispatchSpy,
            getState: () => ({}),
            subscribe: () => {}
        };
        wrapper = mount(<Provider store={store}><TreeText {...props}/></Provider>);
    }
    beforeEach(function(){
        onTitleKeystrokeSpy = createSpy();
        onChangeSpy = createSpy();
        dispatchSpy = createSpy().andCall(func=>func());
        spyOn(focusActions, 'focusOnTreeNode').andReturn(()=>{});
        projectModelChangeSpy = spyOn(projectModelActions, 'projectModelChange').andReturn(()=>{});
        createNextSiblingOfModelSpy = spyOn(projectModelActions, 'createNextSiblingOfModel').andReturn(()=>{});
    });
    afterEach(function(){
        restoreSpies();
    });
    it('should render itself', function(){
        mountWithDefaults();
        expect(wrapper.find('div#treeTextTitle123456789').length).toEqual(1);
    });
    describe('cursor is in middle of content', function(){
        let ces;
        beforeEach(function(){
            mountWithDefaults();
            ces = wrapper.find('ContentEditableShell').instance();
            ces.setSelectionRange(4,4);
        });
        describe('enter key is pressed', function(){
            beforeEach(function(){
                ces.value = 'test123';
                ces.onKeyDown({
                    keyCode: 13,
                    shiftKey: false,
                    preventDefault: ()=>{},
                    persist: ()=>{}
                });
            });
            it('calls onTitleKeystroke', function(){
                let modelChangeArgs = projectModelChangeSpy.calls[0].arguments;
                expect(modelChangeArgs[0]).toEqual('test');
                let newSiblingArgs = createNextSiblingOfModelSpy.calls[0].arguments;
                expect(newSiblingArgs[1].title).toEqual('123');
            });
        });
    });
});