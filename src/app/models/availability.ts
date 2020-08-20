/**
 * A generic model that our Master-Detail pages list, create, and delete.
 *
 * Change "Item" to the noun your app will use. For example, a "Contact," or a
 * "Customer," or an "Animal," or something like that.
 *
 * The Items service manages creating instances of Item, so go ahead and rename
 * that something that fits your app as well.
 */
export class Availability {
    id: any;
    name: string;
    city: string;
    address: string;
    notes: string;
    type: string;
    postal: string;
    phone: string;
    lat: any;
    long: any;
    city_id: any;
    cityName: any;
    region_id: any;
    regionName: any;
    country: any;
    range: any;
    order: any;

    constructor(fields: any) {
        fields = this.setOrder(fields);

        if (typeof fields.from === 'string' || fields.from instanceof String) {
            if (fields.from.includes("T")) {

                fields.from = fields.from.replace(/-/g, '/');
                fields.from = fields.from.replace("T", ' ');
                if (fields.from.includes("Z")) {
                    fields.from = fields.from.split(".")[0];
                    fields.from = new Date(fields.from);
                    fields.from = new Date(fields.from.getTime() - fields.from.getTimezoneOffset() * 60000);
                } else {
                    fields.from = new Date(fields.from);
                    fields.from = this.formatAMPM(fields.from);
                }
            }
        }
        if (typeof fields.to === 'string' || fields.to instanceof String) {
            if (fields.to.includes("T")) {
                
                fields.to = fields.to.replace(/-/g, '/');
                fields.to = fields.to.replace("T", ' ');
                if (fields.to.includes("Z")) {
                    fields.to = fields.to.split(".")[0];
                    fields.to = new Date(fields.to);
                    fields.to = new Date(fields.to.getTime() - fields.to.getTimezoneOffset() * 60000);
                } else {
                    fields.to = new Date(fields.to);
                    fields.to = this.formatAMPM(fields.to);
                }
            }
        }
        // Quick and dirty extend/assign fields to this model
        for (const f in fields) {
            // @ts-ignore
            this[f] = fields[f];
        }

    }
    formatAMPM(date:Date) {
        var hours = date.getHours();
        let minutes = date.getMinutes();
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        let Strminutes = minutes < 10 ? '0' + minutes : minutes;
        var strTime = hours + ':' + Strminutes + ' ' + ampm;
        return strTime;
    }
    setOrder(item) {
        if (item.range == 'sunday') {
            item.order = 0;
        }
        if (item.range == 'monday') {
            item.order = 1;
        }
        if (item.range == 'tuesday') {
            item.order = 2;
        }
        if (item.range == 'wednesday') {
            item.order = 3;
        }
        if (item.range == 'thursday') {
            item.order = 4;
        }
        if (item.range == 'friday') {
            item.order = 5;
        }
        if (item.range == 'saturday') {
            item.order = 6;
        }
        return item;
    }

}

export interface Address {
    [prop: string]: any;
}
