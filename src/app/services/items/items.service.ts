import {Injectable} from '@angular/core';
import {ApiService} from '../api/api.service';
@Injectable({
    providedIn: 'root'
})
export class ItemsService {

    constructor(public api: ApiService) {}

    getItems(where) {
        let url = "/items";
        if (where) {
            url = url + "?" + where;
        }
        let seq = this.api.get(url);
        return seq;
    }
    
    updateItemStatus(data) {
        let url = "/items/status";
        let seq = this.api.post(url,data);
        return seq;
    }
}
