/**
 * A generic model that our Master-Detail pages list, create, and delete.
 *
 * Change "Item" to the noun your app will use. For example, a "Contact," or a
 * "Customer," or an "Animal," or something like that.
 *
 * The Items service manages creating instances of Item, so go ahead and rename
 * that something that fits your app as well.
 */
export class Article {
    id: any;
    name: any;
    description: any;
    type: any;
    body: any;
    status: any;
    pagetitle: any;
    category_id: any;
    metadescription: any;
    slug: any;
    showMore: boolean = false;
    attributes: any;
    start_date: any;
    end_date: any;
    files: any = [];
    constructor(fields: any) {
        if(fields.categorizable_id){
            fields.id = fields.categorizable_id;
        }
        if (fields.start_date) {
            if (typeof fields.start_date === 'string' || fields.start_date instanceof String) {
                if (fields.start_date)
                    if (fields.start_date.includes("0000")) {
                        fields.start_date = new Date();
                    } else {
                        fields.start_date = fields.start_date.replace(/-/g, '/');
                        if (fields.start_date.includes("Z")) {
                            fields.start_date = fields.start_date.replace("T", ' ');
                            fields.start_date = fields.start_date.split(".")[0];
                            fields.start_date = new Date(fields.start_date);
                            fields.start_date = new Date(fields.start_date.getTime() - fields.start_date.getTimezoneOffset() * 60000);
                        }
                    }

            }
        }
        if (fields.end_date) {
            if (typeof fields.end_date === 'string' || fields.end_date instanceof String) {
                if (fields.end_date.includes("0000")) {
                    fields.end_date = new Date();
                } else {
                    fields.end_date = fields.end_date.replace(/-/g, '/');
                    if (fields.end_date.includes("Z")) {
                        fields.end_date = fields.end_date.replace("T", ' ');
                        fields.end_date = fields.end_date.split(".")[0];
                        fields.end_date = new Date(fields.end_date);
                        fields.end_date = new Date(fields.end_date.getTime() - fields.end_date.getTimezoneOffset() * 60000);
                    }
                }
            }
        }

        if (fields.attributes) {
            if (typeof fields.attributes === 'string' || fields.attributes instanceof String) {
                fields.attributes = JSON.parse(fields.attributes);
            }
        } else {
            fields.attributes = []
        }
        // Quick and dirty extend/assign fields to this model
        for (const f in fields) {
            // @ts-ignore
            this[f] = fields[f];
        }
    }
    clean() {
        delete this.options.users;
        delete this.options.item_id;
        delete this.options.session_id;
        delete this.options.order_id;
        delete this.options.payer;
        delete this.options.paid;
    }

}

export interface Article {
    [prop: string]: any;
}
