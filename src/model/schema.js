import { appSchema, tableSchema } from '@nozbe/watermelondb';

export default appSchema({
    version: 1,
    tables: [
        tableSchema({
            name: 'item',
            columns: [
                { name: 'title', type: 'string' },
                { name: 'parent_id', type: 'string', isIndexed: true },
                { name: 'item_ui_id', type: 'string' }
            ]
        }),
        tableSchema({
            name: 'item_ui',
            columns: [{ name: 'sequence', type: 'number' }, { name: 'is_collapsed', type: 'boolean' }]
        }),
        tableSchema({
            name: 'project',
            columns: [
                { name: 'title', type: 'string' },
                // { name: 'root_model_id', type: 'string' },
                { name: 'current', type: 'boolean' }
            ]
        })
    ]
});
