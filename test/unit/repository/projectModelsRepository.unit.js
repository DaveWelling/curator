import expect from 'expect';
import * as repository from '../../../src/repository/projectModelsRepository';
import cuid from 'cuid';

describe('projectModelsRepository', () => {
    afterEach((done) => {
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
});