import {Injectable} from '@angular/core';
import {ApiService} from '../../services/api/api.service';
import {NavController, ModalController, ToastController, LoadingController, AlertController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {ParamsService} from '../../services/params/params.service';
import {UserDataService} from '../../services/user-data/user-data.service';
import {OrderDataService} from '../../services/order-data/order-data.service';
import {Events} from '../../services/events/events.service';
@Injectable({
    providedIn: 'root'
})
export class CartService {
    cartUpdate = "";
    constructor(public api: ApiService,
        public toastCtrl: ToastController,
        public modalCtrl: ModalController,
        public navCtrl: NavController,
        public events: Events,
        public orderData: OrderDataService,
        public params: ParamsService,
        public userData: UserDataService,
        public loadingCtrl: LoadingController,
        public alertController: AlertController,
        public translateService: TranslateService) {

    }

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

    cartUpdateMessage() {
        this.translateService.get('CART.ITEM_UPDATED').subscribe((value) => {
            this.toastCtrl.create({
                message: value,
                duration: 1300,
                position: 'top'
            }).then(toast => toast.present());
        })
    }
    showPromptMin(item: any) {
        this.translateService.get('CART.MIN_QUANTITY').subscribe((value) => {
            const prompt = this.alertController.create({
                header: 'Atencion',
                message: value + item.quantity,
                inputs: [],
                buttons: [
                    {
                        text: 'OK',
                        handler: data => {
                            console.log('Cancel clicked');
                        }
                    }
                ]
            }).then(toast => toast.present());
        })

    }
    handleServerCartError() {
        this.translateService.get('CART.ERROR_UPDATE').subscribe((value) => {
            this.toastCtrl.create({
                message: value,
                duration: 1300,
                position: 'top'
            }).then(toast => toast.present());
        })
    }
    addCart(item: any) {
        return new Promise((resolve, reject) => {
            let container = null;
            container = {
                product_variant_id: item.variant_id,
                quantity: item.amount,
                item_id: item.item_id,
                merchant_id: 1299
            };
            console.log("Add cart item", container);
            if (container.item_id) {
                this.updateCartItem(container).subscribe((resp: any) => {
                    console.log("updateCartItem", resp);
                    resolve(resp);
                }, (err) => {
                    this.handleServerCartError();
                    this.api.handleError(err);
                });
            } else {
                this.addCartItem(container).subscribe((resp: any) => {
                    console.log("updateCartItem", resp);
                    resolve(resp);
                    //this.navCtrl.push(MainPage);
                }, (err) => {
                    this.handleServerCartError();
                    this.api.handleError(err);
                });
            }
        });
    }
    clearCartLocal(item: any) {
        this.clearCart().subscribe((resp) => {
            this.orderData.cartData = {};
            this.orderData.shippingAddress = null;
            this.orderData.cartData.items = [];
            this.orderData.cartData.total = 0;
            this.orderData.cartData.subtotal = 0;
            this.orderData.cartData.totalItems = 0;
            this.events.publish('cart:clear', {});
            this.addCartItem(item);
            //this.navCtrl.push(MainPage);
        }, (err) => {
            //this.navCtrl.push(MainPage);
            // Unable to log in
            let toast = this.toastCtrl.create({
                message: 'error limpiando carrito',
                duration: 3000,
                position: 'top'
            }).then(toast => toast.present());
            this.api.handleError(err);
        });
    }
    showPrompt(item: any) {
        this.translateService.get('CART.ERROR_CLEAR').subscribe((value) => {
            this.alertController.create({
                header: 'Atencion',
                message: value,
                inputs: [],
                buttons: [
                    {
                        text: 'No',
                        handler: data => {
                            console.log('Cancel clicked');
                        }
                    },
                    {
                        text: 'Si',
                        handler: data => {
                            this.clearCartLocal(item);
                        }
                    }
                ]
            }).then(toast => toast.present());
        })
    }
    handleCartError(resp: any, item) {
        console.log("Error", resp);
        if (resp.message == "CLEAR_CART") {
            this.showPrompt(item);
        } else if (resp.message == "MIN_QUANTITY") {
            this.showPromptMin(resp);
        } else {
            let toast = this.toastCtrl.create({
                message: resp.message,
                duration: 3000,
                position: 'top'
            }).then(toast => toast.present());
        }
    }
}
