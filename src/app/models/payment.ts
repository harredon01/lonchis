/**
 * A generic model that our Master-Detail pages list, create, and delete.
 *
 * Change "Item" to the noun your app will use. For example, a "Contact," or a
 * "Customer," or an "Animal," or something like that.
 *
 * The Items service manages creating instances of Item, so go ahead and rename
 * that something that fits your app as well.
 */ 
import {Order} from '../models/order';
export class Payment {
    status: string;
    attributes: any;
    tax: string;
    total: any;
    subtotal: any;
    referenceCode: any;
    transactionId: any;
    responseCode: any;
    extras: any;
    order_id: any;
    id: any;
    address_id: any;
    created_at: any;
    updated_at: any;
    order:Order;

  constructor(fields: any) {
    // Quick and dirty extend/assign fields to this model
    for (const f in fields) {
      // @ts-ignore
      this[f] = fields[f];
    }
  }

}

export interface Payment {
  [prop: string]: any;
}
