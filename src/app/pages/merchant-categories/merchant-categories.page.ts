import {Component, OnInit} from '@angular/core';
import {CategoriesService} from '../../services/categories/categories.service';
import {NavController, ModalController, MenuController, AlertController} from '@ionic/angular';
import {Events} from '../../services/events/events.service';
import {InAppBrowser} from '@ionic-native/in-app-browser/ngx';
import {CartService} from '../../services/cart/cart.service'
import {OrderDataService} from '../../services/order-data/order-data.service'
import {ParamsService} from '../../services/params/params.service';
import {UserDataService} from '../../services/user-data/user-data.service';
import {UserService} from '../../services/user/user.service';
import {ApiService} from '../../services/api/api.service';
import {DynamicRouterService} from '../../services/dynamic-router/dynamic-router.service';
@Component({
    selector: 'app-merchant-categories',
    templateUrl: './merchant-categories.page.html',
    styleUrls: ['./merchant-categories.page.scss'],
})
export class MerchantCategoriesPage implements OnInit {
    location: string = "n1";
    items: any[];
    constructor(public navCtrl: NavController,
        public categories: CategoriesService,
        public alertController: AlertController,
        public params: ParamsService,
        public userData: UserDataService,
        public iab: InAppBrowser,
        public userS: UserService,
        public api: ApiService,
        public menu: MenuController,
        public drouter:DynamicRouterService,
        public modalCtrl: ModalController,
        public cartProvider: CartService,
        public orderData: OrderDataService,
        public events: Events) {}

    ngOnInit() {
        //this.getCart();
        //this.events.publish("authenticated");
        this.events.subscribe('cart:orderFinished', (resp:any) => {
            this.clearCart();
            // user and time are the same arguments passed in `events.publish(user, time)`
        });
        this.getItems();
    }
    /**
       * Navigate to the detail page for this item.
       */
    
    activateMerchant(){
        const browser = this.iab.create("https://auth.mercadopago.com.co/authorization?client_id=7257598100783047&response_type=code&platform_id=mp&redirect_uri=https%3A%2F%2F" + this.api.urlraw+"/mercado/return?user_id=" + this.userData._user.id);
        browser.on('exit').subscribe(event => {
        });
    }

    getItems() {
        this.api.loader();
        let query = "merchants";
        this.categories.getCategories(query).subscribe((data: any) => {
            this.api.dismissLoader();
            console.log("after getCategories");
            this.items = data.categories;
            console.log(JSON.stringify(data));
        }, (err) => {
            this.api.dismissLoader();
            // Unable to log in
            this.api.toast('INPUTS.ERROR_GET');
            this.api.handleError(err);
        });
    }
    /**
     * Navigate to the detail page for this item.
     */
    openItem(item: any) {
        this.params.setParams({"item": item});
        this.navCtrl.navigateForward('shop/home/categories/' + item.id);
    }
    openMenu() {
        this.menu.enable(true, 'end');
        this.menu.open('end');
    }
    searchItems(ev: any) {
        // set val to the value of the searchbar
        const val = ev.target.value;
        // if the value is an empty string don't filter the items
        if (val && val.trim() != '') {

        }
    }
    getCart() {
        this.cartProvider.getCheckoutCart().subscribe((resp) => {
            if (resp) {
                console.log("getCart", resp);
                this.orderData.cartData = resp;
            }
        }, (err) => {
            console.log("getCartError", err);
            this.orderData.cartData = null;
            this.api.handleError(err);
        });
    }
    routeNext() {
//        this.navCtrl.navigateForward()
//        this.cartProvider.getCheckoutCart().subscribe((resp) => {
//            if (resp) {
//                console.log("getCart", resp);
//                this.orderData.cartData = resp;
//            }
//        }, (err) => {
//            console.log("getCartError", err);
//            this.orderData.cartData = null;
//            this.api.handleError(err);
//        });
    }
    clearCart() {
        this.cartProvider.clearCart().subscribe((resp) => {
            if (resp) {
                console.log("clearCart", resp);
                this.orderData.cartData = null;
            }
        }, (err) => {
            console.log("clearCart", err);
            this.orderData.cartData = null;
            this.api.handleError(err);
        });
    }

}
