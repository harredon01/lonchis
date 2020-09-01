import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {NavController, ModalController} from '@ionic/angular';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ParamsService} from '../../services/params/params.service';
import {ApiService} from '../../services/api/api.service';
import {LocationsService} from '../../services/locations/locations.service';
import {UserDataService} from '../../services/user-data/user-data.service';
import {MapDataService} from '../../services/map-data/map-data.service';
import {MerchantsService} from '../../services/merchants/merchants.service';
import {Merchant} from '../../models/merchant';

@Component({
  selector: 'app-new-merchant',
  templateUrl: './new-merchant.page.html',
  styleUrls: ['./new-merchant.page.scss'],
})
export class NewMerchantPage implements OnInit {
    isReadyToSave: boolean;
    locationLoaded: boolean = false;
    item: any;
    merchant: Merchant;
    type: any;
    typeSelected = "";

    countries: any[] = [];
    regions: any[] = [];
    cities: any[] = [];
    submitAttempt: boolean;
    form: FormGroup;
    constructor(public navCtrl: NavController,
        public modalCtrl: ModalController,
        public api: ApiService,
        formBuilder: FormBuilder,
        public mapData: MapDataService,
        private cdr: ChangeDetectorRef,
        public merchants: MerchantsService,
        public locations: LocationsService,
        public params: ParamsService,
        public userData: UserDataService) {
        this.submitAttempt = false;
        this.getCountries();
        this.form = formBuilder.group({
            id: [''],
            virtual_meeting: [''],
            virtual_provider: [''],
            type: ['', Validators.required],
            name: ['', Validators.required],
            description: ['', Validators.required],
            email: ['', Validators.required],
            telephone: ['', Validators.required],
            unit_cost: [''],
            booking_requires_auth: [''],
            max_per_hour: [''],
            city_id: ['', Validators.required],
            region_id: ['', Validators.required],
            country_id: ['', Validators.required],
        });
        let container: any = this.params.getParams();
        let merchantLoaded = false;
        if (container) {
            let editingMerchant: any = container.merchant;
            this.merchant = container.merchant;
            if (editingMerchant) {
                let container = {
                    id: editingMerchant.id,
                    type: editingMerchant.type,
                    name: editingMerchant.name,
                    description: editingMerchant.description,
                    email: editingMerchant.email,
                    telephone: editingMerchant.telephone,
                    unit_cost: editingMerchant.unit_cost,
                    lat: editingMerchant.lat,
                    long: editingMerchant.long,
                    city_id: editingMerchant.city_id,
                    region_id: editingMerchant.region_id,
                    country_id: editingMerchant.country_id,
                };
                this.selectCountry(editingMerchant.region_id, editingMerchant.city_id);
                this.typeSelected = editingMerchant.type;
                let attributes = editingMerchant.attributes;
                if (attributes.booking_requires_auth) {
                    container['booking_requires_auth'] = attributes.booking_requires_auth;
                } else {
                    container['booking_requires_auth'] = false;
                }
                if (attributes.virtual_meeting) {
                    container['virtual_meeting'] = attributes.virtual_meeting;
                } else {
                    container['virtual_meeting'] = false;
                }
                if (attributes.virtual_provider) {
                    container['virtual_provider'] = attributes.virtual_provider;
                } else {
                    container['virtual_provider'] = "";
                }
                if (attributes.max_per_hour) {
                    container['max_per_hour'] = attributes.max_per_hour;
                } else {
                    container['max_per_hour'] = false;
                }
                console.log("Setting form values: ", container);
                this.isReadyToSave = true;
                this.form.setValue(container);
                merchantLoaded = true;
            }
        }
        if (!merchantLoaded) {

            let phone = "";
            if(this.userData._user.cellphone.length > 0 && this.userData._user.cellphone!="11"){
                phone = this.userData._user.cellphone;
            }
            let container = {
                id: "",
                type: "",
                name: '',
                description: '',
                email: this.userData._user.email,
                telephone: phone,
                unit_cost: '',
                booking_requires_auth: false,
                max_per_hour: '',
                city_id: '',
                region_id: '',
                virtual_meeting: '',
                virtual_provider: '',
                country_id: 1,
            };
            console.log("Setting form values2: ", container);
            this.form.setValue(container);
            this.selectCountry(null, null);
        }


        // Watch the form for changes, and
        this.form.valueChanges.subscribe((v) => {
            console.log("form change", v);
            this.isReadyToSave = this.form.valid;
        });
    }

    getCountries() {
        this.locations.getCountries().subscribe((resp: any) => {
            this.countries = resp.data;
            this.form.patchValue({country_id: 1});
            console.log("getCountries result", resp);

        }, (err) => {

        });
    }
    selectCountry(region, city) {
        this.api.loader();
        console.log("selectCountry", region, city);
        this.locations.getRegionsCountry(this.form.get('country_id').value).subscribe((resp: any) => {
            this.api.dismissLoader();
            if (region) {
                this.form.patchValue({region_id: region});
                this.cdr.detectChanges();
                this.selectRegion(city);
            }

            console.log("getRegionsCountry result", resp);
            this.regions = resp.data;
        }, (err) => {
            this.api.dismissLoader();
        });
    }
    selectRegion(city) {
        this.api.loader();
        this.locations.getCitiesRegion(this.form.get('region_id').value).subscribe((resp: any) => {
            this.api.dismissLoader();
            console.log("getCitiesRegion result", resp);
            this.cities = resp.data;
            if (city) {
                this.form.patchValue({city_id: city});
            }
            this.cdr.detectChanges();
        }, (err) => {
            this.api.dismissLoader();
        });
    }
    /**
           * Send a POST request to our signup endpoint with the data
           * the user entered on the form.
           */
    saveMerchant(merchant: any) {
        this.submitAttempt = true;
        console.log("saveMerchant", merchant);
        if (!this.form.valid) {return;}
        this.api.loader();
        this.merchants.saveMerchant(merchant).subscribe((resp: any) => {
            this.api.dismissLoader();
            console.log("Save Address result", resp);
            if (resp.status == "success") {
                let container = {type:"Merchant",objectId:resp.object.id};
                this.params.setParams(container);
                this.navCtrl.back();
                this.navCtrl.navigateForward("tabs/settings/merchants/"+resp.object.id);
            } else {
                this.api.toast('MERCHANT_CREATE.ERROR_SAVE');
            }
        }, (err) => {
            this.api.dismissLoader();
            this.api.toast('MERCHANT_CREATE.ERROR_SAVE');
        });
    }
    /**
     * The user cancelled, so we dismiss without sending data back.
     */
    cancel() {
        this.navCtrl.back();
    }

    /**
     * The user is done and wants to create the item, so return it
     * back to the presenter.
     */
    done() {
        this.saveMerchant(this.form.value);
    }

    ngOnInit() {
    }

}
