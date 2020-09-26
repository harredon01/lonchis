import {Component, OnInit} from '@angular/core';
import {Address} from '../../models/address';
import {ApiService} from '../../services/api/api.service';
import {NavController, ModalController, AlertController} from '@ionic/angular';
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
    isSelect:boolean = false;

    constructor(public navCtrl: NavController,
        public addresses: AddressesService,
        public api: ApiService,
        public modalCtrl: ModalController,
        public mapData: MapDataService,
        public params: ParamsService,
        public alertCtrl: AlertController) {
        this.currentItems = [];

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

    /**
     * The view loaded, let's query our items for the list
     */
    ionViewDidEnter() {
        let result = null;
        let container = this.params.getParams();
        if (container) {
            if (container.select) {
                result = "type="+container.select;
                this.isSelect = true;
            }
        }
        this.api.loader();
        this.currentItems = [];
        this.addresses.getAddresses(result).subscribe((data: any) => {
            this.api.dismissLoader();
            console.log("after get addresses");
            let results = data.addresses;
            for (let one in results) {
                let container = new Address(results[one])
                this.currentItems.push(container);
            }
            console.log(JSON.stringify(data));
        }, (err) => {
            this.api.dismissLoader();
            // Unable to log in
            this.api.toast('ADDRESS_FIELDS.ERROR_GET');
            this.api.handleError(err);
        });
    }
    closeModal(){
        console.log("Calling dismiss");
        this.modalCtrl.dismiss(null);
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
        this.mapData.address.id = null;
        this.navCtrl.navigateForward('shop/map');
    }


    /**
     * Delete an item from the list of items.
     */
    deleteAddress(item) {

        this.addresses.deleteAddress(item.id).subscribe((resp: any) => {
            this.api.dismissLoader();
            if (resp.status == "success") {
                this.currentItems.splice(this.currentItems.indexOf(item), 1);
            }

            //this.navCtrl.push(MainPage);
        }, (err) => {
            this.api.dismissLoader();
            // Unable to log in
            this.api.toast('ADDRESS_FIELDS.ERROR_SAVE');
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
        this.navCtrl.navigateForward('shop/settings/addresses/' + address.id);
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
            this.navCtrl.navigateForward('shop/map');
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
