/**
 * A generic model that our Master-Detail pages list, create, and delete.
 *
 */
export class MarkerData {

  constructor(fields: any) {
    // Quick and dirty extend/assign fields to this model
    for (const f in fields) {
      // @ts-ignore
      this[f] = fields[f];
    }
  }

}

export interface MarkerData {
  [prop: string]: any;
}
