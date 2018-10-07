import expect from 'expect';
import * as repository from '../../../src/repository/projectModelsRepository';
import cuid from 'cuid';

describe('projectModelsRepository', () => {
    beforeEach((done) => {
        repository.destroy().then(()=>done()).catch(done);
    });
    describe('getChildren', () => {
        describe('given a parent id with children', () => {
            let parentId = 'p1';
            beforeEach((done) => {
                repository.insert({
                    _id: '1',
                    parentId: 'p1'
                }).then(()=>done())
                .catch(done);
            });
            it('should retrieve the children', (done) => {
                repository.getChildren(parentId).then(result=>{
                    expect(result[0]._id).toEqual('1');
                    done();
                }).catch(done);
            });
        });
    });
    describe('getModelsForTitle', () => {
        describe('given a model exists with the requested Title', () => {
            let title = cuid();
            let _id = cuid();
            beforeEach((done) => {
                repository.insert({
                    _id,
                    title
                }).then(()=>done())
                .catch(done);
            });
            it('should retrieve the model', (done) => {
                repository.getModelsForTitle(title).then(result=>{
                    expect(result[0]._id).toEqual(_id);
                    done();
                }).catch(done);
            });
        });
    });
    describe('getById', ()=>{
        describe('given a model exists with the _id', ()=>{
            let title = cuid();
            let _id = cuid();
            beforeEach((done) => {
                repository.insert({
                    _id,
                    title
                }).then(()=>done())
                .catch(done);
            });
            it('should return the model', (done) => {
                repository.getById(_id).then(result=>{
                    expect(result._id).toEqual(_id);
                    done();
                }).catch(done);
            });
        });
    });

    describe('update', function(){
        let _id=cuid(), existingTitle='oldTitle', newTitle='newTitle';
        describe('given an existing value', function(){
            beforeEach(()=>{
                return repository.insert({
                    _id, title: existingTitle
                });
            });
            it('updates the existing model', function(done){
                repository.update(
                    _id, [{
                        propertyPath: 'title',
                        value: newTitle
                    }]
                ).then(result=>{
                    const {newModel} = result;
                    expect(newModel.title).toEqual(newTitle);
                    repository.getById(_id).then(config=>{
                        expect(config.title).toEqual(newTitle);
                        done();
                    });
                }).catch(done);
            });
            it('returns the existing value with the result', function(done){
                repository.update(
                    _id, [{
                        propertyPath: 'title',
                        value: newTitle
                    }]
                ).then(result=>{
                    const {newModel, oldModel} = result;
                    expect(newModel.title).toEqual(newTitle);
                    expect(oldModel.title).toEqual(existingTitle);
                    repository.getById(_id).then(config=>{
                        expect(config.title).toEqual(newTitle);
                        done();
                    });
                }).catch(done);
            });
            describe('update contains a nesting propertyPath', function(){
                it('updates the nested value', function(done){
                    repository.update(
                        _id, [{
                            propertyPath: 'ui.collapsed',
                            value: true
                        }]
                    ).then(result=>{
                        const {newModel} = result;
                        expect(newModel.ui.collapsed).toBe(true);
                        repository.getById(_id).then(config=>{
                            expect(config.ui.collapsed).toBe(true);
                            done();
                        });
                    }).catch(done);
                });
            });
        });
        describe('no existing value', function(){
            it('rejects with a not found error', function(done){
                repository.update(
                    _id, [{
                        propertyPath: 'title',
                        value: newTitle
                    }]
                ).then(()=>{
                    done('Expected an error');
                }).catch(err=>{
                    expect(err.message).toEqual('An existing document was not found to update.');
                    done();
                });
            });
        });
    });
});