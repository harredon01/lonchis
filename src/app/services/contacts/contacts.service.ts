import {Injectable} from '@angular/core';
import {ApiService} from '../api/api.service';
@Injectable({
    providedIn: 'root'
})
export class ContactsService {

  constructor(public api: ApiService) {}
    getContacts(where: any) {
        let url = "/contacts";

        if (where) {
            url = url + "?" + where;
        }
        let seq = this.api.get(url);
        return seq;
    }
    deleteContact(contactId: any) {
        let endpoint = '/contacts/'+contactId;
        let seq = this.api.delete(endpoint );
        return seq;
    }
    getContact(contactId: any) {
        let endpoint = '/user/'+contactId;
        let seq = this.api.get(endpoint );
        return seq;
    }
    checkContacts(data: any) {
        let endpoint = '/contacts/check';
        let seq = this.api.post(endpoint, data);
        return seq;
    }
    importContacts(data: any) {
        let endpoint = '/contacts';
        let seq = this.api.post(endpoint, data);
        return seq;
    }
    updateContactsLevel(data: any) {
        let endpoint = '/contacts/level';
        let seq = this.api.post(endpoint, data);
        return seq;
    }
    getByCode(code: any) {
        let endpoint = '/contacts/code/'+code ;
        let seq = this.api.get(endpoint);
        return seq;
    }
    getByEmail(email: any) {
        let endpoint = '/contacts/email/'+email ;
        let seq = this.api.get(endpoint);
        return seq;
    }
    updateBlockStatus(data: any) {
        let endpoint = '/contacts/block';
        let seq = this.api.post(endpoint,data);
        return seq;
    }
    handleNotification(notification: any) {
        this[notification.functionName](notification );
    }
}
