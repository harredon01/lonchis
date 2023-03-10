import {Component, OnInit} from '@angular/core';
import {NavController, ModalController, AlertController} from '@ionic/angular';
import {UserDataService} from '../../services/user-data/user-data.service';
import {CartService} from '../../services/cart/cart.service';
import {Facebook} from '@awesome-cordova-plugins/facebook/ngx';
import {OrderDataService} from '../../services/order-data/order-data.service';
import {ApiService} from '../../services/api/api.service';
import {ProductsService} from '../../services/products/products.service';
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
    variants: any[]=[];
    subtotal: any;
    unitPrice: any;
    constructor(public navCtrl: NavController,
        public modalCtrl: ModalController,
        public alertCtrl: AlertController,
        public cart: CartService,
        public products: ProductsService,
        public fb: Facebook,
        public api: ApiService,
        public userData: UserDataService,
        public orderData: OrderDataService) {
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
    getProduct() {
        this.products.getProductSimple("80").subscribe((resp: any) => {
            this.variants = this.variants.concat(resp.product.product_variants);
            console.log("RESP",resp)
        }, (err) => {

        });
        this.products.getProductSimple("81").subscribe((resp: any) => {

            this.variants = this.variants.concat(resp.product.product_variants);
        }, (err) => {

        });
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
            this.api.loader();
            this.cart.clearCart().subscribe((resp: any) => {
                this.cart.addCartItem(container).subscribe((resp: any) => {
                    this.api.dismissLoader();
                    if (resp.status == "success") {
                        this.fb.logEvent("Add cart item", {"name": resp.item.name, "total": resp.item.priceSumConditions}, resp.item.priceSumConditions)
                        this.modalCtrl.dismiss("Checkout");
                    } else {

                        this.handleCartError(resp);
                        resolve(null);
                    }
                    //this.navCtrl.push(MainPage);
                }, (err) => {
                    this.api.dismissLoader();
                    this.handleServerCartError();
                    resolve(null);
                });
                //this.navCtrl.push(MainPage);
            }, (err) => {
                this.api.dismissLoader();
                this.handleServerCartError();
                resolve(null);
            });
        });
    }
    selectVariant() {
        let counter = 1;
        for(let item in this.variants){
            if(this.variants[item].id == this.variant){
                this.price = this.variants[item].price
            }
        }
        if (this.variant == 210) {
            counter = 6;
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
        this.api.dismissLoader();
        //this.navCtrl.push(MainPage);
        // Unable to log in
        this.api.toast('CART.ERROR_UPDATE');
    }

    handleCartError(resp: any) {
        console.log("Error", resp);
        this.api.toast(resp.message);
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

    ngOnInit() {
        this.getProduct()
    }

}
