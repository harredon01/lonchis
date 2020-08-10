import {Component, OnInit} from '@angular/core';
import {ItemsService} from '../../services/items/items.service';
import {TranslateService} from '@ngx-translate/core';
import {NavController, LoadingController, ToastController} from '@ionic/angular';
import {SpinnerDialog} from '@ionic-native/spinner-dialog/ngx';
import {Item} from '../../models/item';
import {Order} from '../../models/order';
import {ActivatedRoute} from '@angular/router';
import {ApiService} from '../../services/api/api.service';
import {ParamsService} from '../../services/params/params.service';
@Component({
    selector: 'app-items',
    templateUrl: './items.page.html',
    styleUrls: ['./items.page.scss'],
})
export class ItemsPage implements OnInit {
    public orders: Order[] = [];
    private page: any = 0;
    private merchant: any;
    private urlSearch: string = "";
    private fullfillError: string = "";
    public status: any;
    public queries: any[];
    private loadMore: boolean = false;
    constructor(public itemsServ: ItemsService,
        public params: ParamsService,
        public activatedRoute: ActivatedRoute,
        public api: ApiService,
        public toastCtrl: ToastController,
        public translateService: TranslateService,
        public navCtrl: NavController,
        public loadingCtrl: LoadingController,
        public spinnerDialog: SpinnerDialog
    ) {
        this.queries = [];
        let vm = this;
        this.translateService.get('ITEMS.FULLFILLED').subscribe(function (value) {
            let container = {"name": value, "value": "fulfilled"};
            vm.queries.push(container);
        });
        this.translateService.get('ITEMS.UNFULFILLED').subscribe(function (value) {
            let container = {"name": value, "value": "unfulfilled"};
            vm.queries.push(container);
        });
        this.translateService.get('ITEMS.ERROR_FULLFILL').subscribe(function (value) {
            this.fullfillError = value;
        });

        let container = this.params.getParams();
        this.merchant = container.objectId;
        this.urlSearch = "tabs/settings/merchants/" + this.merchant;
        this.status = "unfulfilled"
    }
    ngOnInit() {
    }

    ionViewDidEnter() {
        this.page = 0;
        this.orders = [];
        this.getItems();
    }
    selectQuery() {
        this.page = 0;
        this.orders = [];
        this.getItems();
    }
    getOrder(id) {
        for (let item in this.orders) {
            if (id == this.orders[item].id) {
                return this.orders[item];
            }
        }
        return null;
    }

    getItems() {
        this.showLoader();
        this.page++;
        let where = "merchant_id=" + this.merchant + "&fulfillment=" + this.status + "&page=" + this.page + "&paid_status=paid&includes=order.orderAddresses&order_by=id,desc";
        this.itemsServ.getItems(where).subscribe((data: any) => {
            let results = data.data;
            if (data.page == data.last_page) {
                this.loadMore = false;
            } else {
                this.loadMore = true;
            }
            for (let item in results) {
                if (results[item].order) {
                    let order = this.getOrder(results[item].order.id); 
                    let newItem = new Item(results[item]);
                    newItem.clean();
                    if (order) {
                        order.items.push(newItem);
                    } else {
                        results[item].order.created_at = results[item].order.created_at.replace(/-/g, '/');
                        results[item].order.updated_at = results[item].order.updated_at.replace(/-/g, '/');
                        results[item].order.created_at = new Date(results[item].order.created_at);
                        results[item].order.updated_at = new Date(results[item].order.updated_at);
                        order = new Order(results[item].order);
                        order.items.push(newItem);
                        this.orders.push(order);
                    }
                }
            }
            this.dismissLoader();
        }, (err) => {
            console.log("Error getBookings");
            this.dismissLoader();
            this.api.handleError(err);
        });
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

    doInfinite(infiniteScroll) {
        console.log('Begin async operation');
        if (this.loadMore) {
            this.loadMore = false;
            setTimeout(() => {
                this.getItems();
                console.log('Async operation has ended');
                infiniteScroll.target.complete();
            }, 500);
        } else {
            infiniteScroll.target.complete();
        }
    }

    openItem(item: Item) {
        if (item.detailsvisible) {
            item.detailsvisible = false;
        } else {
            item.detailsvisible = true;
        }
    }
    fulfillOrder(order: Order) {
        let container = {
            "items": order.items
        };
        this.itemsServ.updateItemStatus(container).subscribe((data: any) => {
            this.dismissLoader();
            console.log("after get Deliveries");
            let results = data.data;
            for (let one in results) {
                //this.item = new Item(results[one]);
            }
            console.log(JSON.stringify(data));
        }, (err) => {
            this.dismissLoader();
            // Unable to log in
            let toast = this.toastCtrl.create({
                message: this.fullfillError,
                duration: 3000,
                position: 'top'
            }).then(toast => toast.present());
            this.api.handleError(err);
        });
    }
}
