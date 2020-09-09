import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NavController} from '@ionic/angular';
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

    constructor(
        formBuilder: FormBuilder,
        public navCtrl: NavController,
        public auth: AuthService,
        public api: ApiService) {
        this.form = formBuilder.group({
            password_confirmation: ['', Validators.required],
            old_password: ['', Validators.required],
            password: ['', Validators.required],
        });
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
        this.api.loader('PASSWORD_UPDATE.UPDATE_START');
        this.auth.updatePassword(this.form.value).subscribe((resp: any) => {
            this.api.dismissLoader();
            console.log("savePassword result", resp);
            if (resp.status == "success") {
                this.api.toast('PASSWORD_UPDATE.SUCCESS_UPDATE');
                this.navCtrl.navigateRoot('shop');
            } else {
                this.api.toast('PASSWORD_UPDATE.ERROR_UPDATE');
            }
        }, (err) => {
            this.api.dismissLoader();
            this.api.toast('PASSWORD_UPDATE.ERROR_UPDATE');
            this.api.handleError(err);
        });
    }

    ngOnInit() {
    }

}
