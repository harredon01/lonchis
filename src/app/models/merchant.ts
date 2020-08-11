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
    icon:string;
    description: string;
    amount: any;
    product_id: any;
    variant_id: any;
    longitude: any;
    latitude: any;
    item_id: any;
    owner: boolean = false;
    availabilities: any[];
    availabilitiesOrder: any[]=[];
    attributes: any;
    ratings: any[];
    files: any[];

    constructor(fields: any) {
        // Quick and dirty extend/assign fields to this model
        for (const f in fields) {
            // @ts-ignore
            this[f] = fields[f];
        }
        let date2 = new Date();
        for (let item in this.availabilities) {
            var str = this.availabilities[item].from; 
            let timeval = (date2.getMonth() + 1) + "/" + date2.getDate() + "/" + date2.getFullYear()+" "+str;
            this.availabilities[item].time = Date.parse(timeval );
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
                range:"monday",
                items:[]
            }
            for (let item in this.availabilities) {
                if (this.availabilities[item].range == container.range) {
                    container.items.push(this.availabilities[item]);
                } else {
                    if(container.items.length > 0 ){
                        this.availabilitiesOrder.push(container);
                    }
                    container = {
                range:this.availabilities[item].range,
                items:[]
            }
            container.items.push(this.availabilities[item]);
                }
                
            }
            if(container.items.length > 0 ){
                        this.availabilitiesOrder.push(container);
                    }
        }
    }
}

export interface Merchant {
    [prop: string]: any;
}