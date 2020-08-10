import {Component,OnInit} from '@angular/core';
import { NavController, ToastController, ModalController, AlertController, LoadingController} from '@ionic/angular';
import {UserDataService} from '../../services/user-data/user-data.service';
import {TranslateService} from '@ngx-translate/core';
import {CartService} from '../../services/cart/cart.service';
import {Facebook} from '@ionic-native/facebook/ngx';
import {OrderDataService} from '../../services/order-data/order-data.service';
import {SpinnerDialog} from '@ionic-native/spinner-dialog/ngx';

@Component({
  selector: 'app-conversion',
  templateUrl: './conversion.page.html',
  styleUrls: ['./conversion.page.scss'],
})
export class ConversionPage implements OnInit {
variant: any;
    amount: any;
    loading: any;
    options: any;
    merchant: any = 1299;
    price: any = 1299;
    subtotal: any;
    cartErrorString: any;
    unitPrice: any;
    constructor(public navCtrl: NavController,
        public toastCtrl: ToastController,
        public modalCtrl: ModalController,
        public alertCtrl: AlertController,
        private spinnerDialog: SpinnerDialog,
        public loadingCtrl: LoadingController,
        public cart: CartService,
        public fb: Facebook,
        public userData: UserDataService,
        public orderData: OrderDataService,
        public translateService: TranslateService) {
        this.translateService.get('CART.ERROR_UPDATE').subscribe((value) => {
            this.cartErrorString = value;
        })
    }

    ionViewDidLoad() {
        if (this.userData._user) {
            this.variant = 210;
        } else {
            this.variant = 220;
        }
        this.selectVariant();
        console.log('ionViewDidLoad ConversionPage');
    }
    addCartItem() {

        console.log("Add cart item");
        return new Promise((resolve, reject) => {
            let container = null;
            container = {
                product_variant_id: this.variant,
                quantity: this.amount,
                item_id: null,
                merchant_id: this.merchant
            };
            this.showLoader();
            this.cart.clearCart().subscribe((resp: any) => {
                this.cart.addCartItem(container).subscribe((resp: any) => {
                    this.dismissLoader();
                    if (resp.status == "success") {
                        this.fb.logEvent("Add cart item", {"name": resp.item.name, "total": resp.item.priceSumConditions}, resp.item.priceSumConditions)
                        this.modalCtrl.dismiss("Checkout");
                    } else {

                        this.handleCartError(resp);
                        resolve(null);
                    }
                    //this.navCtrl.push(MainPage);
                }, (err) => {
                    this.dismissLoader();
                    this.handleServerCartError();
                    resolve(null);
                });
                //this.navCtrl.push(MainPage);
            }, (err) => {
                this.dismissLoader();
                this.handleServerCartError();
                resolve(null);
            });
        });
    }
    selectVariant() {
        let counter = 1;
        this.price = 16330;
        if (this.variant == 210) {
            counter = 6;
            this.price = 15230;
        }
        this.options = [];
        for (let i = counter; i < 34; i++) {
            this.options.push(i);
        }
        this.amount = this.options[0];
        this.calculateTotalsProduct();
    }
    selectAmount() {
        this.calculateTotalsProduct();
    }
    done() {
        this.modalCtrl.dismiss("Done");
    }
    handleServerCartError() {
        this.dismissLoader();
        //this.navCtrl.push(MainPage);
        // Unable to log in
        let toast = this.toastCtrl.create({
            message: this.cartErrorString,
            duration: 3000,
            position: 'top'
        }).then(toast => toast.present());
    }

    handleCartError(resp: any) {
        console.log("Error", resp);

        let toast = this.toastCtrl.create({
            message: resp.message,
            duration: 3000,
            position: 'top'
        }).then(toast => toast.present());
    }
    calculateTotalsProduct() {
        if (this.amount > 0 && this.amount < 10) {
            this.subtotal = this.price * this.amount;
            this.unitPrice = this.subtotal / (this.amount);
        } else {
            let counter2 = Math.floor(this.amount / 11);
            this.subtotal = (this.price * this.amount) - (counter2 * 11000);
            this.unitPrice = this.subtotal / (this.amount);
        }
        console.log("calculateTotals", this.subtotal, this.unitPrice);
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
            this.spinnerDialog.show();
        }
    }

  ngOnInit() {
  }

}
