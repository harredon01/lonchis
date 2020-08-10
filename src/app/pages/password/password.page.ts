import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import {NavController, ToastController, LoadingController} from '@ionic/angular';
import {SpinnerDialog} from '@ionic-native/spinner-dialog/ngx';

import {AuthService} from '../../services/auth/auth.service';
import {ApiService} from '../../services/api/api.service';
@Component({
    selector: 'app-password',
    templateUrl: './password.page.html',
    styleUrls: ['./password.page.scss'],
})
export class PasswordPage implements OnInit {
    isReadyToSave: boolean;

    form: FormGroup;
    submitAttempt: boolean = false;
    passwordError: boolean = false;
    private passwordErrorStringSave: string;
    private passwordSuccessStringSave: string;
    private passwordUpdateStartString: string;
    loading: any;

    constructor(
        formBuilder: FormBuilder,
        public toastCtrl: ToastController,
        public navCtrl: NavController,
        public auth: AuthService,
        public loadingCtrl: LoadingController,
        public api: ApiService,
        public translateService: TranslateService,
        private spinnerDialog: SpinnerDialog) {
        this.translateService.get('PASSWORD_UPDATE.ERROR_UPDATE').subscribe((value) => {
            this.passwordErrorStringSave = value;
        });
        this.translateService.get('PASSWORD_UPDATE.SUCCESS_UPDATE').subscribe((value) => {
            this.passwordSuccessStringSave = value;
        });
        this.translateService.get('PASSWORD_UPDATE.UPDATE_START').subscribe((value) => {
            this.passwordUpdateStartString = value;
        });
        this.form = formBuilder.group({
            password_confirmation: ['', Validators.required],
            old_password: ['', Validators.required],
            password: ['', Validators.required],
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
    savePassword() {
        this.submitAttempt = true;
        this.passwordError = false;
        console.log("Updating password");
        if (!this.form.valid) {return;}
        console.log("Password update valid");
        if (this.form.get('password').value != this.form.get('password_confirmation').value) {
            this.passwordError = true;
            return;
        }
        console.log("Password match");
        this.showLoader();
        this.auth.updatePassword(this.form.value).subscribe((resp: any) => {
            this.dismissLoader();
            console.log("savePassword result", resp);
            if (resp.status == "success") {
                let toast = this.toastCtrl.create({
                    message: this.passwordSuccessStringSave,
                    duration: 3000,
                    position: 'top'
                }).then(toast => toast.present());
                this.navCtrl.navigateRoot('tabs');
            } else {
                let toast = this.toastCtrl.create({
                    message: this.passwordErrorStringSave,
                    duration: 3000,
                    position: 'top'
                }).then(toast => toast.present());
            }
        }, (err) => {
            this.dismissLoader();
            let toast = this.toastCtrl.create({
                message: this.passwordErrorStringSave,
                duration: 3000,
                position: 'top'
            }).then(toast => toast.present());
            this.api.handleError(err);
        });
    }

    showLoader() {
        if (document.URL.startsWith('http')) {
            this.loading = this.loadingCtrl.create({
                spinner: 'crescent',
                message: this.passwordUpdateStartString,
                backdropDismiss: true
            }).then(toast => toast.present());
        } else {
            this.spinnerDialog.show(null, this.passwordUpdateStartString);
        }
    }

    ngOnInit() {
    }

}
