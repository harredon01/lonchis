/**
 * A generic model that our Master-Detail pages list, create, and delete.
 *
 * Change "Item" to the noun your app will use. For example, a "Contact," or a
 * "Customer," or an "Animal," or something like that.
 *
 * The Items service manages creating instances of Item, so go ahead and rename
 * that something that fits your app as well.
 */
export class Notification {
    id: any;
    notification_id:any;
    user_id: any;
    created_at: any;
    updated_at: any;
    subject: any;
    subject_es: any;
    message: any;
    today:any;
    language:any;
    type: any;
    object:any;
    user_status:any;
    trigger_id:any;
    status:any;
    midnight: any;
    payload: any;
    constructor(fields: any) {
        if (fields.payload) {
            if (typeof fields.payload === 'string' || fields.payload instanceof String) {
                fields.payload = JSON.parse(fields.payload);
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
        if (fields.midnight && fields.created_at) {
            if(fields.created_at > fields.midnnight){
                fields.today = true;
            } else {
                fields.today = false;
            }
        }
        if(fields.language){
            if(fields.language = "es"){
                fields.subject = fields.subject_es;
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

export interface Notification {
    [prop: string]: any;
}
