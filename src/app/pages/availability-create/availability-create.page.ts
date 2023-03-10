import {Component, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {NavController, ModalController} from '@ionic/angular';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {BookingService} from '../../services/booking/booking.service';
import {ParamsService} from '../../services/params/params.service';
import {ApiService} from '../../services/api/api.service';
@Component({
    selector: 'app-availability-create',
    templateUrl: './availability-create.page.html',
    styleUrls: ['./availability-create.page.scss'],
})
export class AvailabilityCreatePage implements OnInit {
    isReadyToSave: boolean;
    item: any;
    days: any[] = [];
    submitAttempt: boolean;
    form: FormGroup;

    constructor(public navCtrl: NavController,
        public modalCtrl: ModalController,
        public api: ApiService,
        formBuilder: FormBuilder,
        public booking: BookingService,
        public translateService: TranslateService,
        public params: ParamsService) {
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
        this.form = formBuilder.group({
            range: ['', Validators.required],
            from: ['', Validators.required],
            to: ['', Validators.required],
            type: ['', Validators.required],
            object_id: ['', Validators.required],
            id: ['']
        });
        let container = this.params.getParams();
        if (container) {
            if (container.id) {
                let today = new Date();
                let fromD = new Date(today.getFullYear() + "/" + (1 + today.getMonth()) + "/" + today.getDate() + " " + container.from);
                let toD = new Date(today.getFullYear() + "/" + (1 + today.getMonth()) + "/" + today.getDate() + " " + container.to);
                let data = {
                    id: container.id,
                    range: container.range,
                    from: fromD.toISOString(),
                    to: toD.toISOString(),
                    object_id: container.object_id,
                    type: container.type,
                };
                console.log("Setting form values: ", data);
                this.isReadyToSave = true;
                this.form.setValue(data);
            } else {
                let data = {
                    id: null,
                    range: "",
                    from: "",
                    to: "",
                    object_id: container.object_id,
                    type: container.type,
                };
                console.log("Setting form values: ", data);
                this.isReadyToSave = true;
                this.form.setValue(data);
            }
        }
        // Watch the form for changes, and
        this.form.valueChanges.subscribe((v) => {
            console.log("form change", v);
            this.isReadyToSave = this.form.valid;
        });
    }

    formatAMPM(date: Date) {
        var hours = date.getHours();
        let minutes = date.getMinutes();
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        let Strminutes = minutes < 10 ? '0' + minutes : minutes;
        var strTime = hours + ':' + Strminutes + ' ' + ampm;
        return strTime;
    }
    /**
           * Send a POST request to our signup endpoint with the data
           * the user entered on the form.
           */
    saveAvailability(availability: any) {
        console.log("saveavailability");
        return new Promise((resolve, reject) => {
            console.log("Save availability", availability);
            if (availability) {
                this.api.loader();
                let today = new Date();
                let offset = today.getTimezoneOffset() / 60;
                if (availability.from.includes("-0" + offset + ":00")) {
                    availability.from = availability.from.replace("-0" + offset + ":00", "");
                } else if (availability.from.includes("Z")) {
                    availability.from = availability.from.replace("T", ' ');
                    availability.from = availability.from.split(".")[0];
                    let avail = new Date(availability.from);
                    avail = new Date(avail.getTime() - avail.getTimezoneOffset() * 60000);
                    availability.from = this.formatAMPM(avail);
                }
                if (availability.from.includes(".")) {
                    availability.from = availability.from.split(".")[0];
                }
                if (availability.to.includes("-0" + offset + ":00")) {
                    availability.to = availability.to.replace("-0" + offset + ":00", "");
                } else if (availability.to.includes("Z")) {
                    availability.to = availability.to.replace("T", ' ');
                    availability.to = availability.to.split(".")[0];
                    let avail = new Date(availability.to);
                    avail = new Date(avail.getTime() - avail.getTimezoneOffset() * 60000);
                    availability.to = this.formatAMPM(avail);
                }
                if (availability.to.includes(".")) {
                    availability.to = availability.to.split(".")[0];
                }
                this.booking.saveOrCreateAvailability(availability).subscribe((resp: any) => {
                    this.api.dismissLoader();
                    console.log("Save Address result", resp);
                    if (resp.status == "success") {
                        resolve(availability);
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
        if (!this.form.valid) {return;}
        this.saveAvailability(this.form.value).then((value) => {
            console.log("saveAvailability result", value);
            if (value) {
                this.modalCtrl.dismiss(value);
            } else {
                // Unable to log in
                this.api.toast('AVAILABILITY_CREATE.ERROR_SAVE');
            }
        }).catch((error) => {
            console.log('Error saveAvailability', error);
            this.api.toast('AVAILABILITY_CREATE.ERROR_SAVE');
        });;

    }

    ngOnInit() {
    }

}
