import { Component, OnInit } from '@angular/core';
import {Payment} from '../../models/payment';
import {NavController, ModalController} from '@ionic/angular';
import {BillingService} from '../../services/billing/billing.service';
import {OrderDataService} from '../../services/order-data/order-data.service';
import {ParamsService} from '../../services/params/params.service';
import {ApiService} from '../../services/api/api.service';
@Component({
  selector: 'app-payments',
  templateUrl: './payments.page.html',
  styleUrls: ['./payments.page.scss'],
})
export class PaymentsPage implements OnInit {
    currentItems: any[]=[];
    page: any;
    loadMore: boolean;
    constructor(public navCtrl: NavController,
        public billing: BillingService,
        public params: ParamsService,
        public api: ApiService,
        public orderData: OrderDataService,
        public modalCtrl: ModalController) {
        this.loadMore = true;
    }
    ngOnInit() {
    }

    /**
     * The view loaded, let's query our items for the list
     */ 
    /**
       * The view loaded, let's query our items for the list
       */
    ionViewDidEnter() {
        this.page = 0;
        this.getItems();
        this.currentItems = [];
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
     * Navigate to the detail page for this item.
     */
    getItems() {
        this.page++;
        this.api.loader('PAYMENTS.GET_START');
        let query = "page=" + this.page + "&includes=order.items,order.orderConditions";
        this.billing.getPayments(query).subscribe((data: any) => {
            this.api.dismissLoader();
            console.log("after get Deliveries");
            let results = data.data;
            if (data.page == data.last_page) {
                this.loadMore = false;
            }
            for (let one in results) {
                let container = new Payment(results[one]);
                this.currentItems.push(container);
            }
            console.log(JSON.stringify(data));
        }, (err) => {
            this.api.dismissLoader();
            // Unable to log in
            this.api.toast('PAYMENTS.ERROR_GET');
            this.api.handleError(err);
        });
    }

    /**
     * Navigate to the detail page for this item.
     */
    openItem(item: Payment) {
        this.params.setParams({"item":item})
        this.navCtrl.navigateForward('shop/settings/payments/'+item.id);
    }
}
