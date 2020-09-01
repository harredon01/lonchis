import {Component, OnInit} from '@angular/core';
import {NavController, ModalController} from '@ionic/angular';
import {ActivatedRoute} from '@angular/router';
import {Item} from '../../models/item';
import {ParamsService} from '../../services/params/params.service';
import {ItemsService} from '../../services/items/items.service';
import {ApiService} from '../../services/api/api.service';
@Component({
    selector: 'app-item-detail',
    templateUrl: './item-detail.page.html',
    styleUrls: ['./item-detail.page.scss'],
})
export class ItemDetailPage implements OnInit {
    item: Item;
    constructor(public navCtrl: NavController,
        public items: ItemsService,
        public params: ParamsService,
        public api: ApiService,
        private activatedRoute: ActivatedRoute,
        public modalCtrl: ModalController) {
        this.item = new Item({});
    }
    ionViewDidEnter() {
        this.loadItem();
    }

    ngOnInit() {
    }
    loadItem() {
        let paramSent = this.params.getParams();
        var result = paramSent.item;
        if (result) {
            this.item = result;
        } else {
            let itemId = this.activatedRoute.snapshot.paramMap.get('objectId');
            if (itemId) {
                this.api.loader();
                let query = "id=" + itemId + "&includes=order.user";
                this.items.getItems(query).subscribe((data: any) => {
                    this.api.dismissLoader();
                    console.log("after get Deliveries");
                    let results = data.data;
                    for (let one in results) {
                        this.item = new Item(results[one]);
                    }
                    console.log(JSON.stringify(data));
                }, (err) => {
                    this.api.dismissLoader();
                    // Unable to log in
                    this.api.toast('ITEMS.ERROR_GET');
                    this.api.handleError(err);
                });
            }

        }

    }

    fulfillItem() {
        let container = {
            "item": this.item.item_id
        };
        this.items.updateItemStatus(container).subscribe((data: any) => {
            this.api.dismissLoader();
            console.log("after get Deliveries");
            let results = data.data;
            for (let one in results) {
                this.item = new Item(results[one]);
            }
            console.log(JSON.stringify(data));
        }, (err) => {
            this.api.dismissLoader();
            // Unable to log in
            this.api.toast('ITEMS.ERROR_GET');
            this.api.handleError(err);
        });
    }

}
