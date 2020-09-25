import {Component, OnInit, ViewChild} from '@angular/core';
import {NavController, ModalController, AlertController, IonSlides} from '@ionic/angular';
import {ActivatedRoute} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {MerchantsService} from '../../services/merchants/merchants.service';
import {ParamsService} from '../../services/params/params.service';
import {OrderDataService} from '../../services/order-data/order-data.service';
import {Merchant} from '../../models/merchant';
import {DynamicRouterService} from '../../services/dynamic-router/dynamic-router.service';
import {CartPage} from '../cart/cart.page';
import {ApiService} from '../../services/api/api.service';
import {UserDataService} from '../../services/user-data/user-data.service'
import {BookingService} from '../../services/booking/booking.service'
import {CartService} from '../../services/cart/cart.service'
@Component({
    selector: 'app-merchant-detail',
    templateUrl: './merchant-detail.page.html',
    styleUrls: ['./merchant-detail.page.scss'],
})
export class MerchantDetailPage implements OnInit {
    @ViewChild('slides') slides: IonSlides;
    doctor: string = "about";
    Short: string = "n1";
    category: string = "";
    urlSearch: string = "";
    fromSettings: boolean = false;
    merchant: Merchant;
    notAvailable: string;
    maxReached: string;
    galPage: any = 1;

    constructor(public navCtrl: NavController,
        public modalCtrl: ModalController,
        public alertsCtrl: AlertController,
        public orderData: OrderDataService,
        public activatedRoute: ActivatedRoute,
        public api: ApiService,
        private drouter: DynamicRouterService,
        public cart: CartService,
        public booking: BookingService,
        public translateService: TranslateService,
        public userData: UserDataService,
        public merchantsServ: MerchantsService,
        public params: ParamsService) {
        let merchantId = this.activatedRoute.snapshot.paramMap.get('objectId');
        let theParams = this.params.getParams();
        let category = this.activatedRoute.snapshot.paramMap.get('categoryId');
        this.urlSearch = 'shop/home/categories/' + category + '/merchant/' + merchantId;

        let vm = this
        this.translateService.get('BOOKING.NOT_AVAILABLE').subscribe(function (value) {
            vm.notAvailable = value;
            console.log("afk", value);
        });
        this.translateService.get('BOOKING.MAX_REACHED').subscribe(function (value) {
            vm.maxReached = value;
            console.log("afk", value);
        });

        this.merchant = new Merchant({"availabilities": [], "attributes": [], "files": []});
        this.getMerchant(merchantId);
    }
    async presentAlertConfirm(message) {
        console.log("Present alert", message);
        let button = {
            text: 'Ok',
            handler: () => {
                console.log('Confirm Okay');
            }
        }
        const alert = await this.alertsCtrl.create({
            message: message,
            buttons: [
                button
            ]
        });
        await alert.present();
    }
    async openCart() {
        let container = {cart: this.orderData.cartData};
        console.log("Opening Cart", container);
        let addModal = await this.modalCtrl.create({
            component: CartPage,
            componentProps: container
        });
        await addModal.present();
        const {data} = await addModal.onDidDismiss();
        if (data == "Shipping" || data == 'Prepare') {
            this.params.setParams({"merchant_id": this.merchant.id});
            if (this.userData._user) {
                if (data == "Shipping") {
                    this.navCtrl.navigateForward('shop/home/checkout/shipping');
                } else {
                    this.navCtrl.navigateForward('shop/home/checkout/prepare');
                }
            } else {
                if (data == "Shipping") {
                    this.drouter.addPages('shop/home/checkout/shipping');
                } else {
                    this.drouter.addPages('shop/home/checkout/prepare');
                }
                this.navCtrl.navigateForward('login');
            }
        }
    }

    getMerchant(merchant_id:any) {
        let container = {"object_id":merchant_id,"includes":"availabilities,files,ratings"};
        this.merchantsServ.getMerchant(container).subscribe((data: any) => {
            let container = data.merchant;
            container.availabilities = data.availabilities;
            container.ratings = data.ratings;
            container.files = data.files;
            this.merchant = new Merchant(container);
            console.log("attributes", this.merchant.attributes);
        }, (err) => {
            console.log("Error getMerchant");
            this.api.handleError(err);
        });
    }

    chat() {
        let params = {
            "type": "Merchant",
            "objectId": this.merchant.id,
            "name": this.merchant.name
        };
        this.params.setParams(params);
        this.navCtrl.navigateForward(this.urlSearch + "/chat");
    }
    ionViewDidEnter() {
        this.api.hideMenu();
        let container = this.params.getParams();
        if(container){
            if (container.hasChanged) {
                this.getMerchant(this.merchant.id);
            }
        }
        if (document.URL.startsWith('http')) {
            let vm = this;
            setTimeout(function(){ vm.api.dismissLoader();console.log("Retrying closing") }, 1000);
            setTimeout(function(){ vm.api.dismissLoader();console.log("Retrying closing") }, 2000);
        }
    }
    slidePrev() {
        this.galPage--;
        this.slides.slidePrev();
    }
    slideNext() {
        this.galPage++;
        this.slides.slideNext();
    }
    showProducts() {
        let params = {
            "type": "Merchant",
            "objectId": this.merchant.id,
            "owner": this.merchant.owner
        };
        this.params.setParams(params);
        this.navCtrl.navigateForward(this.urlSearch + "/products");
    }
    appointmentbook() {

        if (this.userData._user) {
            let params = {
                "availabilities": this.merchant.availabilities,
                "type": "Merchant",
                "objectId": this.merchant.id,
                "objectName": this.merchant.name,
                "objectDescription": this.merchant.description,
                "objectIcon": this.merchant.icon,
                "expectedPrice": this.merchant.unit_cost
            }
            console.log(params);
            this.params.setParams(params);
            this.navCtrl.navigateForward(this.urlSearch + "/book");
        } else {
            this.drouter.addPages(this.urlSearch);
            this.navCtrl.navigateForward('login');
        }
    }
    addBookingToCart(booking: any) {
        let extras = {
            "type": "Booking",
            "id": booking.id,
            "call": true,
            "name": "Booking appointment for: " + booking.bookable.name,
        }
        let item = {
            "name": "Booking appointment for: " + booking.bookable.name,
            "price": booking.price,
            "quantity": booking.quantity,
            "tax": 0,
            "merchant_id": this.merchant.id,
            "cost": 0,
            "extras": extras
        };
        this.cart.addCustomCartItem(item).subscribe((data: any) => {
            this.orderData.cartData = data.cart;
            this.openCart();
        }, (err) => {
            console.log("Error addCustomCartItem");
            this.api.handleError(err);
        });
    }
    call() {
        this.api.loader();
        this.cart.clearCart().subscribe((resp: any) => {
            let attrs = {"virtual_provider": "zoom", "virtual_meeting": true};
            let data = {
                "type": "Merchant",
                "object_id": this.merchant.id,
                "attributes": attrs,
                "virtual_meeting": true
            };
            if (this.userData._user) {
                this.booking.immediateBookingObject(data).subscribe((resp: any) => {
                    this.api.dismissLoader();
                    console.log("addBookingObject", resp);
                    //this.presentAlertConfirm(data);
                    if (resp.status == "success") {
                        this.addBookingToCart(resp.booking);
                    } else {
                        if (resp.message == "Not available") {
                            this.presentAlertConfirm(this.notAvailable);
                        }
                        if (resp.message == "Max Reached") {
                            this.presentAlertConfirm(this.maxReached);
                        }
                    }
                }, (err) => {
                    console.log("Error addBookingObject");
                    this.api.dismissLoader();
                    this.api.handleError(err);
                });
            } else {

            }
        }, (err) => {
            console.log("Error addCustomCartItem");
            this.api.handleError(err);
        });
    }

    ngOnInit() {
    }

}
