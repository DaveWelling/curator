import expect from 'expect';
import * as repository from '../../../src/repository/projectModelsRepository';
import cuid from 'cuid';

describe('projectModelsRepository', () => {
    beforeEach(done => {
        repository
            .destroy()
            .then(() => done())
            .catch(done);
    });
    describe('getChildren', () => {
        describe('given a parent id with children', () => {
            let parentId = 'p1';
            beforeEach(done => {
                repository
                    .insert({
                        _id: '1',
                        parentId: 'p1'
                    })
                    .then(() => done())
                    .catch(done);
            });
            it('should retrieve the children', done => {
                repository
                    .getChildren(parentId)
                    .then(result => {
                        expect(result[0]._id).toEqual('1');
                        done();
                    })
                    .catch(done);
            });
        });
    });
    describe('getModelsForTitle', () => {
        describe('given a model exists with the requested Title', () => {
            let title = cuid();
            let _id = cuid();
            beforeEach(done => {
                repository
                    .insert({
                        _id,
                        title
                    })
                    .then(() => done())
                    .catch(done);
            });
            it('should retrieve the model', done => {
                repository
                    .getModelsForTitle(title)
                    .then(result => {
                        expect(result[0]._id).toEqual(_id);
                        done();
                    })
                    .catch(done);
            });
        });
    });
    describe('getById', () => {
        describe('given a model exists with the _id', () => {
            let title = cuid();
            let _id = cuid();
            beforeEach(done => {
                repository
                    .insert({
                        _id,
                        title
                    })
                    .then(() => done())
                    .catch(done);
            });
            it('should return the model', done => {
                repository
                    .getById(_id)
                    .then(result => {
                        expect(result._id).toEqual(_id);
                        done();
                    })
                    .catch(done);
            });
        });
    });

    describe('update', function() {
        let _id, existingTitle = 'oldTitle', newTitle = 'newTitle';
        beforeEach(function(){
            _id = cuid();
        });
        describe('given an existing value', function() {
            beforeEach(() => {
                return repository.insert({
                    _id,
                    title: existingTitle
                });
            });
            it('updates the existing model', function(done) {
                repository
                    .update(_id, [
                        {
                            propertyPath: 'title',
                            value: newTitle
                        }
                    ])
                    .then(result => {
                        const { newModel } = result;
                        expect(newModel.title).toEqual(newTitle);
                        repository.getById(_id).then(config => {
                            expect(config.title).toEqual(newTitle);
                            done();
                        });
                    })
                    .catch(done);
            });
            describe('if two updates occur back to back', function(){
                it('the first will be ignored', function(done){
                    let promises = [];
                    let secondNewTitle = 'secondNewTitle';

                    promises.push(
                        repository.update(_id, [
                        {
                            propertyPath: 'title',
                            value: newTitle
                        }
                    ]));
                    promises.push(
                        repository.update(_id, [
                        {
                            propertyPath: 'title',
                            value: secondNewTitle
                        }
                    ]));

                    Promise.all(promises)
                    .then(result => {
                        const newModel0 = result[0].newModel;
                        expect(newModel0.title).toEqual(secondNewTitle);
                        const newModel1 = result[1].newModel;
                        expect(newModel1.title).toEqual(secondNewTitle);
                        repository.getById(_id).then(resultModel => {
                            expect(resultModel.title).toEqual(secondNewTitle);
                            expect(resultModel._rev).toContain('2-');
                            done();
                        });
                    })
                    .catch(done);
                });
                it('will send the accumulated params for the changes', function(done){
                    let promises = [];
                    let blahValue = 'blah';

                    promises.push(
                        repository.update(_id, [
                        {
                            propertyPath: 'title',
                            value: newTitle
                        }
                    ]));
                    promises.push(
                        repository.update(_id, [
                        {
                            propertyPath: 'blah',
                            value: blahValue
                        }
                    ]));

                    Promise.all(promises)
                    .then(result => {
                        const newModel0 = result[0].newModel;
                        expect(newModel0.title).toEqual(newTitle);
                        expect(newModel0.blah).toEqual(blahValue);
                        const newModel1 = result[1].newModel;
                        expect(newModel1.title).toEqual(newTitle);
                        expect(newModel1.blah).toEqual(blahValue);
                        repository.getById(_id).then(resultModel => {
                            expect(resultModel.title).toEqual(newTitle);
                            expect(resultModel.blah).toEqual(blahValue);
                            expect(resultModel._rev).toContain('2-');
                            done();
                        });
                    })
                    .catch(done);
                });
            });
            it('returns the existing value with the result', function(done) {
                repository
                    .update(_id, [
                        {
                            propertyPath: 'title',
                            value: newTitle
                        }
                    ])
                    .then(result => {
                        const { newModel, oldModel } = result;
                        expect(newModel.title).toEqual(newTitle);
                        expect(oldModel.title).toEqual(existingTitle);
                        repository.getById(_id).then(config => {
                            expect(config.title).toEqual(newTitle);
                            done();
                        });
                    })
                    .catch(done);
            });
            describe('update contains a nesting propertyPath', function() {
                it('updates the nested value', function(done) {
                    repository
                        .update(_id, [
                            {
                                propertyPath: 'ui.collapsed',
                                value: true
                            }
                        ])
                        .then(result => {
                            const { newModel } = result;
                            expect(newModel.ui.collapsed).toBe(true);
                            repository.getById(_id).then(config => {
                                expect(config.ui.collapsed).toBe(true);
                                done();
                            });
                        })
                        .catch(done);
                });
            });
        });
        describe('no existing value', function() {
            it('rejects with a not found error', function(done) {
                repository
                    .update(_id, [
                        {
                            propertyPath: 'title',
                            value: newTitle
                        }
                    ])
                    .then(() => {
                        done('Expected an error');
                    })
                    .catch(err => {
                        expect(err.message).toEqual('An existing document was not found to update.');
                        done();
                    });
            });
        });
    });

    describe('debounceById', function() {
        beforeEach(function(){
            repository.clearDebounceCache();
        });
        it('calls the passed function', function(done) {
            repository.debounceById(() => {
                done();
                return Promise.resolve([]);
            });
        });
        describe('called twice within debounce wait time', function() {
            describe('passed function is the same', function() {
                it('calls the passed function once', function(done) {
                    let count = 0;
                    let testFunction = () => {
                        count++;
                        return Promise.resolve([]);
                    };
                    Promise.all([
                        repository.debounceById(testFunction, null, 100),
                        repository.debounceById(testFunction, null, 100)
                    ]).then(() => {
                        expect(count).toEqual(1);
                        done();
                    }).catch(done);
                });
                describe('id function returns the same id', function(){
                    it('calls the passed function twice', function(done) {
                        let count = 0;
                        let testFunction = () => {
                            count++;
                            return Promise.resolve([]);
                        };
                        let idFunction = (args)=>{
                            return args._id;
                        };
                        Promise.all([
                            repository.debounceById(testFunction, idFunction, 100, {_id: 1}),
                            repository.debounceById(testFunction, idFunction, 100, {_id: 1})
                        ]).then(() => {
                            expect(count).toEqual(1);
                            done();
                        }).catch(done);
                    });
                });
                describe('id function returns a different id', function(){
                    it('calls the passed function twice', function(done) {
                        let count = 0;
                        let testFunction = () => {
                            count++;
                            return Promise.resolve([]);
                        };
                        let idFunction = (args)=>{
                            return args._id;
                        };
                        Promise.all([
                            repository.debounceById(testFunction, idFunction, 100, {_id: 1}),
                            repository.debounceById(testFunction, idFunction, 100, {_id: 2})
                        ]).then(() => {
                            expect(count).toEqual(2);
                            done();
                        }).catch(done);
                    });
                });
            });
            describe('passed function is different', function() {
                it('calls each function once', function(done) {
                    let count1 = 0;
                    let testFunction1 = () => {
                        count1++;
                        return Promise.resolve([]);
                    };
                    let count2 = 0;
                    let testFunction2 = () => {
                        count2++;
                        return Promise.resolve([]);
                    };
                    Promise.all([
                        repository.debounceById(testFunction1, null, 100),
                        repository.debounceById(testFunction2, null, 100)
                    ]).then(() => {
                        expect(count1).toEqual(1);
                        expect(count2).toEqual(1);
                        done();
                    }).catch(done);
                });
            });
        });
    });
});
