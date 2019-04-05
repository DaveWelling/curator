import expect, { spyOn, createSpy, restoreSpies } from 'expect';
import { Database } from '@nozbe/watermelondb';
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs';

import schema from '../../../src/model/schema';
import { Item, ItemUi, Project } from '../../../src/model/Item';
import { newLoadProjectConfig } from '../../../src/actions/projectConfigActions';

const adapter = new LokiJSAdapter({
    dbName: 'Test',
    schema
});

// Then, make a Watermelon database from it!
const database = new Database({
    adapter,
    modelClasses: [Item, ItemUi, Project],
    actionsEnabled: true
});

const testDb = new Database({
    adapter: database.adapter.testClone(),
    schema,
    modelClasses: [Item, ItemUi, Project],
    actionsEnabled: true
});

describe.only('newLoadProjectConfig', function() {
    beforeEach(function(){
        return testDb.action(async () => database.collections.get('project').create(project => {
            project.title = 'test1';
        }));
    });
    it('gets an existing project', async function() {
        const project = await newLoadProjectConfig(testDb);
        expect(project.title).toEqual('test1');
    });
});