import {Component, OnInit} from '@angular/core';
import {ModalController, NavController} from '@ionic/angular';
import {Events} from '../../services/events/events.service';
import {OrderDataService} from '../../services/order-data/order-data.service';
import {ApiService} from '../../services/api/api.service';
import {Item} from '../../models/item';
@Component({
    selector: 'app-cart',
    templateUrl: './cart.page.html',
    styleUrls: ['./cart.page.scss'],
})
export class CartPage implements OnInit {
    currentItems: Item[];
    // Our translated text strings
    public totalItems: any;
    public subtotal: any;
    public total: any;

    constructor(public navCtrl: NavController,
        public events: Events,
        public api: ApiService,
        public modalCtrl: ModalController,
        public orderData: OrderDataService) {
        this.loadCart();


    }

    /**
     * The view loaded, let's query our items for the list
     */
    ionViewDidLoad() {
    }

    reduceCartItem(item: any) {
        item.quantity--;
        this.addCartItem(item);

    }
    increaseCartItem(item: any) {
        item.quantity++;
        this.addCartItem(item);
    }
    handleCartSuccess(resp: any, item: any) {
        this.api.dismissLoader();
        this.orderData.cartData = resp.cart;
        if (resp.item) {
            item.inCart = true;
            item.item_id = resp.item.id;
            item.amount = resp.item.quantity;
        } else {
            item.inCart = false;
            item.item_id = null;
            item.amount = 1;
        }
        this.loadCart();
        this.api.toast('CART.ITEM_UPDATED');
    }
    handleCartError(resp: any, item) {
        this.api.dismissLoader();
        console.log("Error", resp);
        this.api.toast(resp.message);
    }
    handleServerCartError() {
        this.api.dismissLoader();
        //this.navCtrl.push(MainPage);
        // Unable to log in
        this.api.toast('CART.ERROR_UPDATE');
    }
    addCartItem(item: any) {
        this.api.loader();
        return new Promise((resolve, reject) => {
            let container = null;
            container = {
                product_variant_id: item.attributes.product_variant_id,
                quantity: item.quantity,
                item_id: item.item_id,
                merchant_id: item.attributes.merchant_id
            };
            console.log("Add cart item", container);
            if (container.item_id) {
                let seq = this.api.post('/cart/update', container);
                seq.subscribe((resp: any) => {
                    console.log("updateCartItem", resp);
                    if (resp.status == "success") {
                        this.handleCartSuccess(resp, item);
                        if (resp.item) {
                            resolve(resp.item);
                        } else {
                            resolve(null);
                        }
                    } else {
                        this.handleCartError(resp, item);
                        resolve(null);
                    }

                }, (err) => {
                    this.handleServerCartError();
                    resolve(null);
                    this.api.handleError(err);
                });
            } else {
                let seq = this.api.post('/cart/add', container);
                seq.subscribe((resp: any) => {
                    if (resp.status == "success") {
                        this.handleCartSuccess(resp, item);
                    } else {
                        this.handleCartError(resp, item);
                        resolve(null);
                    }
                    //this.navCtrl.push(MainPage);
                }, (err) => {
                    this.handleServerCartError();
                    this.api.handleError(err);
                    resolve(null);
                });
            }
        });
    }

    /**
     * Delete an item from the list of cart.
     */
    deleteItem(item) {
        this.api.loader();
        item.quantity = 0;
        let seq = this.api.post('/cart/update', item);
        seq.subscribe((resp: any) => {
            if (resp.status == "success") {
                this.orderData.cartData = resp.cart;
                this.loadCart();
                this.events.publish('cart:deleteItem', {item:item, time:Date.now()});
                //this.navCtrl.push(MainPage);
            }
            this.api.dismissLoader();
        }, (err) => {
            this.api.dismissLoader();
            //this.navCtrl.push(MainPage);
            // Unable to log in
            this.api.toast('CART.ERROR_UPDATE');
            this.api.handleError(err);
        });
    }
    /**
     * Delete an item from the list of cart.
     */
    loadCart() {
        this.currentItems = [];
        if (this.orderData.cartData) {
            let cartContainer = this.orderData.cartData;
            console.log("cartContainer", cartContainer);
            let results = cartContainer.items;
            this.totalItems = cartContainer.totalItems;
            this.subtotal = cartContainer.subtotal;
            this.total = cartContainer.total;
            for (let index = 0; index < results.length; ++index) {
                console.log(results[index]);
                if (results[index].attributes.image) {
                    results[index].image = results[index].attributes.image.file;
                }
                results[index].item_id = results[index].id;
                let itemAdd = new Item(results[index]);
                this.currentItems.push(itemAdd);
            }
            console.log("Cart items", this.currentItems);
        } else {
            this.totalItems = 0;
            this.subtotal = 0;
            this.total = 0;
        }
    }
    /**
     * Delete an item from the list of cart.
     */
    clearCart() {
        this.api.loader();
        let seq = this.api.post('/cart/clear', {});
        seq.subscribe((resp) => {
            this.orderData.cartData = {};
            this.orderData.shippingAddress = null;
            this.orderData.cartData.items = [];
            this.orderData.cartData.total = 0;
            this.orderData.cartData.subtotal = 0;
            this.orderData.cartData.totalItems = 0;
            this.loadCart();
            this.api.dismissLoader();
            this.events.publish('cart:clear',{});
            //this.navCtrl.push(MainPage);
        }, (err) => {
            this.api.dismissLoader();
            //this.navCtrl.push(MainPage);
            // Unable to log in
            this.api.toast('CART.ERROR_UPDATE');
            this.api.handleError(err);
        });
    }

    /**
     * Navigate to the detail page for this item.
     */
    checkout() {
        if (this.orderData.cartData.totalItems > 0) {
            let hasShippable = false;
            for (let item in this.currentItems){
                let container = this.currentItems[item];
                console.log("Attributes",container.attributes);
                if(container.attributes.is_shippable==1 || container.attributes.shipping > 0){
                    hasShippable = true;
                }
            }
            if (hasShippable){
                this.modalCtrl.dismiss("Shipping");
            } else {
                this.modalCtrl.dismiss("Prepare");
            }
            
        } else {
            this.api.toast('CART.ERROR_EMPTY');
        }
    }

    /**
     * The user is done and wants to create the item, so return it
     * back to the presenter.
     */
    done() {
        this.modalCtrl.dismiss("Close");
    }

    ngOnInit() {
    }

}
