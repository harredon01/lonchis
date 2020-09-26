import {Injectable} from '@angular/core';
import {ApiService} from '../api/api.service';
import {Merchant} from '../../models/merchant';
@Injectable({
    providedIn: 'root'
})
export class MerchantsService {

    constructor(public api: ApiService) {}
    
    getMerchantsFromServer(where: any) {
        let url = "/merchants";
        if (where) {
            url = url + "?" + where;
        }
        let seq = this.api.get(url);
        return seq;
    }

    getMerchants(where: string) {
        let url = "/merchants";

        if (where) {
            url = url + "?" + where;
        }
        let seq = this.api.get(url);
        return seq;
    }
    getMerchantsPrivate(where: string) {
        let url = "/private/merchants";

        if (where) {
            url = url + "?" + where;
        }
        let seq = this.api.get(url);
        return seq;
    }
    getNearbyMerchants(data: any) {
        let url = "/merchants/coverage";
        let seq = this.api.get(url, data);
        return seq;
    }
    searchMerchants(search: string) {
        let url = "/merchants/search";

        if (search) {
            url = url + "?search=" + search;
        }
        let seq = this.api.get(url);
        return seq;
    }
    getMerchant(data: any) {
        let url = "/merchants/detail" ;
        let seq = this.api.get(url, data);
        return seq;
    }
    getMerchantPrivate(data: any) {
        let url = "/private/merchants/detail" ;
        let seq = this.api.get(url, data);
        return seq;
    }
    saveMerchant(merchant: any) {
        let url = "/merchants";
        if (merchant.id) {
            url = "/merchants/" + merchant.id;
            let seq = this.api.patch(url, merchant);
            return seq;
        }
        let seq = this.api.post(url, merchant);
        return seq;
    }
    getMerchantHash(merchantId: string) {
        let url = "/merchant/hash/" + merchantId;
        let seq = this.api.get(url);
        return seq;
    }
}
