import { Component, OnInit } from '@angular/core';
import {Route} from '../../models/route';
import {NavController, ModalController} from '@ionic/angular';
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
    currentItems: Route[];
  constructor(public navCtrl: NavController,
        public api: ApiService,
        public routingService: RoutingService,
        public params: ParamsService) {
    }
  /**
     * Navigate to the detail page for this item.
     */
    openItem(item: Route) {
        this.params.setParams({"item":item})
        this.navCtrl.navigateForward('shop/routes/'+item.id);
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
        this.api.loader();
        let query = "page=" + this.page + "&includes=stops.address,stops.deliveries.address,stops.deliveries.user";
        this.routingService.getRoutes(query).subscribe((data: any) => {
            this.api.dismissLoader();
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
            this.api.dismissLoader();
            // Unable to log in
            this.api.toast('ROUTING.ERROR_ROUTE_GET');
            this.api.handleError(err);
        });
    }

  ngOnInit() {
  }

}
