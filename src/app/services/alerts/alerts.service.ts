import { Injectable } from '@angular/core';
import {ApiService} from '../api/api.service';
import {DatabaseService} from '../database/database.service';
import {Storage} from '@ionic/storage';
@Injectable({
  providedIn: 'root'
})
export class AlertsService {

    constructor(private api: ApiService, private database: DatabaseService,private storage:Storage) { }
  deleteMessage(id: any) {
        return new Promise((resolve, reject) => {
            let query = "DELETE FROM messages where id = ?";
            let params = [id];
            this.database.executeSql(query, params)
                .then((res: any) => {
                    console.log("messages deleted");
                    resolve("messages deleted")
                }, (err) => {console.error(err); reject("message not deleted")});
        });
    }
    getLanguage(): Promise<string> {
        return this.storage.get('language').then((value) => {
            return value;
        });
    }
    setLanguage(lang) {
        this.storage.set('language', lang);
    }
    getAlerts(where) {
        let url = "/alerts";
        if (where) {
            url = url + "?" + where;
        }
        let seq = this.api.get(url);
        return seq;
    }
    countUnread() {
        let url = "/alerts/count_unread";
        let seq = this.api.get(url);
        return seq;
    }
    readAll() {
        let url = "/alerts/read_all";
        let seq = this.api.get(url);
        return seq;
    }
}
