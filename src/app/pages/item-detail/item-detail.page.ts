import {Component, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {NavController, ModalController, ToastController, LoadingController} from '@ionic/angular';
import {SpinnerDialog} from '@ionic-native/spinner-dialog/ngx';
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
    private itemsErrorGet: string;
    constructor(public navCtrl: NavController,
        public items: ItemsService,
        public params: ParamsService,
        public api: ApiService,
        private activatedRoute: ActivatedRoute,
        public toastCtrl: ToastController,
        private spinnerDialog: SpinnerDialog,
        public loadingCtrl: LoadingController,
        public modalCtrl: ModalController,
        public translateService: TranslateService) {
        this.item = new Item({});
        this.translateService.get('ITEMS.ERROR_GET').subscribe(function (value) {
            this.itemsErrorGet = value;
        });
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
                this.showLoader();
                let query = "id=" + itemId + "&includes=order.user";
                this.items.getItems(query).subscribe((data: any) => {
                    this.dismissLoader();
                    console.log("after get Deliveries");
                    let results = data.data;
                    for (let one in results) {
                        this.item = new Item(results[one]);
                    }
                    console.log(JSON.stringify(data));
                }, (err) => {
                    this.dismissLoader();
                    // Unable to log in
                    let toast = this.toastCtrl.create({
                        message: this.itemsErrorGet,
                        duration: 3000,
                        position: 'top'
                    }).then(toast => toast.present());
                    this.api.handleError(err);
                });
            }

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

    showLoader() {
        if (document.URL.startsWith('http')) {
            this.loadingCtrl.create({
                spinner: 'crescent',
                backdropDismiss: true
            }).then(toast => toast.present());
        } else {
            this.spinnerDialog.show();
        }
    }

    fulfillItem() {
        let container = {
            "item": this.item.item_id
        };
        this.items.updateItemStatus(container).subscribe((data: any) => {
            this.dismissLoader();
            console.log("after get Deliveries");
            let results = data.data;
            for (let one in results) {
                this.item = new Item(results[one]);
            }
            console.log(JSON.stringify(data));
        }, (err) => {
            this.dismissLoader();
            // Unable to log in
            let toast = this.toastCtrl.create({
                message: this.itemsErrorGet,
                duration: 3000,
                position: 'top'
            }).then(toast => toast.present());
            this.api.handleError(err);
        });
    }

}
