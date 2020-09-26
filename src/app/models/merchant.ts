/**
 * A generic model that our Master-Detail pages list, create, and delete.
 *
 * Change "Merchant" to the noun your app will use. For example, a "Contact," or a
 * "Customer," or an "Animal," or something like that.
 *
 * The Merchants service manages creating instances of Merchant, so go ahead and rename
 * that something that fits your app as well.
 */
export class Merchant {
    name: string;
    src: string;
    icon: string;
    description: string;
    amount: any;
    product_id: any;
    unit_cost: any;
    variant_id: any;
    longitude: any;
    latitude: any;
    item_id: any;
    owner: boolean = false;
    availabilities: any[];
    availabilitiesOrder: any[] = [];
    availabilitiesNext: any[] = [];
    attributes: any;
    ratings: any[];
    files: any[];
    Distance: any;
    constructor(fields: any) {
        if (fields.object_id) {
            fields.id = fields.object_id;
        }
        if (fields.merchant_id) {
            fields.id = fields.merchant_id;
        }
        if (fields.categorizable_id) {
            fields.id = fields.categorizable_id;
        }
        if (fields.Distance) {
            if (fields.Distance < 1) {
                let result = fields.Distance * 100;
                result = Math.round(result * 100) / 100;
                fields.Distance = result + " m.";
            } else {
                let result = fields.Distance;
                result = Math.round(result * 100) / 100;
                fields.Distance = result + " km.";
            }
        }
        // Quick and dirty extend/assign fields to this model
        for (const f in fields) {
            // @ts-ignore
            this[f] = fields[f];
        }
        if (!this.attributes) {
            this.attributes = [];
        }
        if (!this.availabilities) {
            this.availabilities = [];
        }
        if (this.availabilities.length > 0) {
            let date2 = new Date();
            let daynum = date2.getDay();
            if (daynum == 0) {
                daynum = 7;
            }

            for (let item in this.availabilities) {
                var str = this.availabilities[item].from;
                let timeval = (date2.getMonth() + 1) + "/" + date2.getDate() + "/" + date2.getFullYear() + " " + str;
                this.availabilities[item].time = Date.parse(timeval);
                if (this.availabilities[item].range == "monday") {
                    this.availabilities[item].order = 1;
                }
                if (this.availabilities[item].range == "tuesday") {
                    this.availabilities[item].order = 2;
                }
                if (this.availabilities[item].range == "wednesday") {
                    this.availabilities[item].order = 3;
                }
                if (this.availabilities[item].range == "thursday") {
                    this.availabilities[item].order = 4;
                }
                if (this.availabilities[item].range == "friday") {
                    this.availabilities[item].order = 5;
                }
                if (this.availabilities[item].range == "saturday") {
                    this.availabilities[item].order = 6;
                }
                if (this.availabilities[item].range == "sunday") {
                    this.availabilities[item].order = 7;
                }
            }
            if (this.availabilities) {
                this.availabilities.sort((a, b) => (a.order > b.order) ? 1 : (a.order === b.order) ? ((a.time > b.time) ? 1 : -1) : -1);
                console.log("Availabilities", this.availabilities);
                let container = {
                    range: "monday",
                    order: 1,
                    items: []
                }
                for (let item in this.availabilities) {
                    if (this.availabilities[item].range == container.range) {
                        container.items.push(this.availabilities[item]);
                    } else {
                        if (container.items.length > 0) {
                            this.availabilitiesOrder.push(container);
                        }
                        container = {
                            range: this.availabilities[item].range,
                            order: this.availabilities[item].order,
                            items: []
                        }
                        container.items.push(this.availabilities[item]);
                    }

                }
                if (container.items.length > 0) {
                    this.availabilitiesOrder.push(container);
                }
                date2 = new Date(date2.getTime() + 70 * 60000);
                let dayFound = false;
                for (let item in this.availabilitiesOrder) {
                    let cont = this.availabilitiesOrder[item];
                    if (cont.order >= daynum) {
                        if (cont.order == daynum) {
                            for (let i in cont.items) {
                                let dayal = cont.items[i];
                                let timeval = (date2.getMonth() + 1) + "/" + date2.getDate() + "/" + date2.getFullYear() + " " + dayal.from;
                                let timedate = Date.parse(timeval);
                                if (timedate > date2.getTime()) {
                                    this.availabilitiesNext.push(dayal);
                                    dayFound = true;
                                    break;
                                }
                            }
                        } else {
                            if (!dayFound) {
                                this.availabilitiesNext.push(cont.items[0]);
                                dayFound = true;
                                break;
                            }
                        }
                    }
                }
                if (!dayFound) {
                    this.availabilitiesNext.push(this.availabilitiesOrder[0].items[0]);
                    dayFound = true;
                }
            }
        }
    }
}

export interface Merchant {
    [prop: string]: any;
}
