/**
 * A generic model that our Master-Detail pages list, create, and delete.
 *
 * Change "Item" to the noun your app will use. For example, a "Contact," or a
 * "Customer," or an "Animal," or something like that.
 *
 * The Items service manages creating instances of Item, so go ahead and rename
 * that something that fits your app as well.
 */
export class Order {
    id: any;
    status: string;
    user_id: string;
    subtotal: string;
    shipping: string;
    tax: string;
    total: string;
    payment_id: string;
    recurring_type: any;
    is_editable: any;
    items: any[] = [];
    order_conditions: any[] = [];
    order_addresses: any[] = [];
    attributes: any;
    merchant_id: any;
    created_at: any;
    updated_at: any;
    split: boolean;

    constructor(fields: any) {
        if (fields.attributes) {
            if (typeof fields.attributes === 'string' || fields.attributes instanceof String) {
                fields.attributes = JSON.parse(fields.attributes);
            }
        }
        if (fields.created_at) {
            if (typeof fields.created_at === 'string' || fields.created_at instanceof String) {
                fields.created_at = fields.created_at.replace(/-/g, '/');
                if (fields.created_at.includes("Z")) {
                    fields.created_at = fields.created_at.replace("T", ' ');
                    fields.created_at = fields.created_at.split(".")[0];
                    fields.created_at = new Date(fields.created_at);
                    fields.created_at = new Date(fields.created_at.getTime() - fields.created_at.getTimezoneOffset() * 60000);
                }
            }
        }

        if (fields.updated_at) {
            if (typeof fields.updated_at === 'string' || fields.updated_at instanceof String) {
                fields.updated_at = fields.updated_at.replace(/-/g, '/');
                if (fields.updated_at.includes("Z")) {
                    fields.updated_at = fields.updated_at.replace("T", ' ');
                    fields.updated_at = fields.updated_at.split(".")[0];
                    fields.updated_at = new Date(fields.updated_at);
                    fields.updated_at = new Date(fields.updated_at.getTime() - fields.updated_at.getTimezoneOffset() * 60000);
                }
            }
        }
        fields.split = false;
        if (fields.attributes.split_payment) {
            if (fields.attributes.split_payment == true) {
                fields.split = true;
            }
        }
        // Quick and dirty extend/assign fields to this model
        for (const f in fields) {
            // @ts-ignore
            this[f] = fields[f];
        }
    }

}

export interface Order {
    [prop: string]: any;
}
