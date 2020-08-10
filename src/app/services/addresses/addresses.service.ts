import { Injectable } from '@angular/core';
import {ApiService} from '../api/api.service';
@Injectable({
  providedIn: 'root'
})
export class AddressesService {

  constructor(public api: ApiService) {}

    getAddresses(where?: any) {
        let url = "/addresses";
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
  saveAddress(address: any) {
    let seq = this.api.post('/addresses', address);
    return seq;
  }
  deleteAddress(address_id: string) {
    let seq = this.api.delete('/addresses/'+address_id );
    return seq;
  }
}
