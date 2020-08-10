import { Injectable } from '@angular/core';
import {ApiService} from '../api/api.service';
@Injectable({
  providedIn: 'root'
})
export class RoutingService {

  constructor(public api: ApiService) {}
  getRoutes(where?: any) {
        let url = "/routes";
        if (where) {
            url = url + "?" + where;
        }
        let seq = this.api.get(url);
        return seq;
    }
    startRoute(data: any) {
        let endpoint = '/runner/route/start';
        let seq = this.api.post(endpoint, data);
        return seq;
    }
    completeRoute(data: any) {
        let endpoint = '/runner/route/complete';
        let seq = this.api.post(endpoint, data);
        return seq;
    }
    stopArrived(data: any) {
        let endpoint = '/runner/stop/arrived';
        let seq = this.api.post(endpoint, data);
        return seq;
    }
    stopFailed(data: any) {
        let endpoint = '/runner/stop/failed';
        let seq = this.api.post(endpoint, data);
        return seq;
    }
    stopComplete(data: any) {
        let endpoint = '/runner/stop/complete';
        let seq = this.api.post(endpoint, data);
        return seq;
    }
}
