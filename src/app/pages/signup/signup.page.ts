import { Component, OnInit } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {SpinnerDialog} from '@ionic-native/spinner-dialog/ngx';
import {NavController, ToastController, LoadingController} from '@ionic/angular';
import {ApiService} from '../../services/api/api.service';
import {UserService} from '../../services/user/user.service';
@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {


    registrationForm: FormGroup;
    submitAttempt: boolean = false;
    passwordError: boolean = false;
    idType: any;
    loading: any;

    // Our translated text strings
    private signupErrorCelString: string;
    private signupErrorIdString: string;
    private signupErrorEmailString: string;
    private signupStartString: string;
  constructor(public navCtrl: NavController,
        public user: UserService,
        public toastCtrl: ToastController,
        public api: ApiService,
        public loadingCtrl: LoadingController,
        public translateService: TranslateService,
        public formBuilder: FormBuilder, private spinnerDialog: SpinnerDialog) {

        this.translateService.get('SIGNUP.ERROR_CEL').subscribe((value) => {
            this.signupErrorCelString = value;
        });
        this.translateService.get('SIGNUP.ERROR_ID').subscribe((value) => {
            this.signupErrorIdString = value;
        });
        this.translateService.get('SIGNUP.ERROR_EMAIL').subscribe((value) => {
            this.signupErrorEmailString = value;
        });
        this.translateService.get('SIGNUP.SAVE_START').subscribe((value) => {
            this.signupStartString = value;
        });
        this.idType = "text";
        this.registrationForm = formBuilder.group({
            password: ['', Validators.compose([Validators.maxLength(30), Validators.minLength(6), Validators.required])],
            password_confirmation: ['', Validators.compose([Validators.maxLength(30), Validators.minLength(6), Validators.required])],
            area_code: [''],
            cellphone: ['', Validators.compose([Validators.maxLength(30), Validators.pattern('[0-9._%+-]*'), Validators.required])],
            firstName: ['', Validators.compose([Validators.maxLength(50), Validators.pattern('[a-zA-Z áúíóéÁÉÍÓÚñÑ]*'), Validators.required])],
            lastName: ['', Validators.compose([Validators.maxLength(50), Validators.pattern('[a-zA-Z áúíóéÁÉÍÓÚñÑ]*'), Validators.required])],
            email: ['', Validators.compose([Validators.maxLength(100), Validators.pattern('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-.]*\.[a-zA-Z]{2,}'), Validators.required])]
        });
        let container = this.registrationForm.value;
        container.area_code = 57;
        this.registrationForm.setValue(container);
    }

  ngOnInit() {
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
  doSignup() {
        this.submitAttempt = true;
        this.passwordError = false;
        console.log("Signing up");
        if (!this.registrationForm.valid) {return;}
        console.log("Registration valid");
        if (this.registrationForm.get('password').value != this.registrationForm.get('password_confirmation').value ) {
            this.passwordError = true;
            return;
        }
        console.log("Password match");
        this.showLoader();
        // Attempt to login in through our User service
        this.user.signup(this.registrationForm.value).subscribe((resp:any) => {
            if (resp.status == 'success') {
                let container = this.registrationForm.value;
                container.remember = true;
                this.user._loggedIn(resp, container);
            }
            this.dismissLoader();
            console.log("Post login", resp);
            this.user.postLogin().then((value) => {
                console.log("Post login complete");
                this.navCtrl.navigateForward('tabs');
            }, (err) => {
                console.log("Post login error on registration");
            });
        }, (err) => {
            // Unable to sign up
            console.log("Error", err);
            let message = err.error.message;
            let errorString = "";
            if (message.email || message == "email_exists") {
                errorString = this.signupErrorEmailString;
            }
            if (message.celphone || message == "cel_exists") {
                errorString = this.signupErrorCelString;
            }
            let toast = this.toastCtrl.create({
                message: errorString,
                duration: 3000,
                position: 'top'
            }).then(toast => toast.present());
            this.dismissLoader();
            this.api.handleError(err);
        });
    }

    showLoader() {
        if (document.URL.startsWith('http')) {
            this.loading = this.loadingCtrl.create({
                spinner: 'crescent',
                message: this.signupStartString,
                backdropDismiss: true
            }).then(toast => toast.present());
        } else {
            this.spinnerDialog.show(null, this.signupStartString);
        }
    }
    handleRegisError() {
        if (document.URL.startsWith('http')) {
            this.loading = this.loadingCtrl.create({
                spinner: 'crescent',
                message: this.signupStartString,
                backdropDismiss: true
            }).then(toast => toast.present());
        } else {
            this.spinnerDialog.show(null, this.signupStartString);
        }
    }

    selectType() {
        console.log("Select type", this.registrationForm.get('docType').value);
        if (this.registrationForm.get('docType').value == "CC" || this.registrationForm.get('docType').value == "TI" || this.registrationForm.get('docType').value == "CEL") {
            this.idType = "tel";
        } else {
            this.idType = "text";
        }
    }

}
