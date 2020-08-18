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

    prepareObjects(objects: any) {
        for (let item in objects) {
            if (objects[item].object_id) {
                objects[item].id = objects[item].object_id;
            }
            if (objects[item].type) {
                //                        objects[item].avatar = 'MERCHANT_' + objects[item].type.toUpperCase();
                //                        objects[item].avatar = ICONS[objects[item].avatar];
                //                        objects[item].description = $translate.instant('REPORT.' + objects[item].type.toUpperCase());
            }
            if (objects[item].Distance) {
                if (objects[item].Distance < 1) {
                    let result = objects[item].Distance * 100;
                    result = Math.round(result * 100) / 100;
                    objects[item].Distance = result + " m.";
                } else {
                    let result = objects[item].Distance;
                    result = Math.round(result * 100) / 100;
                    objects[item].Distance = result + " km.";
                }
            }
        }
        return objects
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
        let url = "/merchants/nearby";
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
    getMerchant(merchantId: string) {
        let url = "/merchants/" + merchantId;
        let seq = this.api.get(url);
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
