import {Component, OnInit} from '@angular/core';
import {Route} from '../../models/route';
import {NavController, ModalController} from '@ionic/angular';
import {ApiService} from '../../services/api/api.service';
import {Events} from '../../services/events/events.service';
import {RoutingService} from '../../services/routing/routing.service';
import {ParamsService} from '../../services/params/params.service';
import {FoodService} from '../../services/food/food.service';
import {TrackingService} from '../../services/tracking/tracking.service';
@Component({
    selector: 'app-route-detail',
    templateUrl: './route-detail.page.html',
    styleUrls: ['./route-detail.page.scss'],
})
export class RouteDetailPage implements OnInit {
    route: Route;
    listArticles: any[];
    constructor(public navCtrl: NavController,
        public routingService: RoutingService,
        public api: ApiService,
        public foodService: FoodService,
        public params: ParamsService,
        public events: Events,
        public trackingService: TrackingService) {
        let paramSent = this.params.getParams();
        this.route = paramSent.item;
        if(this.route.stops.length > 1){
//            let stop:any = this.route.stops[1];
//            let delivery = stop.deliveries[0];
//            console.log("Getting articles",delivery.delivery);
//            let date = new Date(delivery.delivery);
//            this.getArticles(date.getFullYear() + '-' + (date.getMonth() + 1) + "-" + date.getDate());
        }
        console.log("Route", this.route);
    }

    getArticle(id) {
        console.log("getArticle", id);
        for (let item in this.listArticles) {
            if (this.listArticles[item].id == id) {
                console.log("getArticleres", this.listArticles[item]);
                return this.listArticles[item];
            }
        }
    }
    replaceFood() {
        console.log("articles", this.listArticles);
        for (let stop in this.route.stops) {
            let theStop:any = this.route.stops[stop];
            let deliveries = theStop.deliveries;
            for (let item in deliveries) {
                console.log("delivery", deliveries[item].details);
                let attributes = JSON.parse(deliveries[item].details);
                if (attributes.dish) {
                    let article = this.getArticle(attributes.dish.type_id);
                    attributes.tipoAlmuerzo = article.name;
                    for (let item2 in article.attributes.entradas) {
                        if (article.attributes.entradas[item2].codigo == attributes.dish.starter_id) {
                            attributes.entrada = article.attributes.entradas[item2].valor;
                        }
                    }
                    for (let item3 in article.attributes.plato) {
                        if (article.attributes.plato[item3].codigo == attributes.dish.main_id) {
                            attributes.plato = article.attributes.plato[item3].valor;
                        }
                    }
                    delete attributes.dish;
                    delete attributes.products;
                    delete attributes.merchant_id;
                    deliveries[item].details = attributes;
                    console.log("deliveryDone", deliveries[item].id);
                }
            }
            theStop.deliveries = deliveries;

        }
    }
    getArticles(date) {
        this.foodService.getArticlesByDate(date).subscribe((data: any) => {
            this.listArticles = data.data;
            for (let item in this.listArticles) {
                this.listArticles[item].attributes = JSON.parse(this.listArticles[item].attributes);
            }
            this.replaceFood();
        }, (err) => {
                this.api.handleError(err);
            });
    }

    ngOnInit() {
    }
    subscribeEvents() {
        this.events.subscribe('location:onGeofence', (resp:any) => {
            let geofence = resp.geofence;
            if (geofence.action == "ENTER") {
                this.stopArrived(geofence.identifier);
            } else if (geofence.action == "EXIT") {
                this.stopComplete(geofence.identifier);
            }
        });
    }
    startRoute(route_id) {
        this.api.loader();
        let params = {"route_id": route_id};
        this.routingService.startRoute(params).subscribe((data: any) => {
            this.api.dismissLoader();
            for(let item in this.route.stops){
                let stop:any = this.route.stops[item];
                this.trackingService.createGeofence(stop.address.lat,stop.address.long,stop.id);
            }
            console.log("after startRoute");
            console.log(JSON.stringify(data));
        }, (err) => {
            this.api.dismissLoader();
            // Unable to log in
            this.api.toast('ROUTING.ERROR_ROUTE_START');
            this.api.handleError(err);
        });
    }
    stopArrived(stop_id) {
        this.api.loader();
        let params = {"stop_id": stop_id};
        this.routingService.stopArrived(params).subscribe((data: any) => {
            this.api.dismissLoader();
            console.log("after stopArrived");
            console.log(JSON.stringify(data));
        }, (err) => {
            this.api.dismissLoader();
            // Unable to log in
            this.api.toast('ROUTING.ERROR_STOP_ARRIVED');
            this.api.handleError(err);
        });
    }
    stopFailed( user_id) {
        this.api.loader();
        let params = {"user_id": user_id};
        this.routingService.stopFailed(params).subscribe((data: any) => {
            this.api.dismissLoader();
            console.log("after stopFailed");
            console.log(JSON.stringify(data));
        }, (err) => {
            this.api.dismissLoader();
            // Unable to log in
            this.api.toast('ROUTING.ERROR_STOP_FAILED');
            this.api.handleError(err);
        });
    }
    stopComplete(stop_id) {
        this.api.loader();
        let params = {"stop_id": stop_id};
        this.routingService.stopComplete(params).subscribe((data: any) => {
            this.api.dismissLoader();
            console.log("after stopComplete");
            console.log(JSON.stringify(data));
        }, (err) => {
            this.api.dismissLoader();
            // Unable to log in
            this.api.toast('ROUTING.ERROR_STOP_COMPLETED');
            this.api.handleError(err);
        });
    }
    routeComplete(route_id) {
        this.api.loader();
        let params = {"route_id": route_id};
        this.routingService.completeRoute(params).subscribe((data: any) => {
            this.api.dismissLoader();
            this.trackingService.removeGeofences();
            console.log("after routeComplete");
            console.log(JSON.stringify(data));
        }, (err) => {
            this.api.dismissLoader();
            // Unable to log in
            this.api.toast('ROUTING.ERROR_ROUTE_COMPLETED');
            this.api.handleError(err);
        });
    }
}
