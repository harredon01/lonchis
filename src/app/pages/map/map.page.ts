import {Component, OnInit, ChangeDetectorRef, ViewChild} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {SpinnerDialog} from '@ionic-native/spinner-dialog/ngx';
import {NavController, ModalController, AlertController, Platform, LoadingController} from '@ionic/angular';
import {MapService} from '../../services/map/map.service';
import {Events} from '../../services/events/events.service';
import {MapDataService} from '../../services/map-data/map-data.service';
import {ApiService} from '../../services/api/api.service';
import {FoodService} from '../../services/food/food.service';
import {ParamsService} from '../../services/params/params.service';
import {LocationsService} from '../../services/locations/locations.service';
import {AddressCreatePage} from '../address-create/address-create.page'
@Component({
    selector: 'app-map',
    templateUrl: './map.page.html',
    styleUrls: ['./map.page.scss'],
})
export class MapPage implements OnInit {
    public mapActive: boolean;
    public mapLoaded: boolean;
    shippingAddressInCoverage: boolean;
    loadingComplete: boolean;
    public sharedLocationsFetched: boolean;
    deliveryNoRouteTitle: any;
    deliveryNoRouteDesc: any;


    constructor(public navCtrl: NavController,
        public platform: Platform,
        public map: MapService,
        public alertCtrl: AlertController,
        public food: FoodService,
        private cdr: ChangeDetectorRef,
        public modalCtrl: ModalController,
        public api: ApiService,
        public mapData: MapDataService,
        public translateService: TranslateService,
        public params: ParamsService,
        public loadingCtrl: LoadingController,
        private spinnerDialog: SpinnerDialog,
        public events: Events,
        public locations: LocationsService) {
        this.sharedLocationsFetched = false;
        this.loadingComplete = false;
        this.mapLoaded = false;
        this.shippingAddressInCoverage = false;
        this.translateService.get('MAP.DELIVERY_NO_ROUTE_TITLE').subscribe((value) => {
            this.deliveryNoRouteTitle = value;
        });
        this.translateService.get('MAP.DELIVERY_NO_ROUTE_DESC').subscribe((value) => {
            this.deliveryNoRouteDesc = value;
        });
        events.subscribe('map:checkingShippingAddressCoverage', (resp:any) => {
            console.log("Checking Shipping address coverage");
            this.showLoader();
        });
        events.subscribe('map:loaded', (resp:any) => {
            console.log("Map Loaded");
            this.mapLoaded = true;
            this.mapActive = true;
            this.buildMapStatus();
        });
        events.subscribe('map:shippingAddressInCoverage', (resp:any) => {
            this.loadingComplete = true;

            console.log("Shipping address in coverage event triggered");
            this.shippingAddressInCoverage = true;
            this.dismissLoader();
            this.cdr.detectChanges();
        });
        events.subscribe('map:shippingAddressNotInCoverage', (resp:any) => {
            this.shippingAddressInCoverage = false;
            console.log("Event Address not in coverage");
            this.loadingComplete = true;
            this.dismissLoader();
            this.cdr.detectChanges();
        });
        this.showLoader()
        console.log("ionViewDidLoad map page");
        this.mapData.map = this.map.createMap();
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
    ionViewDidLeave() {
        this.mapActive = false;
        this.cdr.detach();
        console.log("Looks like I'm about to leave :(");
    }
    ionViewDidEnter() {
        if (this.mapLoaded) {
            this.buildMapStatus();
        } else if (!this.mapData.map) {
            this.mapData.map = this.map.createMap();
        }

        console.log("ionViewDidEnter map page");
        this.mapActive = true;
        let page = 1;
        if (!this.sharedLocationsFetched) {
            this.sharedLocationsFetched = true;
            this.getSharedLocationsPage(page);
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
    showPrompt() {
        const prompt = this.alertCtrl.create({
            header: this.deliveryNoRouteTitle,
            message: this.deliveryNoRouteDesc,
            inputs: [],
            buttons: [
                {
                    text: 'OK',
                    handler: data => {
                    }
                }
            ]
        }).then(toast => toast.present());
    }

    clearDeliveryRoute() {
        if (this.mapData.routePolyline) {
            this.mapData.routePolyline.remove();
            this.mapData.routePolyline = null;
        }
        if (this.mapData.routeMarker) {
            this.mapData.routeMarker.remove();
            this.mapData.routeMarker = null;
        }

        for (let item in this.mapData.routeStops) {
            this.mapData.routeStops[item].remove();
        }
        this.mapData.routeStops = [];
    }

    /**
     * Delete an item from the list of cart.
     */
    getRouteInfo(delivery) {
        console.log("Get route info del", delivery);
        this.food.getRouteInfo(delivery).subscribe((resp: any) => {
            if (resp.route) {
                this.clearDeliveryRoute();
                console.log("Creating new route");
                let route = resp.route;
                console.log("Route", route);
                route.coverage = JSON.parse(route.coverage);
                let location = route.coverage.location;
                let stops = route.stops;
                let coords = [];
                for (let item in stops) {
                    let stopCord = {"lat": stops[item].address.lat, "lng": stops[item].address.long};
                    coords.push(stopCord);
                    stopCord = {"lat": stops[item].address.lat, "lng": stops[item].address.long};
                    let content = "Parada: " + stops[item].id + "<br/>Estado: " + stops[item].status;
                    let container = {};
                    let icon = "red";
                    if (stops[item].status == "completed") {
                        icon = "green";
                    }
                    container = {
                        "id": -1,
                        "user_id": -1,
                        "long": stops[item].address.long,
                        "lat": stops[item].address.lat,
                        "name": "Parada " + stops[item].id,
                        "content": content,
                        "icon": icon
                    };
                    let theMarker = this.map.createMarker(container, "routemarker");
                    this.mapData.routeStops.push(theMarker);

                }
                console.log("coords", coords);
                this.map.createRoute(coords);
                let content = "Tu entrega la tiene: " + location.runner + "<br/>Tel: " + location.runner_phone;

                let container = {
                    "id": -1,
                    "user_id": -1,
                    "long": location.long,
                    "lat": location.lat,
                    "name": location.name,
                    "content": content,
                    "icon": "blue"
                };
                console.log("container", container);
                this.mapData.routeMarker = this.map.createMarker(container, "routemarker");
                this.mapData.map.setCameraZoom(12);
                this.dismissLoader();
            } else {
                this.dismissLoader();
                this.showPrompt();
            }
            this.mapData.map.setVisible(true);

        }, (err) => {
            this.dismissLoader();
            this.api.handleError(err);
        });
    }


    getSharedLocationsPage(page: any) {
        if (this.mapActive) {
            this.locations.getSharedLocationsExternal(page).then((data:any) => {
                console.log("getSharedResults", data);
                if (data['last_page'] > page) {
                    console.log("Not last page");
                    page++;
                    this.getSharedLocationsPage(page);
                }
                this.map.updateMarkers("Shared", data['data']);
                this.locations.saveLocations(data['data']);
                if (data['last_page'] == page) {
                    console.log("Last page");
                    //                    if (!this.sharedLocationsFetched) {
                    //                        
                    //                    }
                    //this.navCtrl.parent.select(2);
                    if (data['total'] > 0) {
                        let vm = this;
                        setTimeout(function () {
                            let page = 1;
                            vm.getSharedLocationsPage(page);
                        }, 10000);
                    } else {
                        this.sharedLocationsFetched = false;
                    }
                }
            }, (err) => {
                this.buildMapStatus();
                this.api.handleError(err);
                console.log("getSharedLocation Error", err);
            });
        }

    }
    buildMapStatus() {
        if (!this.mapData.activeType) {
            this.mapData.activeType = "User";
        }
        if (this.mapData.activeType.length == 0) {
            this.mapData.activeType = "User";
        }
        let funcname = "handle" + this.mapData.activeType + "Active";
        console.log("trying function", funcname);
        if (typeof this[funcname] === "function") {
            this[funcname]();
        } else {
            this.dismissLoader();
            console.log("Type not supported", funcname);
        }
    }
    handleMeActive() {
        this.dismissLoader();
    }
    handleDeliveryActive() {
        console.log("Delivery active", this.mapData.activeDelivery);
        if (this.mapData.activeDelivery) {
            this.getRouteInfo(this.mapData.activeDelivery);
        } else {
            this.dismissLoader();
        }
    }

    getMyLocationAddressPostal() {
        this.map.getCurrentPosition().then((resp: any) => {
            console.log("Get location response", resp);
            this.map.setMarkerPosition(resp.coords.latitude, resp.coords.longitude, this.mapData.newAddressMarker);
            this.map.setCenterMap(resp.coords.latitude, resp.coords.longitude);
            this.mapData.address.lat = resp.coords.latitude;
            this.mapData.address.long = resp.coords.longitude;
            this.mapData.newAddressMarker.setVisible(true);
            this.map.triggerDragend(this.mapData.newAddressMarker);


        }).catch((error) => {
            console.log('Error getting location', error);
        });
    }

    handleAddressActive() {
        console.log("handleAddressActive", this.mapData.activeId);
        this.mapData.newAddressMarker.setDraggable(true);
        this.mapData.newAddressMarker.setVisible(true);
        if (this.mapData.activeId == "-1" || this.mapData.activeId == "0"|| this.mapData.activeId == "2"|| this.mapData.activeId == "-2") {
            console.log("Fetching poligons for merchant", this.mapData.merchantId);
            if (this.mapData.merchantId) {
                this.locations.getActivePolygons(this.mapData.merchantId).subscribe((data: any) => {
                    console.log("Active routes", data);
                    this.mapData.newAddressMarker.setVisible(true);
                    let routes = data.data;
                    this.map.createPolygons(routes);
                    this.dismissLoader();
                    this.getMyLocationAddressPostal();
                }, (err) => {
                    this.dismissLoader();
                    this.mapData.map.setVisible(true);
                    console.log("getActiveRoutes Error", err);
                    this.api.handleError(err);
                });
            } else {
                this.mapData.newAddressMarker.setVisible(true);
                this.dismissLoader();
                this.getMyLocationAddressPostal();
            }
        } else if (this.mapData.activeId == "1") {
            this.map.setMarkerPosition(this.mapData.address.lat, this.mapData.address.long, this.mapData.newAddressMarker);
            this.map.setCenterMap(this.mapData.address.lat, this.mapData.address.long);
            this.dismissLoader();
            this.map.triggerDragend(this.mapData.newAddressMarker);
        }
    }
    handleLocationActive() {
        console.log("handleAddressActive", this.mapData.activeId);
        this.mapData.newAddressMarker.setDraggable(true);
        this.mapData.newAddressMarker.setVisible(true);
        this.dismissLoader();
        this.getMyLocationAddressPostal();
    }
    async completeAddressData() {
        console.log("completeAddressData", this.mapData.address);
        let container;
        if (this.mapData.activeId == "-1" || this.mapData.activeId == "0") {
            container = {
                lat: this.mapData.address.lat,
                long: this.mapData.address.long,
                address: this.mapData.address.address,
                notes: "",
                postal: this.mapData.address.postal,
                type: "shipping"
            }
        } else {
            container = {
                lat: this.mapData.address.lat,
                long: this.mapData.address.long,
                address: this.mapData.address.address,
                id: this.mapData.address.id,
                notes: this.mapData.address.notes,
                phone: this.mapData.address.phone,
                name: this.mapData.address.name,
                postal: this.mapData.address.postal,
                type: "shipping"
            }
        }
        var addModal = await this.modalCtrl.create({
            component: AddressCreatePage,
            componentProps: container
        });
        await addModal.present();
        const {data} = await addModal.onDidDismiss();
        if (data) {
            this.navCtrl.back();
            this.clearMap();
            console.log("Process complete, address created", data);
        }
    }
    returnAddressData() {
        console.log("returnAddressData", this.mapData.address);
        let container = this.params.getParams();
        container.mapLocation = true;
        this.params.setParams(container);
        this.navCtrl.back();
        this.clearMap();
        console.log("Process complete, location saved to data object" );
    }
    locationConfirmed() {
        let params = this.params.getParams();
        if (!params) {
            params = {};
        }
        params.mapLocation = true;
        this.params.setParams(params)
        this.navCtrl.back();
        this.clearMap();
    }
    clearMap() {
        this.mapData.hideAll();
        this.mapData.activeType = null;
        this.mapData.activeId = null;
        this.mapData.activeObject = null;
    }
    cancel() {
        console.log("Cancel");
        this.mapData.newAddressMarker.setVisible(false);
        this.navCtrl.back();
    }
    handleUserActive() {
        let container = this.mapData.getItemUser(this.mapData.activeId, "Shared");
        if (container) {
            this.map.click(container);
            this.dismissLoader();
        } else {
            let holders = this.mapData.shared;
            if (holders.length > 0) {
                console.log("Setting map center");
                this.map.click(holders[0]);
                this.dismissLoader();
            } else {
                console.log("No user data defaulting to me active");
                this.mapData.activeId = -1 + "";
                this.mapData.activeType = "me";
                this.handleMeActive();
            }
        }
    }

    ngOnInit() {
    }

}
