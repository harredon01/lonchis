export class Friend {
    id: string = '';
    username: string = '';
    fullname: string = '';
    avatar: string = '';
    email: string = '';

    constructor(fields: any) {
        // Quick and dirty extend/assign fields to this model
        for (const f in fields) {
            // @ts-ignore
            this[f] = fields[f];
        }
    }

}
export interface Friend {
    [prop: string]: any;
}