import expect, { createSpy } from 'expect';
import React from 'react';
import { mount } from 'enzyme';
import {TreeText} from '../../../src/components/TreeText';

describe('<TreeText/>', function(){
    let props, wrapper, onTitleKeystrokeSpy, onChangeSpy;
    function mountWithDefaults(overrides){
        props = {
            ... {
                _id: '123456789',
                title: 'test123',
                onChange: onChangeSpy,
                onTitleKeystroke: onTitleKeystrokeSpy
            },
            ... overrides
        };
        wrapper = mount(<TreeText {...props}/>);
    }
    it('should render itself', function(){
        mountWithDefaults();
        expect(wrapper.find('div#treeTextTitle123456789').length).toEqual(1);
    });
    describe('cursor is in middle of content', function(){
        let ces;
        beforeEach(function(){
            ces = wrapper.find('ContentEditableShell').instance();
            ces.setSelectionRange(4,4);
        });
        describe('enter key is pressed', function(){
            beforeEach(function(){
                ces.onKeyDown({
                    keyCode: 13,
                    shiftKey: false,
                    preventDefault: ()=>{}
                });
            });
            it('calls onTitleKeystroke', function(){
                expect(onTitleKeystrokeSpy).toHaveBeenCalled();
            });
        });
    });
});