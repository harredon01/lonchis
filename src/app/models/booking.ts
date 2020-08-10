/**
 * A generic model that our Master-Detail pages list, create, and delete.
 *
 * Change "Item" to the noun your app will use. For example, a "Contact," or a
 * "Customer," or an "Animal," or something like that.
 *
 * The Items service manages creating instances of Item, so go ahead and rename
 * that something that fits your app as well.
 */
export class Booking {
    id: any;
    starts_at: any;
    ends_at: any;
    price: any;
    quantity: any;
    bookable_id: any;
    client_id: any;
    position: any;
    total_paid: any;
    options: any;
    notes: any;
    customer: any;
    bookable: any;
    constructor(fields: any) {
        if (fields.starts_at) {
            if (typeof fields.starts_at === 'string' || fields.starts_at instanceof String) {
                fields.starts_at = fields.starts_at.replace(/-/g, '/');
                fields.starts_at = new Date(fields.starts_at);
            }
        }
        
        if (fields.ends_at) {
            if (typeof fields.ends_at === 'string' || fields.ends_at instanceof String) {
                fields.ends_at = fields.ends_at.replace(/-/g, '/');
                fields.ends_at = new Date(fields.ends_at);
            }
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

export interface Booking {
    [prop: string]: any;
}
