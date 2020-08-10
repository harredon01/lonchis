export class Message {

    id: any;
    status: string;
    from: string = '';
    to: string = '';
    from_id: string = '';
    to_id: string = '';
    content: string = '';
    time: Date;

    constructor(fields: any) {
        // Quick and dirty extend/assign fields to this model
        for (const f in fields) {
            // @ts-ignore
            this[f] = fields[f];
        }
    }

}

export interface Message {
    [prop: string]: any;
}