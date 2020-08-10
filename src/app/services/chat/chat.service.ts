import { Injectable } from '@angular/core';
import {ApiService} from '../api/api.service';
import {Storage} from '@ionic/storage';
import {DatabaseService} from '../database/database.service';
import {UserDataService} from '../user-data/user-data.service';
@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(private api: ApiService, private database: DatabaseService, private storage: Storage, private userData: UserDataService) {}

    sendMessage(message: any) {
        let url = "/messages/send";
        let seq = this.api.post(url, message);
        seq.subscribe((data: any) => {
            console.log("Reply send message");
            console.log(JSON.stringify(data));
            let result = data.result;
            if (result) {
                message.id = result.id;
                if (result.target_id) {
                    message.target_id = result.target_id;
                } else {
                    message.target_id = null;
                }
            } else {
                message.target_id = null;
            }
            this.saveMessage(message);
            return message;

            // If the API returned a successful response, mark the user as logged in
        }, err => {
            console.error('ERROR', err);
            this.api.handleError(err);
        });
        return seq;

    }

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
    getServerChats() {
        let url = "/messages/received";
        let seq = this.api.get(url);
        return seq;
    }
    getServerChatDetail(where?: any) {
        let url = "/messages/chat"; 
        if (where) {
            url = url + "?" + where;
        }
        let seq = this.api.get(url);
        return seq;
    }
    getSupportAgent(typeAgent,objectId) {
        let url = "/messages/support/" + typeAgent + "/" + objectId;
        let seq = this.api.get(url);
        return seq;
    }
    saveMessage(message: any) {
        let query = "SELECT * FROM messages where id = ? ";
        let params = [message.id];
        if (message.message) {
        } else {
            message.message = message.msg;
        }
        return null;
//        this.database.executeSql(query, params)
//            .then((res: any) => {
//                if (res.length == 0) {
//                    let query = "INSERT INTO messages (id, type, name,  message, from_id, to_id,target_id, status, created_at ) VALUES (?,?,?,?,?,?,?,?,?)";
//                    let params = [message.id, message.type, message.name, message.message, message.from_id, message.to_id, message.target_id, message.status, message.created_at];
//                    this.database.executeSql(query, params)
//                        .then((res: any) => {
//                            console.log("Location saved");
//                        }, (err) => console.error(err));
//
//                }
//
//            }, (err) => console.error(err));
    }
    getChats(trigger: any, typeMarker: any, page: any, per_page: any, target: any) {
        return new Promise((resolve, reject) => {
            let offset = (page - 1) * per_page;
            console.log("user", this.userData);
            let user_id = this.userData._user.id;
            console.log("user", user_id);
            let query = "";
            let params = [];
            console.log("TypeMarker", typeMarker);
            console.log("chats sql: " + trigger + " " + typeMarker + " " + user_id);
            if (typeMarker == "user_message") {
                query = "SELECT * FROM messages where type = 'user_message' and ( (from_id = ? and to_id = ?) or  (from_id = ? and to_id = ?)) order by id desc ";
                query += " limit " + offset + ", " + per_page;
                params = [trigger, user_id, user_id, trigger];
                console.log(query);
            } else if (typeMarker == "group_message") {
                query = "SELECT * FROM messages where type = 'group_message' and  to_id = ? order by id desc ";
                query += " limit " + offset + ", " + per_page;
                params = [trigger];
                console.log(query);
            } else if (typeMarker == "group_private_message") {
                query = "SELECT * FROM messages where type = 'group_message' and  to_id = ? and (target_id = ? OR target_id IN (select contact_id from group_contact where is_admin = 1 and group_id = ?)) order by id desc ";
                query += " limit " + offset + ", " + per_page;
                params = [trigger, target, trigger];
                console.log(query);
                console.log(trigger);
                console.log(target);
            } else {
                resolve([]);
            }
            console.log("Query", query);
            console.log("Params", params);
            this.database.executeSql(query, params)
                .then((res: any) => {
                    let messages = res;
                    console.log("Res", res);
                    console.log("after sql get chat " + typeMarker + " messages results in database" + res.length);
                    resolve(messages);
                }, (err) => console.error(err));
        });

    }
    getActiveChats(page, per_page) {
        return new Promise((resolve, reject) => {
            let offset = (page - 1) * per_page;
            let user_id = this.userData._user.id;
            let query = "";
            query = "SELECT * FROM messages where to_id = ? group by from_id ";
            query += " limit " + offset + ", " + per_page;
            this.database.executeSql(query, [user_id])
                .then((res: any) => {
                    let messages = res;
                    console.log("after sql get Active chats");
                    resolve(messages);
                }, (err) => console.error(err));
        });

    }
    countChats(trigger: any, typeMarker: any, target: any) {
        return new Promise((resolve, reject) => {
            let query = "";
            let params = [];
            let user_id = this.userData._user.id;
            if (typeMarker == "user_message") {
                query = "SELECT COUNT(id) as total FROM messages where type = 'user_message' and ( (from_id = ? and to_id = ?) or  (from_id = ? and to_id = ?))";
                console.log(query);
                params = [trigger, user_id, user_id, trigger];
            } else if (typeMarker == "group_message") {
                query = "SELECT COUNT(id) as total FROM messages where type = 'group_message' and  to_id = ? ";
                console.log(query);
                params = [trigger];
            } else if (typeMarker == "group_private_message") {
                query = "SELECT COUNT(id) as total FROM messages where type = 'group_message' and  to_id = ? and (target_id = ? OR target_id IN (select contact_id from group_contact where is_admin = 1 and group_id = ?))";
                console.log(query);
                params = [trigger, target];
            }
            this.database.executeSql(query, params)
                .then((res: any) => {
                    console.log("after sql get chat messages: results in database" + res[0].total);
                    if (res[0].total > 0) {
                        resolve(res[0].total);
                    } else {
                        resolve(0);
                    }
                }, (err) => console.error(err));
        });

    }


    getLastLocationId(): Promise<string> {
        return this.storage.get('lastLocationId').then((value) => {
            return value;
        });
    }
    /**
     * Saves username in local storage.
     */
    setLastLocationId(locationId: string): Promise<any> {
        return this.storage.set('lastLocationId', locationId);
    }
}
