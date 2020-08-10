import {Component, OnInit} from '@angular/core';
import {Address} from '../../models/address';
import {TranslateService} from '@ngx-translate/core';
import {ApiService} from '../../services/api/api.service';
import {NavController, ToastController, LoadingController, ModalController, AlertController} from '@ionic/angular';
import {SpinnerDialog} from '@ionic-native/spinner-dialog/ngx';
import {ParamsService} from '../../services/params/params.service';
import {AddressesService} from '../../services/addresses/addresses.service';
import {MapDataService} from '../../services/map-data/map-data.service';
import {AddressCreatePage} from '../address-create/address-create.page';
@Component({
    selector: 'app-addresses',
    templateUrl: './addresses.page.html',
    styleUrls: ['./addresses.page.scss'],
})
export class AddressesPage implements OnInit {

    currentItems: Address[];
    loading: any;
    isSelect:boolean = false;
    private addressErrorString: string;
    private addressErrorStringSave: string;

    constructor(public navCtrl: NavController,
        public addresses: AddressesService,
        public toastCtrl: ToastController,
        public api: ApiService,
        public modalCtrl: ModalController,
        public mapData: MapDataService,
        public params: ParamsService,
        public translateService: TranslateService,
        public alertCtrl: AlertController,
        public loadingCtrl: LoadingController,
        private spinnerDialog: SpinnerDialog) {
        this.currentItems = [];
        this.translateService.get('ADDRESS_FIELDS.ERROR_GET').subscribe((value) => {
            this.addressErrorString = value;
        });
        this.translateService.get('ADDRESS_FIELDS.ERROR_SAVE').subscribe((value) => {
            this.addressErrorStringSave = value;
        });

    }

    showPrompt() {
        const prompt = this.alertCtrl.create({
            header: 'Nueva dirección',
            message: "Dirección de envío o correspondencia",
            inputs: [],
            buttons: [
                {
                    text: 'Correspondencia',
                    handler: data => {
                        this.addBillingAddress();
                    }
                },
                {
                    text: 'Envío',
                    handler: data => {
                        this.addShippingAddress();
                    }
                }
            ]
        }).then(toast => toast.present());
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
    showLoaderSave() {
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
        this.showLoader();
        let result = null;
        let container = this.params.getParams();
        if (container) {
            if (container.select) {
                result = "type="+container.select;
                this.isSelect = true;
            }
        }
        this.showLoader();
        this.currentItems = [];
        this.addresses.getAddresses(result).subscribe((data: any) => {
            this.dismissLoader();
            console.log("after get addresses");
            let results = data.addresses;
            for (let one in results) {
                let container = new Address(results[one])
                this.currentItems.push(container);
            }
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
    async addBillingAddress() {
        console.log("completeAddressData", this.mapData.address);
        let container;
        container = {
            lat: "",
            long: "",
            address: "",
            id: "",
            phone: "",
            name: "",
            postal: "",
            notes: "",
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
            let container = new Address(data);
            this.currentItems.push(container);

        }
    }

    /**
     * Prompt the user to add a new item. This shows our ItemCreatePage in a
     * modal and then adds the new item to our data source if the user created one.
     */
    addShippingAddress() {
        this.mapData.hideAll();
        this.mapData.activeType = "Address";
        this.mapData.activeId = "-1";
        this.mapData.merchantId = null;
        this.navCtrl.navigateForward('tabs/map');
    }


    /**
     * Delete an item from the list of items.
     */
    deleteAddress(item) {

        this.addresses.deleteAddress(item.id).subscribe((resp: any) => {
            this.dismissLoader();
            if (resp.status == "success") {
                this.currentItems.splice(this.currentItems.indexOf(item), 1);
            }

            //this.navCtrl.push(MainPage);
        }, (err) => {
            this.dismissLoader();
            // Unable to log in
            let toast = this.toastCtrl.create({
                message: this.addressErrorStringSave,
                duration: 3000,
                position: 'top'
            }).then(toast => toast.present());
            this.api.handleError(err);
        });
    }

    /**
     * Navigate to the detail page for this item.
     */
    openAddress(address: Address) {
        this.params.setParams({
            address: address
        })
        this.navCtrl.navigateForward('tabs/settings/addresses/' + address.id);
    }
    /**
     * Navigate to the detail page for this item.
     */
    async editAddress(address: Address) {
        if (this.isSelect){
            this.modalCtrl.dismiss(address);
            return null;
        }
        if (address.type == "shipping") {
            this.mapData.hideAll();
            this.mapData.activeType = "Address";
            this.mapData.activeId = "1";
            this.mapData.address = address;
            this.navCtrl.navigateForward('tabs/map');
        } else {
            console.log("completeAddressData", this.mapData.address);
            let container;
            container = {
                lat: address.lat,
                long: address.long,
                address: address.address,
                id: address.id,
                phone: address.phone,
                name: address.name,
                postal: address.postal,
                notes: address.notes,
                type: "billing"
            }
            let addModal = await this.modalCtrl.create({
                component: AddressCreatePage,
                componentProps: container
            });
            await addModal.present();
            const {data} = await addModal.onDidDismiss();
            if (data) {
                this.currentItems.splice(this.currentItems.indexOf(address), 1);
                this.currentItems.push(data);
                console.log("Process complete, address created", data);
            }

        }


    }

    ngOnInit() {
    }

}
