import { Model } from '@nozbe/watermelondb';
import { field, relation, text } from '@nozbe/watermelondb/decorators';

export class Item extends Model {
    static table = 'item';

    static get associations() {
        return {
            children: { type: 'has_many', foreignKey: 'parent_id' }
        };
    }

    @relation('item', 'parent_id') parent;

    @relation('item_ui', 'item_ui_id') ui;

    @field('title') title;
}

export class ItemUi extends Model {
    static get table() {
        return 'item_ui';
    }

    @field('sequence') sequence;

    @field('is_collapsed') collapsed;
}

export class Project extends Model {
    static table = 'project'

    @field('title') title;

    @field('current') current;

    @relation('item', 'root_item_id') rootItem;
}
