export class Contact {
    id: string = '';
    firstName: string = '';
    lastName: string = '';
    status: string = '';
    fullname: string = '';
    avatar: string = '';
    email: string = '';
    phone: string = '';
    selected:boolean = false;

    constructor(fields: any) {
        // Quick and dirty extend/assign fields to this model
        for (const f in fields) {
            // @ts-ignore
            this[f] = fields[f];
        }
    }

}
export interface Contact {
    [prop: string]: any;
}