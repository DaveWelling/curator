import expect from 'expect';
import * as repository from '../../../src/repository/projectConfigRepository';
import cuid from 'cuid';

describe('projectConfigRepository', () => {
    beforeEach((done) => {
        repository.destroy().then(()=>done()).catch(done);
    });
    describe('loadProjectConfig', () => {
        describe('given a project config marked current', () => {
            let _id = cuid();
            beforeEach((done) => {
                repository.insert({
                    _id,
                    title: 'test1',
                    current: true
                }).then(()=>done())
                .catch(done);
            });
            it('should retrieve the current project config', (done) => {
                repository.loadProjectConfig().then(result=>{
                    expect(result[0]._id).toEqual(_id);
                    done();
                }).catch(done);
            });
        });
    });
    describe('update', function(){
        let _id=cuid(), title='oldTitle', newTitle='newTitle';
        describe('given an existing value', function(){
            beforeEach(()=>{
                return repository.insert({
                    _id, title
                });
            });
            it('updates the existing config', function(done){
                repository.update(
                    _id, {
                        title: newTitle
                    }
                ).then(newModel=>{
                    expect(newModel.title).toEqual(newTitle);
                    repository.getById(_id).then(config=>{
                        expect(config.title).toEqual(newTitle);
                        done();
                    });
                }).catch(done);
            });
        });
        describe('no existing value', function(){
            it('creates a new config and returns it', function(done){
                repository.update(
                    _id, {
                        title: newTitle
                    }
                ).then(newModel=>{
                    expect(newModel.title).toEqual(newTitle);
                    repository.getById(_id).then(config=>{
                        expect(config.title).toEqual(newTitle);
                        done();
                    });
                }).catch(done);
            });
        });
    });
});