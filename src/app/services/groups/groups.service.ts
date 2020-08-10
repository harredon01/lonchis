import {Injectable} from '@angular/core';
import {ApiService} from '../api/api.service';
@Injectable({
    providedIn: 'root'
})
export class GroupsService {
constructor(public api: ApiService) {}
    getGroups(where: any) {
        let url = "/groups";

        if (where) {
            url = url + "?" + where;
        }
        let seq = this.api.get(url);
        return seq;
    }
    leaveGroup(groupId: any) {
        let endpoint = '/groups/leave/'+groupId;
        let seq = this.api.get(endpoint );
        return seq;
    }
    getGroupByCode(code: any) {
        let endpoint = '/groups/code/'+code;
        let seq = this.api.get(endpoint );
        return seq;
    }
    joinGroupByCode(code: any) {
        let endpoint = '/groups/code/'+code;
        let seq = this.api.post(endpoint,{} );
        return seq;
    }
    getAdminGroupUsers(data: any) {
        let endpoint = '/groups/admin_users';
        let seq = this.api.post(endpoint, data);
        return seq;
    }
    changeGroupStatus(data: any) {
        let endpoint = '/groups/status';
        let seq = this.api.post(endpoint, data);
        return seq;
    }
    inviteUsers(data: any) {
        let endpoint = '/groups/invite';
        let seq = this.api.post(endpoint, data);
        return seq;
    }
    
    handleNotification(notification: any) {
        this[notification.functionName](notification );
    }
}
