import expect, { spyOn, createSpy, restoreSpies } from 'expect';
import { Database } from '@nozbe/watermelondb';
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs';
//import 'jsdom-worker';

import schema from '../../../src/model/schema';
import { Item, ItemUi, Project } from '../../../src/model/Item';
import { newLoadProjectConfig } from '../../../src/actions/projectConfigActions';

describe.only('newLoadProjectConfig', function() {
    let adapter, database, testDb;
    beforeEach(function() {
        adapter = new LokiJSAdapter({
            dbName: 'Test',
            schema
        });

        // Then, make a Watermelon database from it!
        database = new Database({
            adapter,
            modelClasses: [Item, ItemUi, Project],
            actionsEnabled: true
        });

        debugger;
        testDb = new Database({
            adapter: database.adapter.testClone(),
            schema,
            modelClasses: [Item, ItemUi, Project],
            actionsEnabled: true
        });
        return testDb.action(async () => testDb.collections.get('project').create(project => {
            project.title = 'test1';
        }));
    });
    it('gets an existing project', async function() {
        debugger;
        const project = await newLoadProjectConfig(testDb);
        expect(project.title).toEqual('test1');
    });
});