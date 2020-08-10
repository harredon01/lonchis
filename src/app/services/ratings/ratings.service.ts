import { Injectable } from '@angular/core';
import {ApiService} from '../api/api.service';
@Injectable({
  providedIn: 'root'
})
export class RatingsService {

  constructor(public api: ApiService) {}

    getRatings(where: any) {
        let url = "/ratings";
        if (where) {
            url = url + "?" + where;
        }
        let seq = this.api.get(url);
        return seq;
    }

    /**
   * Send a POST request to our signup endpoint with the data
   * the user entered on the form.
   */
  postRating(accountInfo: any) {
    let seq = this.api.post('/ratings', accountInfo);
    return seq;
  }
}
