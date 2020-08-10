import {Component, OnInit} from '@angular/core';
import {NavController, ToastController, ModalController, AlertController, LoadingController} from '@ionic/angular';
import {Address} from '../../models/address';
import {ParamsService} from '../../services/params/params.service';
import {TranslateService} from '@ngx-translate/core';
import {SpinnerDialog} from '@ionic-native/spinner-dialog/ngx';
import {MapDataService} from '../../services/map-data/map-data.service';
import {AddressesService} from '../../services/addresses/addresses.service';
import {OrderDataService} from '../../services/order-data/order-data.service';
import {UserService} from '../../services/user/user.service';
import {AddressCreatePage} from '../address-create/address-create.page';
import {ApiService} from '../../services/api/api.service';
@Component({
    selector: 'app-checkout-buyer',
    templateUrl: './checkout-buyer.page.html',
    styleUrls: ['./checkout-buyer.page.scss'],
})
export class CheckoutBuyerPage implements OnInit {
    // The account fields for the login form.
    // If you're using the username field with or without email, make
    // sure to add it to the type
    buyer: {
        buyer_address: string,
        buyer_city: string,
        buyer_state: string,
        buyer_country: string,
        buyer_postal: string,
        buyer_phone: string
    } = {
            buyer_address: '',
            buyer_city: '',
            buyer_state: '',
            buyer_country: '',
            buyer_postal: '',
            buyer_phone: '',
        };
    showAddressCard: boolean;
    selectedAddress: Address;
    loading: any;
    currentItems: Address[];

    private addressErrorString: string;

    constructor(public navCtrl: NavController,
        public user: UserService,
        public api: ApiService,
        public params: ParamsService,
        public alertCtrl: AlertController,
        public mapData: MapDataService,
        public orderData: OrderDataService,
        public modalCtrl: ModalController,
        public toastCtrl: ToastController,
        public translateService: TranslateService,
        public addresses: AddressesService,
        public loadingCtrl: LoadingController,
        private spinnerDialog: SpinnerDialog) {
        this.showAddressCard = false;
        this.currentItems = [];
        console.log("checkout buyer");
        this.translateService.get('ADDRESS_FIELDS.ERROR_GET').subscribe((value) => {
            this.addressErrorString = value;
        });
    }

    saveBilling(item: Address, save: boolean) {
        this.buyer.buyer_address = item.address;
        this.buyer.buyer_city = item.cityName;
        this.buyer.buyer_state = item.regionName;
        this.buyer.buyer_country = item.countryName;
        this.buyer.buyer_postal = item.postal;
        this.buyer.buyer_phone = item.phone;
        this.orderData.buyerAddress = item;
        this.showAddressCard = true;
        this.selectedAddress = item;
        if (save) {
            this.user.setAddressType(item.id, "buyer");
        }

    }

    showLoader() {
        if (document.URL.startsWith('http')) {
            this.loading = this.loadingCtrl.create({
                spinner: 'crescent',
                backdropDismiss: true
            }).then(toast => toast.present());
        } else {
            this.spinnerDialog.show();
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
    /**
       * The view loaded, let's query our items for the list
       */
    ionViewDidEnter() {
        if (this.orderData.buyerAddress) {
            this.showAddressCard = true;
            this.selectedAddress = this.orderData.buyerAddress;
            this.dismissLoader();
        } else {
            this.getAddresses();
        }
    }
    getAddresses() {
        this.addresses.getAddresses().subscribe((data: any) => {
            console.log("after get addresses");
            let results = data.addresses;
            let buyerAddress = null;
            for (let one in results) {
                let container = new Address(results[one]);
                if (container.type == "buyer") {
                    buyerAddress = container;
                }
                this.currentItems.push(container);
            }
            if (buyerAddress) {
                this.saveBilling(buyerAddress, false);
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
    showPrompt(addressId) {
        const prompt = this.alertCtrl.create({
            header: 'Gracias',
            message: "Te gustaría que guardemos esta como tu direccion de residencia",
            inputs: [],
            buttons: [
                {
                    text: 'SI',
                    handler: data => {
                        this.user.setAddressType(addressId, "buyer");
                        this.params.setParams({
                            items: this.currentItems
                        });
                        this.navCtrl.navigateForward('tabs/payu/credit/payer');
                    }
                },
                {
                    text: 'No',
                    handler: data => {
                        this.params.setParams({
                            items: this.currentItems
                        })
                        this.navCtrl.navigateForward('tabs/payu/credit/payer');
                    }
                }
            ]
        }).then(toast => toast.present());
    }
    async createAddress() {
        let container;
        container = {
            type: "billing"
        }
        let addModal = await this.modalCtrl.create({
            component: AddressCreatePage,
            componentProps: container
        });
        await addModal.present();
        const {data} = await addModal.onDidDismiss();
        if (data) {
            console.log("Process complete, address created", data);
            this.saveBilling(data, true);
            this.currentItems.push(data);

        }
    }
    continuePayer() {
        this.params.setParams({
            items: this.currentItems
        })
        this.navCtrl.navigateForward('tabs/payu/credit/payer');
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
