export class Group {
    id: string = '';
    firstName: string = '';
    lastName: string = '';
    status: string = '';
    fullname: string = '';
    avatar: string = '';
    email: string = '';
    phone: string = '';

    constructor(fields: any) {
        // Quick and dirty extend/assign fields to this model
        for (const f in fields) {
            // @ts-ignore
            this[f] = fields[f];
        }
    }

}
export interface Group {
    [prop: string]: any;
}