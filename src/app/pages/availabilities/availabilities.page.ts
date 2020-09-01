import {Component, OnInit} from '@angular/core';
import {Availability} from '../../models/availability';
import {ApiService} from '../../services/api/api.service';
import {NavController, ModalController, AlertController} from '@ionic/angular';
import {ParamsService} from '../../services/params/params.service';
import {BookingService} from '../../services/booking/booking.service';
import {ActivatedRoute} from '@angular/router';
import {AvailabilityCreatePage} from '../availability-create/availability-create.page';
@Component({
    selector: 'app-availabilities',
    templateUrl: './availabilities.page.html',
    styleUrls: ['./availabilities.page.scss'],
})
export class AvailabilitiesPage implements OnInit {
    currentItems: Availability[];
    merchant: any;
    page = 0;
    loadMore = false;
    constructor(public navCtrl: NavController,
        public activatedRoute: ActivatedRoute,
        public booking: BookingService,
        public api: ApiService,
        public modalCtrl: ModalController,
        public params: ParamsService,
        public alertCtrl: AlertController) {
        this.currentItems = [];
        this.merchant = this.activatedRoute.snapshot.paramMap.get('objectId');

    }
    ionViewDidEnter() {
        this.currentItems = [];

        this.getItems();
    }

    getItems() {
        this.page++
        this.api.loader();
        this.currentItems = [];
        let where = {"type": "Merchant", "object_id": this.merchant};
        this.booking.getAvailabilitiesObject(where).subscribe((data: any) => {
            this.api.dismissLoader();
            console.log("after getItems", data);
            let results = data.data;
            for (let one in results) {
                let container = new Availability(results[one]);
                this.currentItems.push(container);
            }
            this.currentItems.sort((a, b) => (a.order > b.order) ? 1 : -1)
            console.log(JSON.stringify(data));
        }, (err) => {
            this.api.dismissLoader();
            // Unable to log in
            this.api.toast('ADDRESS_FIELDS.ERROR_GET');
            this.api.handleError(err);
        });
    }
    doInfinite(infiniteScroll) {
        console.log('Begin async operation');
        if (this.loadMore) {
            this.loadMore = false;
            setTimeout(() => {
                this.getItems();
                console.log('Async operation has ended');
                infiniteScroll.event.complete();
            }, 500);
        } else {
            infiniteScroll.event.complete();
        }
    }

    /**
     * Delete an item from the list of items.
     */
    deleteAvailability(item) {
        this.api.loader();
        let container = {"id": item.id, "object_id": this.merchant, "type": "Merchant"};
        this.booking.deleteAvailability(container).subscribe((resp: any) => {
            this.api.dismissLoader();
            if (resp.status == "success") {
                this.currentItems.splice(this.currentItems.indexOf(item), 1);
            }
            //this.navCtrl.push(MainPage);
        }, (err) => {
            this.api.dismissLoader();
            // Unable to log in
            this.api.toast('ADDRESS_FIELDS.ERROR_GET');
            this.api.handleError(err);
        });
    }

    async editAvailability(container: any) {
        this.params.setParams(container);
        let addModal = await this.modalCtrl.create({
            component: AvailabilityCreatePage
        });
        await addModal.present();
        const {data} = await addModal.onDidDismiss();
        if (data) {
            console.log("Process complete, address created", data);
            this.currentItems.splice(this.currentItems.indexOf(container), 1);
            let results = new Availability(data);
            this.currentItems.push(results);
            this.currentItems.sort((a, b) => (a.order > b.order) ? 1 : -1)

        }
    }
    openItem(item: any) {
        item.object_id = this.merchant;
        item.type = "Merchant";
        this.editAvailability(item);
    }
    createItem() {
        let container = {
            "object_id": this.merchant,
            "type": "Merchant"
        }
        this.editAvailability(container)
    }

    ngOnInit() {
    }

}
