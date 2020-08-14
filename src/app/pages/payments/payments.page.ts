import { Component, OnInit } from '@angular/core';
import {Payment} from '../../models/payment';
import {TranslateService} from '@ngx-translate/core';
import {NavController, ModalController, ToastController, LoadingController} from '@ionic/angular';
import {SpinnerDialog} from '@ionic-native/spinner-dialog/ngx';
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
    private paymentsErrorString: string;
    private paymentsGetStartString: string;
    page: any;
    loadMore: boolean;
    loading: any;


    constructor(public navCtrl: NavController,
        public billing: BillingService,
        public params: ParamsService,
        public api: ApiService,
        public orderData: OrderDataService,
        public toastCtrl: ToastController,
        public modalCtrl: ModalController,
        public loadingCtrl: LoadingController,
        public translateService: TranslateService,
        private spinnerDialog: SpinnerDialog) {
        this.translateService.get('PAYMENTS.ERROR_GET').subscribe((value) => {
            this.paymentsErrorString = value;
        });
        this.translateService.get('PAYMENTS.GET_START').subscribe((value) => {
            this.paymentsGetStartString = value;
        });

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
     * Navigate to the detail page for this item.
     */
    getItems() {
        this.page++;
        this.showLoader();
        let query = "page=" + this.page + "&includes=order.items,order.orderConditions";
        this.billing.getPayments(query).subscribe((data: any) => {
            this.dismissLoader();
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
            this.dismissLoader();
            // Unable to log in
            let toast = this.toastCtrl.create({
                message: this.paymentsErrorString,
                duration: 3000,
                position: 'top'
            }).then(toast => toast.present());
            this.api.handleError(err);
        });
    }

    /**
     * Navigate to the detail page for this item.
     */
    openItem(item: Payment) {
        this.params.setParams({"item":item})
        this.navCtrl.navigateForward('tabs/settings/payments/'+item.id);
    }
    showLoader() {
        if (document.URL.startsWith('http')) {
            this.loading = this.loadingCtrl.create({
                spinner: 'crescent',
                message: this.paymentsGetStartString,
                backdropDismiss: true
            }).then(toast => toast.present());
        } else {
            this.spinnerDialog.show(null, this.paymentsGetStartString);
        }
    }

}
