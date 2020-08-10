import {Component, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {NavController, ToastController, ModalController, NavParams, LoadingController} from '@ionic/angular';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {SpinnerDialog} from '@ionic-native/spinner-dialog/ngx';
import {BookingService} from '../../services/booking/booking.service';

@Component({
    selector: 'app-availability-create',
    templateUrl: './availability-create.page.html',
    styleUrls: ['./availability-create.page.scss'],
})
export class AvailabilityCreatePage implements OnInit {
    isReadyToSave: boolean;
    item: any;
    days: any[] = [];
    loading: any;
    submitAttempt: boolean;
    form: FormGroup;
    private availabilityErrorStringSave: string;

    constructor(public navCtrl: NavController,
        public modalCtrl: ModalController,
        formBuilder: FormBuilder,
        public toastCtrl: ToastController,
        public booking: BookingService,
        public loadingCtrl: LoadingController,
        public translateService: TranslateService,
        public navParams: NavParams,
        private spinnerDialog: SpinnerDialog) {
        this.days = []
        this.submitAttempt = false;
        let vm = this;
        this.translateService.get('DAYS.MONDAY').subscribe((value) => {
            let container = {"name": value, "value": "monday"};
            vm.days.push(container);
        });
        this.translateService.get('DAYS.TUESDAY').subscribe((value) => {
            let container = {"name": value, "value": "tuesday"};
            vm.days.push(container);
        });
        this.translateService.get('DAYS.WEDNESDAY').subscribe((value) => {
            let container = {"name": value, "value": "wednesday"};
            vm.days.push(container);
        });
        this.translateService.get('DAYS.THURSDAY').subscribe((value) => {
            let container = {"name": value, "value": "thursday"};
            vm.days.push(container);
        });
        this.translateService.get('DAYS.FRIDAY').subscribe((value) => {
            let container = {"name": value, "value": "friday"};
            vm.days.push(container);
        });
        this.translateService.get('DAYS.SATURDAY').subscribe((value) => {
            let container = {"name": value, "value": "saturday"};
            vm.days.push(container);
        });
        this.translateService.get('DAYS.SUNDAY').subscribe((value) => {
            let container = {"name": value, "value": "sunday"};
            vm.days.push(container);
        });
        this.translateService.get('AVAILABILITY_CREATE.ERROR_SAVE').subscribe((value) => {
            vm.availabilityErrorStringSave = value;
        });
        this.form = formBuilder.group({
            range: ['', Validators.required],
            from: ['', Validators.required],
            to: ['', Validators.required],
            type: ['', Validators.required],
            object_id: ['']
        });
        let address_id: string = navParams.get('id');
        if (address_id) {
            let container = {
                range: navParams.get('range'),
                from: navParams.get('from'),
                to: navParams.get('to'),
                object_id: navParams.get('object_id'),
                type: navParams.get('type'),
            };
            console.log("Setting form values: ", container);
            this.isReadyToSave = true;
            this.form.setValue(container);

        } else {
            let container = {
                range: "",
                from: "",
                to: "",
                object_id: navParams.get('object_id'),
                type: navParams.get('type'),
            };
            console.log("Setting form values: ", container);
            this.isReadyToSave = true;
            this.form.setValue(container);
        }
        // Watch the form for changes, and
        this.form.valueChanges.subscribe((v) => {
            console.log("form change", v);
            this.isReadyToSave = this.form.valid;
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
    /**
           * Send a POST request to our signup endpoint with the data
           * the user entered on the form.
           */
    saveAvailability(availability: any) {
        this.submitAttempt = true;
        console.log("saveavailability");
        if (!this.form.valid) {return;}

        return new Promise((resolve, reject) => {
            console.log("Save availability", availability);
            if (availability) {
                this.showLoader();
                
                this.booking.saveOrCreateAvailability(availability).subscribe((resp: any) => {
                    this.dismissLoader();
                    console.log("Save Address result", resp);
                    if (resp.status == "success") {
                        resolve(availability);
                    } else {
                        resolve(null);
                    }
                }, (err) => {
                    this.dismissLoader();
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
        if (!this.form.valid) {return;}
        this.saveAvailability(this.form.value).then((value) => {
            console.log("saveAvailability result", value);
            if (value) {
                this.modalCtrl.dismiss(value);
            } else {
                // Unable to log in
                this.toastCtrl.create({
                    message: this.availabilityErrorStringSave,
                    duration: 3000,
                    position: 'top'
                }).then(toast => toast.present());
            }
        }).catch((error) => {
            console.log('Error saveAvailability', error);
            this.toastCtrl.create({
                message: this.availabilityErrorStringSave,
                duration: 3000,
                position: 'top'
            }).then(toast => toast.present());
        });;

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

    ngOnInit() {
    }

}
