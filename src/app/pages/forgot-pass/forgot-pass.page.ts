import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {NavController, ToastController, ModalController, NavParams, LoadingController} from '@ionic/angular';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {SpinnerDialog} from '@ionic-native/spinner-dialog/ngx';
import {AuthService} from '../../services/auth/auth.service';
@Component({
    selector: 'app-forgot-pass',
    templateUrl: './forgot-pass.page.html',
    styleUrls: ['./forgot-pass.page.scss'],
})
export class ForgotPassPage implements OnInit {

    isReadyToSave: boolean;
    item: any;
    forgotErrorString: any;
    loading: any;
    submitAttempt: boolean;
    submitAttempt2: boolean;
    passwordError: boolean = false;
    submitEmail: boolean = true;
    form: FormGroup;
    form2: FormGroup;
    private passwordErrorStringSave: string;

    constructor(public navCtrl: NavController,
        public modalCtrl: ModalController,
        formBuilder: FormBuilder,
        private cdr: ChangeDetectorRef,
        private auth: AuthService,
        public toastCtrl: ToastController,
        public loadingCtrl: LoadingController,
        public translateService: TranslateService,
        public navParams: NavParams,
        private spinnerDialog: SpinnerDialog) {
        this.submitAttempt = false;
        this.translateService.get('FORGOT_PASS.ERROR_SAVE').subscribe((value) => {
            this.passwordErrorStringSave = value;
        });
        this.translateService.get('LOGIN.FORGOT_ERROR').subscribe((value) => {
            this.forgotErrorString = value;
        });
        this.form = formBuilder.group({
            email: ['', Validators.compose([Validators.maxLength(100), Validators.pattern('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-.]*\.[a-zA-Z]{2,}'), Validators.required])],
            token: ['', Validators.required],
            password: ['', Validators.required],
            password_confirmation: ['', Validators.required],
        });
        this.form2 = formBuilder.group({
            email: ['', Validators.compose([Validators.maxLength(100), Validators.pattern('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-.]*\.[a-zA-Z]{2,}'), Validators.required])],
        });
        // Watch the form for changes, and
        this.form.valueChanges.subscribe((v) => {
            console.log("form change", v);
            this.isReadyToSave = this.form.valid;
        });
    }

    ionViewDidLoad() {

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
    submitChange(passwordData: any) {

        this.cdr.detectChanges();
        if (!this.form.valid) {return;}

        return new Promise((resolve, reject) => {
            console.log("Save Address", passwordData);
            if (passwordData) {
                this.showLoader();
                this.auth.updateForgotPassword(passwordData).subscribe((resp: any) => {
                    this.dismissLoader();
                    console.log("Save Address result", resp);
                    if (resp.status == "success") {
                        resolve(resp.access_token);
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
        if (container.password != container.password_confirmation) {
            this.passwordError = true;
            return;
        }
        console.log("saveAddress");
        if (!this.form.valid) {return;}
        this.submitChange(container).then((value: any) => {
            console.log("update password result", value);
            if (value) {
                this.modalCtrl.dismiss(value);
            } else {
                // Unable to log in
                this.toastCtrl.create({
                    message: this.passwordErrorStringSave,
                    duration: 3000,
                    position: 'top'
                }).then(toast => toast.present());
            }
        }).catch((error) => {
            console.log('Error saveAddress', error);
            this.toastCtrl.create({
                message: this.passwordErrorStringSave,
                duration: 3000,
                position: 'top'
            }).then(toast => toast.present());
        });;

    }
    getToken() {
        this.submitAttempt2 = true;
        let container = this.form2.value;
        if (!this.form2.valid) {return;}
        this.auth.requestForgotPassword(container).subscribe((resp: any) => {
            console.log("Resp", resp);
            if (resp.status == "success") {
                this.submitEmail = false;
                this.form.patchValue({email: container.email});
            } else {
                this.toastCtrl.create({
                    message: this.forgotErrorString,
                    duration: 3000,
                    position: 'top'
                }).then(toast => toast.present());
            }
            console.log("requestForgotPassword result", resp);
        }, (err) => {
            console.log("requestForgotPassword err", err);
            this.toastCtrl.create({
                message: this.forgotErrorString,
                duration: 3000,
                position: 'top'
            }).then(toast => toast.present());
        });
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
    showPassForm() {
        this.submitEmail = false;
    }
    showEmailForm() {
        this.submitEmail = true;
        this.form2.patchValue({email: this.form.get('email').value});
    }

}
