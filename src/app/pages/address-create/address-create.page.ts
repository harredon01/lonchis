import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import {NavController, ModalController, NavParams } from '@ionic/angular';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AddressesService} from '../../services/addresses/addresses.service';
import {UserDataService} from '../../services/user-data/user-data.service';
import {ApiService} from '../../services/api/api.service';
@Component({
  selector: 'app-address-create',
  templateUrl: './address-create.page.html',
  styleUrls: ['./address-create.page.scss'],
})
export class AddressCreatePage implements OnInit {

  isReadyToSave: boolean;
    item: any;
    submitAttempt: boolean;
    form: FormGroup;

    constructor(public navCtrl: NavController,
        public modalCtrl: ModalController,
        formBuilder: FormBuilder,
        private cdr: ChangeDetectorRef,
        private userData: UserDataService,
        public api: ApiService,
        public addresses: AddressesService,
        public navParams: NavParams) {
        this.submitAttempt = false;
        this.form = formBuilder.group({
            address: ['', Validators.required],
            notes: ['', Validators.required],
            postal: ['', Validators.required],
            address_id: [''],
            city_id: ['', Validators.required],
            region_id: ['', Validators.required],
            country_id: ['', Validators.required],
            phone: ['', Validators.required],
            name: ['', Validators.required],
            lat: [''],
            long: [''],
            type: ['', Validators.required],
        });
        let address_id: string = navParams.get('id');
        if (address_id) {
            let container = {
                city_id: 524,
                region_id: 11,
                country_id: 1,
                address_id: address_id,
                address: navParams.get('address'),
                notes: navParams.get('notes'),
                postal: navParams.get('postal'),
                phone: navParams.get('phone'),
                name: navParams.get('name'),
                lat: navParams.get('lat'),
                long: navParams.get('long'),
                type: navParams.get('type'),
            };
            console.log("Setting form values: ", container);
            this.isReadyToSave = true;
            this.form.setValue(container);

        } else {
            let address = "";
            if (navParams.get('address')) {
                address = navParams.get('address');
            }
            let notes = "";
            if (navParams.get('notes')) {
                notes = navParams.get('notes');
            }
            let postal = "";
            if (navParams.get('postal')) {
                postal = navParams.get('postal');
            }
            let lat = "";
            if (navParams.get('lat')) {
                lat = navParams.get('lat');
            }
            let long = "";
            if (navParams.get('long')) {
                long = navParams.get('long');
            }
            let container = {
                city_id: 524,
                region_id: 11,
                country_id: 1,
                address_id: "",
                address: address,
                notes: notes,
                postal: postal,
                lat: lat,
                phone: this.userData._user.cellphone,
                name: "",
                long: long,
                type: navParams.get('type'),
            };
            console.log("Setting form values2: ", container);
            this.form.setValue(container);
        }


        // Watch the form for changes, and
        this.form.valueChanges.subscribe((v) => {
            console.log("form change", v);
            this.isReadyToSave = this.form.valid;
        });
    }

    ionViewDidLoad() {

    }
    /**
           * Send a POST request to our signup endpoint with the data
           * the user entered on the form.
           */
    saveAddress(address: any) {
        return new Promise((resolve, reject) => {
            console.log("Save Address", address);
            if (address) {
                this.api.loader();
                this.addresses.saveAddress(address).subscribe((resp: any) => {
                    this.api.dismissLoader();
                    console.log("Save Address result", resp);
                    if (resp.status == "success") {
                        resolve(resp.address);
                    } else {
                        resolve(null);
                    }
                }, (err) => {
                    this.api.dismissLoader();
                    reject(err);
                });
            } else {
                resolve(null);
            }

        });

    }


    /**
     * The user cancelled, so we dismiss without sending data back.
     */
    cancel() {
        this.modalCtrl.dismiss();
    }

    /**
     * The user is done and wants to create the item, so return it
     * back to the presenter.
     */
    done() {
        this.submitAttempt = true;
        this.cdr.detectChanges();
        if (!this.form.valid) {return;}
        this.saveAddress(this.form.value).then((value) => {
            console.log("saveAddress result", value);
            if (value) {
                this.modalCtrl.dismiss(value);
            } else {
                // Unable to log in
                this.api.toast('ADDRESS_FIELDS.ERROR_SAVE');
            }
        }).catch((error) => {
            console.log('Error saveAddress', error);
            this.api.toast('ADDRESS_FIELDS.ERROR_SAVE');
        });;

    }

  ngOnInit() {
  }

}
