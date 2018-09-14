import * as repository from '../../src/repository';
before(()=>{
    repository.init('test', 'memory');
});