/**
 * A generic model that our Master-Detail pages list, create, and delete.
 *
 * Change "Item" to the noun your app will use. For example, a "Contact," or a
 * "Customer," or an "Animal," or something like that.
 *
 * The Items service manages creating instances of Item, so go ahead and rename
 * that something that fits your app as well.
 */
export class Item {
    name: string;
    image: string;
    description: string;
    amount: any;
    product_id: any;
    variant_id: any;
    attributes:any;
    detailsvisible:boolean = false;
    item_id: any; 

  constructor(fields: any) {
    // Quick and dirty extend/assign fields to this model
    for (const f in fields) {
      // @ts-ignore
      this[f] = fields[f];
    }
  }
  clean(){
        delete this.attributes.users;
        delete this.attributes.item_id;
        delete this.attributes.session_id;
        delete this.attributes.order_id;
        delete this.attributes.payer;
        delete this.attributes.paid;
    }

}

export interface Item {
  [prop: string]: any;
}
