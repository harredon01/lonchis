import {Injectable} from '@angular/core';
import {ApiService} from '../api/api.service';
import {CartService} from '../cart/cart.service';
import {ParamsService} from '../params/params.service';
import {Friend} from '../../models/friend';
import {InAppBrowser} from '@ionic-native/in-app-browser/ngx';
@Injectable({
    providedIn: 'root'
})
export class DynamicRouterService {

    pages: any[] = [];
    postPurchasePages: any[] = [];

    constructor(public api: ApiService, public cart: CartService, public params: ParamsService, public iab: InAppBrowser) {}

    openNotification(notification) {
        console.log("openNotification", notification);
        let destinyUrl = "";
        // Reset the content nav to have just this page
        // we wouldn't want the back button to show in this scenario 
        if (notification.type == "order_status" || notification.type == "payment_status" || notification.type == "split_order_payment" || notification.type == "payment_successful") {
            let parms = {
                objectId: notification.payload.payment_id
            };
            this.params.setParams(parms);
            destinyUrl = 'shop/settings/payments/' + notification.payload.payment_id;
        } else if (notification.type == "user_message") {
            let friend = new Friend({
                "id": notification.trigger_id,
                "name": notification.payload.first_name + " " + notification.payload.last_name,
                "avatar": "assets/avatar/Bentley.png",
                "created_at": new Date(notification.created_at)
            });
            console.log("Chat room container", friend);
            this.params.setParams({friend});
            destinyUrl = 'shop/chat-room';
        } else if (notification.type == "support_message" || notification.type == "program_reminder") {
            destinyUrl = notification.payload.utl;
            let destinyPayload = notification.payload.page_payload;
            console.log("Opening destiny notification", destinyUrl);
            console.log("Opening destiny payload", destinyPayload);
            this.params.setParams(destinyPayload);
        } else if (notification.type == "booking_starting" || notification.type == "booking_waiting") {
            let destinyPayload = notification.payload;
            console.log("Opening destiny notification", destinyUrl);
            console.log("Opening destiny payload", destinyPayload);
            if (destinyPayload.booking.options.virtual_meeting) {
                if (destinyPayload.booking.options.virtual_provider == "zoom") {
                    this.browser(destinyPayload.url);
                    destinyUrl = 'shop';
                } else {
                    this.params.setParams(destinyPayload);
                    destinyUrl = 'shop/opentok';
                }
            } else {
                let parms = {
                    booking_id: notification.payload.booking_id
                };
                this.params.setParams(parms);
                destinyUrl = 'shop/settings/bookings/' + notification.payload.booking_id;
            }
        } else if (notification.type == "booking_bookable_approved" || notification.type == "booking_bookable_denied" || notification.type == "booking_created_bookable_pending" || notification.type == "booking_updated_bookable_pending") {
            let parms = {
                booking_id: notification.payload.booking_id
            };
            this.params.setParams(parms);
            destinyUrl = 'shop/settings/bookings/' + notification.payload.booking_id;
        } else if (notification.type == "mercadopago" ) {
            this.browser(notification.payload.url);
            destinyUrl = 'shop';
        } else if(notification.type == "order_status_Merchant"){
            let params = {
                "objectId": notification.payload.merchant_id,
                "type": "Merchant",
                "Name": "",
                "settings": true
            };
            this.params.setParams(params);
            destinyUrl = "shop/settings/merchants/" + notification.payload.merchant_id + "/items";
        }
        console.log("Destiny", destinyUrl);
        return destinyUrl;
    }
    browser(url) {
        const browser = this.iab.create(url);
        browser.on('exit').subscribe(event => {
        });
    }
    redirectToTarger() {
        let pagesArray = []
        for (let item in this.pages) {
            let page = this.pages[item];
            let container = {page: "", params: {}};
            if (page.type == "addCart") {
                this.cart.addCartItem(page.params).subscribe((resp: any) => {
                    if (resp.status == "success") {
                        container.page = 'ProductsPage';
                        container.params = {objectId: page.object_id};
                        pagesArray.push(container);
                        container.page = 'CheckoutShippingPage';
                        container.params = {objectId: page.object_id};
                        pagesArray.push(container);
                    }
                }, (err) => {

                });
            }
            if (page.type == "products") {
                container.page = 'ProductsPage';
                container.params = {objectId: page.object_id};
                pagesArray.push(container);
            }
            if (page.type == "checkout") {
                container.page = 'ProductsPage';
                container.params = {objectId: page.object_id};
                pagesArray.push(container);
                container.page = 'CheckoutShippingPage';
                container.params = {objectId: page.object_id};
                pagesArray.push(container);
            }
        }
    }

    addPages(data: any) {
        this.pages = data;
    }
    addPostPurchase(data: any) {
        this.postPurchasePages = this.postPurchasePages.concat(data);
    }
    activatePostPurchase(data: any) {
        this.postPurchasePages = this.postPurchasePages.concat(data);
    }
}
