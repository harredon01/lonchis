import {Component, OnInit, ViewChild} from '@angular/core';
import {NavController, ModalController} from '@ionic/angular';
import {IonInfiniteScroll} from '@ionic/angular';
import {ActivatedRoute} from '@angular/router';
import {Geolocation} from '@ionic-native/geolocation/ngx';
import {MapDataService} from '../../services/map-data/map-data.service';
import {SearchFilteringPage} from '../search-filtering/search-filtering.page';
import {MerchantsService} from '../../services/merchants/merchants.service';
import {ParamsService} from '../../services/params/params.service';
import {UserDataService} from '../../services/user-data/user-data.service';
import {CategoriesService} from '../../services/categories/categories.service';
import {Merchant} from '../../models/merchant';
import {ApiService} from '../../services/api/api.service';
import {Router} from '@angular/router';
@Component({
    selector: 'app-merchant-listing',
    templateUrl: './merchant-listing.page.html',
    styleUrls: ['./merchant-listing.page.scss'],
})
export class MerchantListingPage implements OnInit {
    @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
    location: any;
    typeSearch: string = "category";
    urlSearch: string = "";
    totalResults: any;
    textSearch: string = "";
    purpose: string = "";
    showAddress: boolean = false;
    category: any;
    merchants: Merchant[] = [];
    categoryItems: any[] = [];
    page: any = 0;
    loadMore: boolean;

    constructor(public navCtrl: NavController,
        private activatedRoute: ActivatedRoute,
        public params: ParamsService,
        public userData: UserDataService,
        public geolocation: Geolocation,
        public mapData: MapDataService,
        public categories: CategoriesService,
        public merchantsServ: MerchantsService,
        public router: Router,
        public modalCtrl: ModalController,
        public api: ApiService) {
        this.category = this.activatedRoute.snapshot.paramMap.get('categoryId');
        let container = this.params.getParams();
        if (container) {
            if (container.purpose) {
                if (container.purpose=='none') {
                    this.purpose = "";
                } else {
                    this.purpose = container.purpose;
                }
                
            }
            if (container.showAddress) {
                this.showAddress = container.showAddress;
            }
        }
        if (this.userData._user) {
            let activeView = this.router.url;
            console.log("getActive", activeView);
            if (activeView.includes("settings")) {
                this.typeSearch = "own";
                this.urlSearch = 'tabs/settings/merchants/';
            } else {
                this.urlSearch = 'tabs/home/categories/' + this.category + '/merchant/';
            }

        } else {
            this.urlSearch = 'home/' + this.category + '/merchant/';
        }
    }
    ionViewDidEnter() {
        if (document.URL.startsWith('http')) {
            let vm = this;
            setTimeout(function () {vm.api.dismissLoader(); console.log("Retrying closing")}, 1000);
            setTimeout(function () {vm.api.dismissLoader(); console.log("Retrying closing")}, 2000);
        }
    }
    onError(item) {
        console.log("IMG ERROR");
        item.icon = "/assets/avatar/Bentley.png";
    }
    async filter() {
        let container;
        container = {
            lat: "",
            long: "",
            address: "",
            id: "",
            phone: "",
            name: "",
            postal: "",
            notes: "",
            type: "billing"
        }
        let addModal = await this.modalCtrl.create({
            component: SearchFilteringPage,
            componentProps: container
        });
        await addModal.present();
        const {data} = await addModal.onDidDismiss();
        if (data) {
            this.getMerchants(null);
        }
    }
    getItems() {
        let query = "merchants";
        this.categories.getCategories(query).subscribe((data: any) => {
            console.log("after getCategories");
            this.categoryItems = data.categories;
            this.category = parseInt(this.activatedRoute.snapshot.paramMap.get('categoryId'));
            console.log(JSON.stringify(data));
            //this.cdr.detectChanges();
        }, (err) => {
            // Unable to log in
            this.api.toast('INPUTS.ERROR_GET');
            this.api.handleError(err);
        });
    }
    /**
     * Navigate to the detail page for this item.
     */
    openItem(item: Merchant) {
        let params = null;
        if (this.purpose == 'book') {
            params = {
                "availabilities": item.availabilities,
                "type": "Merchant",
                "objectId": item.id,
                "objectName": item.name,
                "objectDescription": item.description,
                "objectIcon": item.icon,
                "expectedPrice": item.unit_cost
            }
        } else if (this.purpose == 'external_book') {
            params = this.params.getParams();
            params.objectId = item.id,
            params.objectName = item.name,
            params.objectDescription = item.description,
            params.objectIcon = item.icon,
            this.purpose = 'book';
        } else {
            if (this.typeSearch == "own") {
                params = {"item": item, "category": this.category, "owner": true};
            } else {
                params = {"item": item, "category": this.category};
            }
        }
        this.params.setParams(params);
        console.log("Entering merchant", item);
        if(this.purpose.length > 0 ){
             this.navCtrl.navigateForward(this.urlSearch + item.id + "/" + this.purpose);
        } else {
            this.navCtrl.navigateForward(this.urlSearch + item.id);
        }
    }
    /**
     * Navigate to the detail page for this item.
     */
    createItem() {
        if (this.typeSearch == "own") {
            this.navCtrl.navigateForward(this.urlSearch + "create-merchant");
        }
        console.log("Creating merchant");
    }
    /**
     * Navigate to the detail page for this item.
     */
    searchNearby() {
        this.api.loader();
        this.geolocation.getCurrentPosition().then((resp) => {
            console.log("Getting current position after call", resp);
            // resp.coords.latitude
            // resp.coords.longitude
            this.typeSearch = "nearby";
            this.merchants = [];
            this.page = 0;
            this.location = {lat: resp.coords.latitude, long: resp.coords.longitude, category: this.category};
            this.api.dismissLoader();
            this.getMerchants(null);
        }).catch((error) => {
            console.log('Error getting location', error);

        });
    }
    /**
     * Prompt the user to add a new item. This shows our ItemCreatePage in a
     * modal and then adds the new item to our data source if the user created one.
     */
    changeSearchAddress() {
        this.mapData.hideAll();
        this.mapData.activeType = "Location";
        this.mapData.activeId = "-1";
        this.mapData.merchantId = null;
        this.navCtrl.navigateForward('tabs/map');
    }
    /**
     * Navigate to the detail page for this item.
     */
    searchText() {
        if (this.textSearch.length > 0) {
            this.merchants = [];
            this.page = 0;
            this.typeSearch = "text";
            this.getMerchants(null);
        }
    }
    searchCategory() {
        this.merchants = [];
        this.page = 0;
        this.typeSearch = "category";
        this.getMerchants(null);
    }
    getMerchants(event) {
        this.api.loader();
        this.page++;

        let searchObj = null
        if (this.typeSearch == "category") {
            let query = "includes=availabilities&page=" + this.page + "&category_id=" + this.category;
            searchObj = this.merchantsServ.getMerchants(query);
        } else if (this.typeSearch == "text") {
            searchObj = this.merchantsServ.searchMerchants(this.textSearch + "&includes=availabilities&page=" + this.page);
        } else if (this.typeSearch == "nearby") {
            this.location.includes = 'availabilities';
            searchObj = this.merchantsServ.getNearbyMerchants(this.location);
        } else if (this.typeSearch == "own") {
            let query = "includes=availabilities&page=" + this.page + "&owner_id=" + this.userData._user.id;
            searchObj = this.merchantsServ.getMerchantsPrivate(query);
        }
        searchObj.subscribe((data: any) => {
            if (this.page == 1) {
                this.merchants = [];
            }
            data.data = this.merchantsServ.prepareObjects(data.data);
            if (data.total) {
                this.totalResults = data.total;
            }
            let results = data.data;
            if (data.page == data.last_page) {
                this.infiniteScroll.disabled = true;
            }
            for (let one in results) {
                if (results[one].merchant_id) {
                    results[one].id = results[one].merchant_id;
                }
                if (results[one].categorizable_id) {
                    results[one].id = results[one].categorizable_id;
                }
                let container = new Merchant(results[one]);
                this.merchants.push(container);
            }
            if (event) {
                event.target.complete();
            }
            this.api.dismissLoader();
        }, (err) => {
            console.log("Error getMerchantsFromServer");
            this.api.dismissLoader();
            // Unable to log in
            this.api.toast('INPUTS.ERROR_GET');
            this.api.handleError(err);
        });
    }

    categoryFilterChange() {
        this.page = 0;
        this.getMerchants(null);
    }

    ngOnInit() {
        this.merchants = [];
        this.getMerchants(null);
        this.getItems();
    }

}
