import {Component, OnInit} from '@angular/core';
import {NavController, ModalController} from '@ionic/angular';
import {Address} from '../../models/address';
import {ParamsService} from '../../services/params/params.service';
import {AddressesService} from '../../services/addresses/addresses.service';
import {MapDataService} from '../../services/map-data/map-data.service';
import {OrderService} from '../../services/order/order.service';
import {OrderDataService} from '../../services/order-data/order-data.service';
import {UserService} from '../../services/user/user.service';
import {ApiService} from '../../services/api/api.service';
import {ActivatedRoute} from '@angular/router';
import {AddressCreatePage} from '../address-create/address-create.page'
@Component({
    selector: 'app-checkout-shipping',
    templateUrl: './checkout-shipping.page.html',
    styleUrls: ['./checkout-shipping.page.scss'],
})
export class CheckoutShippingPage implements OnInit {

    merchant: any;
    showAddressCard: boolean;
    selectedAddress: Address;
    currentItems: Address[];


    constructor(public navCtrl: NavController,
        public user: UserService,
        public mapData: MapDataService,
        public addresses: AddressesService,
        public order: OrderService,
        public api: ApiService,
        public modalCtrl: ModalController,
        public orderData: OrderDataService,
        public params: ParamsService,
        private activatedRoute: ActivatedRoute) {
        this.merchant = this.activatedRoute.snapshot.paramMap.get('merchant_id');
        this.showAddressCard = false;
        this.currentItems = [];
    }

    saveShipping(item: Address) {
        console.log("SaveShipping", item);
        let container = {"address_id": item.id, "merchant_id": this.merchant};
        this.api.loader('ADDRESS_FIELDS.STARTING_GET');
        this.order.setShippingAddress(container).subscribe((data: any) => {
            this.api.dismissLoader();
            console.log("after get addresses");
            if (data.status == "success") {
                this.orderData.shippingAddress = item;
                this.showAddressCard = true;
                this.selectedAddress = item;
                this.orderData.currentOrder = data.order;
                this.prepareOrder();
            } else {
                this.api.toast('ADDRESS_FIELDS.ERROR_COVERAGE');
            }

            console.log(JSON.stringify(data));
        }, (err) => {
            this.api.dismissLoader();
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
            let container: any = this.params.getParams();
            console.log("Params entering", container);
            let newAddress = false;
            if (container) {
                let mapLocation = container.mapLocation;
                if (mapLocation) {
                    newAddress = true;
                    if (this.mapData.address.id) {
                        let container = new Address(this.mapData.address);
                        this.saveShipping(container);
                    } else {
                        this.completeAddressData();
                    }

                }
            }
            if (!newAddress) {
                this.getAddresses();
            }
        }
    }
    createAddress() {
        this.mapData.activeType = "Address";
        this.mapData.activeId = "-1";
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
        this.api.loader('ADDRESS_FIELDS.STARTING_GET');
        this.addresses.getAddresses(result).subscribe((data: any) => {
            this.api.dismissLoader();
            console.log("after get addresses");
            let results = data.addresses;
            for (let one in results) {
                let container = new Address(results[one]);
                this.currentItems.push(container);
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
    changeAddress() {
        if (this.currentItems.length == 0) {
            this.getAddresses();
        }
        this.showAddressCard = false;
    }

    async completeAddressData() {
        console.log("completeAddressData", this.mapData.address);
        let container;
        container = {
            lat: this.mapData.address.lat,
            long: this.mapData.address.long,
            address: this.mapData.address.address,
            notes: "",
            postal: this.mapData.address.postal,
            type: "shipping"
        }
        var addModal = await this.modalCtrl.create({
            component: AddressCreatePage,
            componentProps: container
        });
        await addModal.present();
        const {data} = await addModal.onDidDismiss();
        if (data) {
            console.log("Process complete, address created", data);
            let container = new Address(data);
            this.saveShipping(container);
        }
    }

    ngOnInit() {
    }

}
