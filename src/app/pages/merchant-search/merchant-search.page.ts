import {Component, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {CategoriesService} from '../../services/categories/categories.service';
import {NavController, ModalController, ToastController, LoadingController} from '@ionic/angular';
import {SpinnerDialog} from '@ionic-native/spinner-dialog/ngx';
import {ParamsService} from '../../services/params/params.service';
import {ApiService} from '../../services/api/api.service';
@Component({
    selector: 'app-merchant-search',
    templateUrl: './merchant-search.page.html',
    styleUrls: ['./merchant-search.page.scss'],
})
export class MerchantSearchPage implements OnInit {
    location: string = "n1";
    categoriesErrorGet:string = "";
    items:any[];
    constructor(public navCtrl: NavController,
        public categories: CategoriesService,
        public params: ParamsService,
        public toastCtrl: ToastController,
        public api: ApiService,
        public modalCtrl: ModalController,
        public loadingCtrl: LoadingController,
        public translateService: TranslateService,
        private spinnerDialog: SpinnerDialog) {}

    ngOnInit() {
        this.translateService.get('CATEGORIES.ERROR_GET').subscribe((value) => {
            this.categoriesErrorGet = value;
        });
        this.getItems();
    }
    /**
       * Navigate to the detail page for this item.
       */
    getItems() {
        this.showLoader();
        let query = "merchants";
        this.categories.getCategories(query).subscribe((data: any) => {
            this.dismissLoader();
            console.log("after getCategories");
            this.items = data.data;
            console.log(JSON.stringify(data));
        }, (err) => {
            this.dismissLoader();
            // Unable to log in
            let toast = this.toastCtrl.create({
                message: this.categoriesErrorGet,
                duration: 3000,
                position: 'top'
            }).then(toast => toast.present());
            this.api.handleError(err);
        });
    }
    searchItems(ev: any) {
    // set val to the value of the searchbar
    const val = ev.target.value;
    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {

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
                message: this.categoriesErrorGet,
                backdropDismiss: true
            }).then(toast => toast.present());
        } else {
            this.spinnerDialog.show(null, this.categoriesErrorGet);
        }
    }

}
