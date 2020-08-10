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
    total:string;
    payment_id:string;
    recurring_type:any;
    is_editable:any;
    items:any[]=[];
    order_conditions:any[]=[];
    order_addresses:any[]=[];
    attributes:any;
    merchant_id:any;
    created_at:any;
    updated_at:any;
    split:boolean;

  constructor(fields: any) {
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
