import {Component, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {NavController, ToastController, LoadingController} from '@ionic/angular';
import {Address} from '../../models/address';
import {SpinnerDialog} from '@ionic-native/spinner-dialog/ngx';
import {ParamsService} from '../../services/params/params.service';
import {AddressesService} from '../../services/addresses/addresses.service';
import {MapDataService} from '../../services/map-data/map-data.service';
import {OrderService} from '../../services/order/order.service';
import {OrderDataService} from '../../services/order-data/order-data.service';
import {UserService} from '../../services/user/user.service';
import {ApiService} from '../../services/api/api.service';
import {ActivatedRoute} from '@angular/router';
@Component({
    selector: 'app-checkout-shipping',
    templateUrl: './checkout-shipping.page.html',
    styleUrls: ['./checkout-shipping.page.scss'],
})
export class CheckoutShippingPage implements OnInit {

    merchant: any;
    loading: any;
    showAddressCard: boolean;
    selectedAddress: Address;
    currentItems: Address[];

    private addressErrorString: string;
    private coverageAddressErrorString: string;
    private addressGetStartString: string;
    private addressSaveStartString: string;

    constructor(public navCtrl: NavController,
        public user: UserService,
        public mapData: MapDataService,
        public toastCtrl: ToastController,
        public translateService: TranslateService,
        public addresses: AddressesService,
        public order: OrderService,
        public api: ApiService,
        public orderData: OrderDataService,
        public loadingCtrl: LoadingController,
        public spinnerDialog: SpinnerDialog,
        public params: ParamsService,
        private activatedRoute: ActivatedRoute) {
        this.merchant = this.activatedRoute.snapshot.paramMap.get('merchant_id');
        this.showAddressCard = false;
        this.currentItems = [];
        this.translateService.get('ADDRESS_FIELDS.ERROR_GET').subscribe((value) => {
            this.addressErrorString = value;
        });
        this.translateService.get('ADDRESS_FIELDS.ERROR_COVERAGE').subscribe((value) => {
            this.coverageAddressErrorString = value;
        });
        this.translateService.get('ADDRESS_FIELDS.STARTING_GET').subscribe((value) => {
            this.addressGetStartString = value;
        });
        this.translateService.get('ADDRESS_FIELDS.STARTING_SAVE').subscribe((value) => {
            this.addressSaveStartString = value;
        });
    }

    saveShipping(item: Address) {
        console.log("SaveShipping", item);
        let container = {"address_id": item.id, "merchant_id": this.merchant};
        this.showLoaderSave();
        this.order.setShippingAddress(container).subscribe((data: any) => {
            this.dismissLoader();
            console.log("after get addresses");
            if (data.status == "success") {
                this.orderData.shippingAddress = item;
                this.showAddressCard = true;
                this.selectedAddress = item;
                this.orderData.currentOrder = data.order;
                this.prepareOrder();
            } else {
                let toast = this.toastCtrl.create({
                    message: this.coverageAddressErrorString,
                    duration: 3000,
                    position: 'top'
                }).then(toast => toast.present());
            }

            console.log(JSON.stringify(data));
        }, (err) => {
            this.dismissLoader();
            this.api.handleError(err);
            // Unable to log in

        });

        //        let container = {
        //            shipping_address: item.address,
        //            shipping_city: item.cityName,
        //            shipping_state: item.regionName,
        //            shipping_country: item.countryName,
        //            shipping_postal: item.postal,
        //            shipping_phone: item.phone
        //        };
        //        this.showAddressCard = true;
        //        this.orderData.shippingAddress = item;
        //this.navCtrl.push("CheckoutBuyerPage");
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
            this.loading = this.loadingCtrl.create({
                spinner: 'crescent',
                message: this.addressGetStartString,
                backdropDismiss: true
            }).then(toast => toast.present());
        } else {
            this.spinnerDialog.show(null, this.addressGetStartString);
        }
    }
    showLoaderSave() {
        if (document.URL.startsWith('http')) {
            this.loading = this.loadingCtrl.create({
                spinner: 'crescent',
                message: this.addressSaveStartString,
                backdropDismiss: true
            }).then(toast => toast.present());
        } else {
            this.spinnerDialog.show(null, this.addressSaveStartString);
        }
    }
    /**
       * The view loaded, let's query our items for the list
       */
    ionViewDidEnter() {
        console.log("shipping", this.orderData.shippingAddress)
        if (this.orderData.shippingAddress) {
            this.showAddressCard = true;
            this.selectedAddress = this.orderData.shippingAddress;
        } else {
            this.showAddressCard = false;
            if (this.mapData.createdAddress) {
                let container = new Address(this.mapData.createdAddress);
                this.mapData.createdAddress = null;
                this.saveShipping(container);
            } else {
                this.getAddresses();
            }
        }
    }
    createAddress() {
        this.mapData.activeType = "Address";
        this.mapData.activeId = "0";
        this.mapData.createdAddress = null;
        this.mapData.merchantId = this.merchant;
        this.navCtrl.navigateForward('tabs/map');
        console.log("createAddress");
    }
    prepareOrder() {
        console.log("Prepare order");
        let isMeal = 0;
        if (this.merchant == 1299) {
            isMeal = 1;
        }
        let params = {"is_meal": isMeal, "merchant_id": this.merchant};
        console.log("Prepare order", params);
        this.params.setParams(params)
        this.navCtrl.navigateForward('tabs/home/checkout/prepare');
    }
    getAddresses() {
        this.currentItems = [];
        let result = "type=shipping";
        this.showLoader();
        this.addresses.getAddresses(result).subscribe((data: any) => {
            this.dismissLoader();
            console.log("after get addresses");
            let results = data.addresses;
            for (let one in results) {
                let container = new Address(results[one]);
                this.currentItems.push(container);
            }
            //this.createAddress();
            console.log(JSON.stringify(data));
        }, (err) => {
            this.dismissLoader();
            // Unable to log in
            let toast = this.toastCtrl.create({
                message: this.addressErrorString,
                duration: 3000,
                position: 'top'
            }).then(toast => toast.present());
            this.api.handleError(err);
        });
    }
    changeAddress() {
        if (this.currentItems.length == 0) {
            this.getAddresses();
        }
        this.showAddressCard = false;
    }

    ngOnInit() {
    }

}
