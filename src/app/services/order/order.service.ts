import { Injectable } from '@angular/core';
import {ApiService} from '../api/api.service';
@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(public api: ApiService) {}


    /**
      * Send a POST request to our signup endpoint with the data
      * the user entered on the form.
      */
    setShippingAddress(shipping: any) {
        let seq = this.api.post('/orders/shipping', shipping);
        return seq;
    }
    
    /**
      * Send a POST request to our signup endpoint with the data
      * the user entered on the form.
      */
    setOrderRecurringType(order_id: any,recurring: any) {
        let seq = this.api.post('/orders/recurring/'+order_id, recurring);
        return seq;
    }
    /**
      * Send a POST request to our signup endpoint with the data
      * the user entered on the form.
      */
    setPlatformShippingCondition(order: any,platform:any) {
        let shipping = {};
        let seq = this.api.post('/orders/platform/shipping/'+order+"/"+platform, shipping);
        return seq;
    }
    /**
      * Send a POST request to our signup endpoint with the data
      * the user entered on the form.
      */
    getPlatformShippingPrice(order: any,platform:any) {
        let shipping = {};
        let seq = this.api.get('/orders/platform/shipping/'+order+"/"+platform, shipping);
        return seq;
    }
    /**
     * Send a POST request to our signup endpoint with the data
     * the user entered on the form.
     */
    setPayerAddress(shipping: any) {
        let seq = this.api.post('/orders/shipping', shipping);
        return seq;
    }
    /**
     * Send a POST request to our signup endpoint with the data
     * the user entered on the form.
     */
    updateCart(accountInfo: any) {
        let seq = this.api.post('/cart/update', accountInfo);
        return seq;
    }
    /**
     * Send a POST request to our signup endpoint with the data
     * the user entered on the form.
     */
    deleteCartItem(accountInfo: any) {
        let seq = this.api.post('/cart/update', accountInfo);
        return seq;
    }
    /**
     * Send a POST request to our signup endpoint with the data
     * the user entered on the form.
     */
    clearCart(accountInfo: any) {
        let seq = this.api.post('/cart/clear', accountInfo);
        return seq;
    }

    /**
     * Send a POST request to our signup endpoint with the data
     * the user entered on the form.
     */
    prepareOrder(accountInfo: any,platform:any) {
        let seq = this.api.post('/orders/prepare/'+platform , accountInfo);
        return seq;
    }
    /**
     * Send a POST request to our signup endpoint with the data
     * the user entered on the form.
     */
    setDiscounts(order: any,platform:any) {
        let seq = this.api.post('/orders/discounts/'+platform+"/"+order, {});
        return seq;
    }
    
    /**
     * Send a POST request to our signup endpoint with the data
     * the user entered on the form.
     */
    setCoupon(coupon: any) {
        let seq = this.api.post('/orders/coupon', {"coupon":coupon});
        return seq;
    }
    /**
     * Send a POST request to our signup endpoint with the data
     * the user entered on the form.
     */
    checkOrder(order: any,data:any) { 
        let seq = this.api.post('/orders/check/'+order, data);
        return seq;
    }
    
    /**
     * Send a POST request to our signup endpoint with the data
     * the user entered on the form.
     */
    getOrders(where:any) { 
        let url = '/orders';
        if(where){
            url = url+"?"+where;
        }
        let seq = this.api.get(url);
        return seq;
    }
    /**
     * Send a POST request to our signup endpoint with the data
     * the user entered on the form.
     */
    getOrder() { 
        let url = '/orders/active';
        let seq = this.api.get(url);
        return seq;
    }
}
