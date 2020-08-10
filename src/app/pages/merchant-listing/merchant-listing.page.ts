import {Component, OnInit, ViewChild} from '@angular/core';
import {NavController, ModalController, ToastController, LoadingController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {IonInfiniteScroll} from '@ionic/angular';
import {SpinnerDialog} from '@ionic-native/spinner-dialog/ngx';
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
    category: any;
    merchants: Merchant[] = [];
    categoryItems: any[] = [];
    categoriesErrorGet: string = "";
    merchantsErrorGet: string = "";
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
        public toastCtrl: ToastController,
        public modalCtrl: ModalController,
        public loadingCtrl: LoadingController,
        public translateService: TranslateService,
        public api: ApiService,
        private spinnerDialog: SpinnerDialog) {
        this.category = this.activatedRoute.snapshot.paramMap.get('categoryId');
        let paramsContainer = this.params.getParams();
        if (this.userData._user) {
            this.urlSearch = 'tabs/home/categories/' + this.category + '/merchant/';
        } else {
            this.urlSearch = 'home/' + this.category + '/merchant/';
        }
    }
    ionViewDidEnter() {
        if (document.URL.startsWith('http')) {
            let vm = this;
            setTimeout(function () {vm.dismissLoader(); console.log("Retrying closing")}, 1000);
            setTimeout(function () {vm.dismissLoader(); console.log("Retrying closing")}, 2000);
        }
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
            let toast = this.toastCtrl.create({
                message: this.categoriesErrorGet,
                duration: 3000,
                position: 'top'
            }).then(toast => toast.present());
            this.api.handleError(err);
        });
    }
    /**
     * Navigate to the detail page for this item.
     */
    openItem(item: Merchant) {
        if (this.typeSearch == "own") {
            this.params.setParams({"item": item, "category": this.category, "owner": true});
        } else {
            this.params.setParams({"item": item, "category": this.category});
        }
        console.log("Entering merchant", item);
        this.navCtrl.navigateForward(this.urlSearch + item.id);
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
        this.showLoader();
        this.geolocation.getCurrentPosition().then((resp) => {
            console.log("Getting current position after call", resp);
            // resp.coords.latitude
            // resp.coords.longitude
            this.typeSearch = "nearby";
            this.merchants = [];
            this.page = 0;
            this.location = {lat: resp.coords.latitude, long: resp.coords.longitude, category: this.category};
            this.dismissLoader();
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
        this.showLoader();
        this.page++;

        let searchObj = null
        if (this.typeSearch == "category") {
            let query = "page=" + this.page + "&category_id=" + this.category;
            searchObj = this.merchantsServ.getMerchants(query);
        } else if (this.typeSearch == "text") {
            searchObj = this.merchantsServ.searchMerchants(this.textSearch + "&page=" + this.page);
        } else if (this.typeSearch == "nearby") {
            searchObj = this.merchantsServ.getNearbyMerchants(this.location);
        } else if (this.typeSearch == "own") {
            let query = "page=" + this.page + "&owner_id=" + this.userData._user.id;
            searchObj = this.merchantsServ.getMerchants(query);
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
                let container = new Merchant(results[one]);
                this.merchants.push(container);
            }
            if (event) {
                event.target.complete();
            }
            this.dismissLoader();
        }, (err) => {
            console.log("Error getMerchantsFromServer");
            this.dismissLoader();
            // Unable to log in
            let toast = this.toastCtrl.create({
                message: this.merchantsErrorGet,
                duration: 3000,
                position: 'top'
            }).then(toast => toast.present());
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
    categoryFilterChange() {
        this.page = 0;
        this.getMerchants(null);
    }

    ngOnInit() {

        this.translateService.get('CATEGORIES.ERROR_GET').subscribe((value) => {
            this.categoriesErrorGet = value;
        });
        this.translateService.get('CATEGORIES.ERROR_GET').subscribe((value) => {
            this.merchantsErrorGet = value;
        });
        this.merchants = [];
        this.getMerchants(null);
        this.getItems();
    }

}
