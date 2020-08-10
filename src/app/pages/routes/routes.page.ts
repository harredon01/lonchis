import { Component, OnInit } from '@angular/core';
import {Route} from '../../models/route';
import {TranslateService} from '@ngx-translate/core';
import {NavController, ModalController, ToastController, LoadingController} from '@ionic/angular';
import {SpinnerDialog} from '@ionic-native/spinner-dialog/ngx';
import {ApiService} from '../../services/api/api.service';
import {RoutingService} from '../../services/routing/routing.service';
import {ParamsService} from '../../services/params/params.service';
@Component({
  selector: 'app-routes',
  templateUrl: './routes.page.html',
  styleUrls: ['./routes.page.scss'],
})
export class RoutesPage implements OnInit {
    page: any;
    loadMore: boolean = false;
    routeGetError: string;
    currentItems: Route[];
  constructor(public translateService: TranslateService,
        public navCtrl: NavController,
        public toastCtrl: ToastController,
        public loadingCtrl: LoadingController,
        public spinnerDialog: SpinnerDialog,
        public api: ApiService,
        public routingService: RoutingService,
        public params: ParamsService) {
        this.translateService.get('ROUTING.ERROR_ROUTE_GET').subscribe(function (value) {
            this.routeGetError = value;
        });
    }
  /**
     * Navigate to the detail page for this item.
     */
    openItem(item: Route) {
        this.params.setParams({"item":item})
        this.navCtrl.navigateForward('tabs/routes/'+item.id);
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
        this.showLoader();
        let query = "page=" + this.page + "&includes=stops.address,stops.deliveries.address,stops.deliveries.user";
        this.routingService.getRoutes(query).subscribe((data: any) => {
            this.dismissLoader();
            console.log("after get Deliveries");
            let results = data.data;
            if (data.page == data.last_page) {
                this.loadMore = false;
            }
            for (let one in results) {
                let result = new Route(results[one])
                this.currentItems.push(result);
            }
            console.log(JSON.stringify(data));
        }, (err) => {
            this.dismissLoader();
            // Unable to log in
            let toast = this.toastCtrl.create({
                message: this.routeGetError,
                duration: 3000,
                position: 'top'
            }).then(toast => toast.present());
            this.api.handleError(err);
        });
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

  ngOnInit() {
  }

}
