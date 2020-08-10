import {Injectable} from '@angular/core';
import {ApiService} from '../api/api.service';
import * as OT from '@opentok/client';
@Injectable({
    providedIn: 'root'
})
export class OpentokService {

    session: OT.Session;
    token: string;
    apiKey: string;

    constructor() {}

    getOT() {
        return OT;
    }

    initSession(token:string,sessionId:string) {
        this.session = this.getOT().initSession(this.apiKey, sessionId);
        this.token = token;
        return Promise.resolve(this.session);
    }

    connect(token:string) {
        return new Promise((resolve, reject) => {
            this.session.connect(token, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.session);
                }
            });
        });
    }
}