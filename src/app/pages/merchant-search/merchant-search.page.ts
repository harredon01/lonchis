import {Component, OnInit} from '@angular/core';
import {CategoriesService} from '../../services/categories/categories.service';
import {NavController, ModalController} from '@ionic/angular';
import {ParamsService} from '../../services/params/params.service';
import {ApiService} from '../../services/api/api.service';
@Component({
    selector: 'app-merchant-search',
    templateUrl: './merchant-search.page.html',
    styleUrls: ['./merchant-search.page.scss'],
})
export class MerchantSearchPage implements OnInit {
    location: string = "n1";
    items:any[];
    constructor(public navCtrl: NavController,
        public categories: CategoriesService,
        public params: ParamsService,
        public api: ApiService,
        public modalCtrl: ModalController) {}

    ngOnInit() {
        this.getItems();
    }
    /**
       * Navigate to the detail page for this item.
       */
    getItems() {
        this.api.loader();
        let query = "merchants";
        this.categories.getCategories(query).subscribe((data: any) => {
            this.api.dismissLoader();
            console.log("after getCategories");
            this.items = data.data;
            console.log(JSON.stringify(data));
        }, (err) => {
            this.api.dismissLoader();
            // Unable to log in
            this.api.toast('INPUTS.ERROR_GET');
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
}
