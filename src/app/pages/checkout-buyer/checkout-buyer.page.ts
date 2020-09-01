import {Component, OnInit} from '@angular/core';
import {NavController, ModalController, AlertController} from '@ionic/angular';
import {Address} from '../../models/address';
import {ParamsService} from '../../services/params/params.service';
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
    currentItems: Address[];

    constructor(public navCtrl: NavController,
        public user: UserService,
        public api: ApiService,
        public params: ParamsService,
        public alertCtrl: AlertController,
        public mapData: MapDataService,
        public orderData: OrderDataService,
        public modalCtrl: ModalController,
        public addresses: AddressesService) {
        this.showAddressCard = false;
        this.currentItems = [];
        console.log("checkout buyer");
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

    /**
       * The view loaded, let's query our items for the list
       */
    ionViewDidEnter() {
        if (this.orderData.buyerAddress) {
            this.showAddressCard = true;
            this.selectedAddress = this.orderData.buyerAddress;
            this.api.dismissLoader();
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
            this.api.dismissLoader();
            // Unable to log in
            this.api.toast('ADDRESS_FIELDS.ERROR_GET');
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
