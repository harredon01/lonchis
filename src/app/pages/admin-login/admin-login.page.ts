import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {NavController, ModalController, NavParams} from '@ionic/angular';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../../services/auth/auth.service';
import {ApiService} from '../../services/api/api.service';
@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.page.html',
  styleUrls: ['./admin-login.page.scss'],
})
export class AdminLoginPage implements OnInit {

    isReadyToSave: boolean;
    item: any;
    submitAttempt: boolean;
    submitAttempt2: boolean;
    passwordError: boolean = false;
    submitEmail: boolean = true;
    form: FormGroup;
    form2: FormGroup;

    constructor(public navCtrl: NavController,
        public modalCtrl: ModalController,
        formBuilder: FormBuilder,
        private cdr: ChangeDetectorRef,
        private auth: AuthService,
        public api: ApiService,
        public navParams: NavParams) {
        this.submitAttempt = false;
        this.form = formBuilder.group({
            email: ['', Validators.compose([Validators.maxLength(100), Validators.pattern('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-.]*\.[a-zA-Z]{2,}'), Validators.required])],
            email2: ['', Validators.compose([Validators.maxLength(100), Validators.pattern('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-.]*\.[a-zA-Z]{2,}'), Validators.required])],
            password: ['', Validators.required],
        });
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
    submitChange(passwordData: any) {

        this.cdr.detectChanges();
        if (!this.form.valid) {return;}

        return new Promise((resolve, reject) => {
            console.log("Save Address", passwordData);
            if (passwordData) {
                this.api.loader();
                this.auth.adminLogin(passwordData).subscribe((resp: any) => {
                    this.api.dismissLoader();
                    console.log("Save Address result", resp);
                    if (resp.status == "success") {
                        resolve(resp.token);
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
        this.modalCtrl.dismiss(null);
    }

    /**
     * The user is done and wants to create the item, so return it
     * back to the presenter.
     */
    done() {
        this.passwordError = false;
        this.submitAttempt = true;
        let container = this.form.value;
        console.log("saveAddress");
        if (!this.form.valid) {return;}
        this.submitChange(container).then((value: any) => {
            console.log("update password result", value);
            if (value) {
                this.modalCtrl.dismiss(value);
            } else {
                // Unable to log in
                this.api.toast('FORGOT_PASS.ERROR_SAVE');
            }
        }).catch((error) => {
            console.log('Error saveAddress', error);
            this.api.toast('FORGOT_PASS.ERROR_SAVE');
        });;

    }

    ngOnInit() {
    }
    showPassForm() {
        this.submitEmail = false;
    }
    showEmailForm() {
        this.submitEmail = true;
        this.form2.patchValue({email: this.form.get('email').value});
    }

}
