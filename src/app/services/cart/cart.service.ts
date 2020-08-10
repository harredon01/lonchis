import {Injectable} from '@angular/core';
import {ApiService} from '../../services/api/api.service';
@Injectable({
    providedIn: 'root'
})
export class CartService {

    constructor(public api: ApiService) {}

    getCart() {
        let url = "/cart/get";
        let seq = this.api.get(url);
        return seq;
    }

    getCheckoutCart() {
        let url = "/cart/checkout";
        let seq = this.api.get(url);
        return seq;
    }

    /**
      * Send a POST request to our signup endpoint with the data
      * the user entered on the form.
      */
    addCartItem(item: any) {
        let seq = this.api.post('/cart/add', item);
        return seq;
    }
    /**
      * Send a POST request to our signup endpoint with the data
      * the user entered on the form.
      */
    addCustomCartItem(item: any) {
        let seq = this.api.post('/cart/add/custom', item);
        return seq;
    }
    /**
     * Send a POST request to our signup endpoint with the data
     * the user entered on the form.
     */
    updateCartItem(item: any) {
        let seq = this.api.post('/cart/update', item);
        return seq;
    }
    /**
     * Send a POST request to our signup endpoint with the data
     * the user entered on the form.
     */
    deleteCartItem(item: any) {
        let seq = this.api.post('/cart/update', item);
        return seq;
    }
    /**
     * Send a POST request to our signup endpoint with the data
     * the user entered on the form.
     */
    clearCart() {
        let seq = this.api.post('/cart/clear', {});
        return seq;
    }
}
