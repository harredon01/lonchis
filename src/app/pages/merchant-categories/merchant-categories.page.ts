import {Component, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {CategoriesService} from '../../services/categories/categories.service';
import {NavController, ModalController, ToastController, LoadingController, MenuController, AlertController} from '@ionic/angular';
import {SpinnerDialog} from '@ionic-native/spinner-dialog/ngx';
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
    categoriesErrorGet: string = "";
    celTitle: string = "";
    celDesc: string = "";
    celError: string = "";
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
        public toastCtrl: ToastController,
        public modalCtrl: ModalController,
        public loadingCtrl: LoadingController,
        public translateService: TranslateService,
        public cartProvider: CartService,
        public orderData: OrderDataService,
        private spinnerDialog: SpinnerDialog,
        public events: Events) {}

    ngOnInit() {
        this.translateService.get('CATEGORIES.ERROR_GET').subscribe((value) => {
            this.categoriesErrorGet = value;
        });
        this.translateService.get('USER.CEL_TITLE').subscribe((value) => {
            this.celTitle = value;
        });
        this.translateService.get('USER.CEL_DESC').subscribe((value) => {
            this.celDesc = value;
        });
        this.translateService.get('USER.CEL_ERROR').subscribe((value) => {
            this.celError = value;
        });
        //this.getCart();
        //this.events.publish("authenticated");
        this.events.subscribe('cart:orderFinished', (resp:any) => {
            this.clearCart();
            // user and time are the same arguments passed in `events.publish(user, time)`
        });
        this.getItems();
        this.checkPhone();
    }
    /**
       * Navigate to the detail page for this item.
       */
    checkPhone() {
        if (this.userData._user.cellphone == "11") {
            this.presentAlertPrompt();
        }
    }
    
    activateMerchant(){
        const browser = this.iab.create("https://auth.mercadopago.com.co/authorization?client_id=7257598100783047&response_type=code&platform_id=mp&redirect_uri=https%3A%2F%2Fdev.lonchis.com.co/mercado/return?user_id=" + this.userData._user.id);
        browser.on('exit').subscribe(event => {
        });
    }
    async presentAlertPrompt() {
        const alert = await this.alertController.create({
            header: this.celTitle,
            subHeader: this.celDesc,
            inputs: [
                {
                    name: 'area_code',
                    type: 'tel',
                    placeholder: '57',
                    value: '57',
                },
                {
                    name: 'cellphone',
                    type: 'tel',
                    placeholder: '3101111111'
                },
            ],
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                    cssClass: 'secondary',
                    handler: () => {
                        console.log('Confirm Cancel');
                    }
                }, {
                    text: 'Ok',
                    handler: (data) => {
                        console.log('Confirm Ok', data);
                        this.savePhone(data);
                    }
                }
            ]
        });
        await alert.present();
    }
    savePhone(data) {
        this.showLoader();
        let query = "merchants";
        this.userS.registerPhone(data).subscribe((resp: any) => {
            this.dismissLoader();
            console.log("after registerPhone");
            console.log(JSON.stringify(resp));
            if(resp.status == "success"){
                this.userS.postLogin();
            }
        }, (err) => {
            this.dismissLoader();
            // Unable to log in
            let toast = this.toastCtrl.create({
                message: this.celError,
                duration: 3000,
                position: 'top'
            }).then(toast => toast.present());
            this.api.handleError(err);
        });
    }
    getItems() {
        this.showLoader();
        let query = "merchants";
        this.categories.getCategories(query).subscribe((data: any) => {
            this.dismissLoader();
            console.log("after getCategories");
            this.items = data.categories;
            console.log(JSON.stringify(data));
        }, (err) => {
            this.dismissLoader();
            // Unable to log in
            let toast = this.toastCtrl.create({
                message: this.categoriesErrorGet,
                duration: 3000,
                position: 'top'
            }).then(toast => toast.present());
            this.api.handleError(err);
        });
    }
    /**
     * Navigate to the detail page for this item.
     */
    openItem(item: any) {
        this.params.setParams({"item": item});
        this.navCtrl.navigateForward('tabs/home/categories/' + item.id);
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
    async dismissLoader() {
        if (document.URL.startsWith('http')) {
            let topLoader = await this.loadingCtrl.getTop();
            while (topLoader) {
                if (!(await topLoader.dismiss())) {
                    console.log('Could not dismiss the topmost loader. Aborting...');
                    return;
                }
                topLoader = await this.loadingCtrl.getTop();
            }
        } else {
            this.spinnerDialog.hide();
        }
    }
    showLoader() {
        if (document.URL.startsWith('http')) {
            this.loadingCtrl.create({
                spinner: 'crescent',
                backdropDismiss: true
            }).then(toast => toast.present());
        } else {
            this.spinnerDialog.show(null, this.categoriesErrorGet);
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
