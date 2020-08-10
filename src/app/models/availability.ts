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
    // Quick and dirty extend/assign fields to this model
    for (const f in fields) {
      // @ts-ignore
      this[f] = fields[f];
    }
  }

}

export interface Address {
  [prop: string]: any;
}
