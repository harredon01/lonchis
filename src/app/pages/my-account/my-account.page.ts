import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import {NavController, ToastController, LoadingController} from '@ionic/angular';
import {SpinnerDialog} from '@ionic-native/spinner-dialog/ngx';
import {ApiService} from '../../services/api/api.service';
import {UserService} from '../../services/user/user.service';
import {UserDataService} from '../../services/user-data/user-data.service';
@Component({
    selector: 'app-my-account',
    templateUrl: './my-account.page.html',
    styleUrls: ['./my-account.page.scss'],
})
export class MyAccountPage implements OnInit {
    // The account fields for the login form.
    // If you're using the username field with or without email, make
    // sure to add it to the type

    registrationForm: FormGroup;
    submitAttempt: boolean = false;
    languageLoaded: boolean = false;
    language: any;

    // Our translated text strings
    private updateErrorString: string;
    private updateStartString: string;
    private loginErrorString: string;
    loading: any;
    constructor(public navCtrl: NavController,
        public user: UserService,
        public userData: UserDataService,
        public toastCtrl: ToastController,
        public api: ApiService,
        public loadingCtrl: LoadingController,
        public translateService: TranslateService,
        public formBuilder: FormBuilder, private spinnerDialog: SpinnerDialog) {

        this.translateService.get('MY_ACCOUNT.UPDATE_ERROR').subscribe((value) => {
            this.updateErrorString = value;
        });
        this.translateService.get('MY_ACCOUNT.UPDATE_START').subscribe((value) => {
            this.updateStartString = value;
        });
        this.translateService.get('USER.GET_USER_ERROR').subscribe((value) => {
            this.loginErrorString = value;
        });
        this.translateService.onLangChange.subscribe((event: any) => {
            //window.location.reload();
        });
        console.log("Current lang", this.translateService.currentLang);
        

        this.registrationForm = formBuilder.group({
            docNum: ['', Validators.compose([Validators.maxLength(30), Validators.minLength(6), Validators.required])],
            docType: ['', Validators.compose([Validators.required])],
            id: ['', Validators.compose([Validators.required])],
            area_code: ['', Validators.compose([Validators.maxLength(30), Validators.pattern('[0-9]*'), Validators.required])],
            cellphone: ['', Validators.compose([Validators.maxLength(30), Validators.pattern('[0-9._%+-]*'), Validators.required])],
            firstName: ['', Validators.compose([Validators.maxLength(30), Validators.pattern('[a-zA-Z 0-9áúíóéÁÉÍÓÚñÑ]*'), Validators.required])],
            lastName: ['', Validators.compose([Validators.maxLength(30), Validators.pattern('[a-zA-Z 0-9áúíóéÁÉÍÓÚñÑ]*'), Validators.required])],
            email: ['', Validators.compose([Validators.maxLength(30), Validators.pattern('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-.]*\.[a-zA-Z]{2,}'), Validators.required])]
        });
        if (this.userData._user) {
            console.log("savedUser", this.userData._user);
            this.registrationForm.patchValue(this.userData._user);
        } else {
            this.user.getUser().subscribe((resp: any) => {
                if (resp) {
                    console.log("getUser", resp);
                    this.userData._user = resp.user;
                    let savedCards = resp.savedCards;
                    for (let key in savedCards) {
                        if (savedCards[key] == "PayU") {
                            this.userData._user.savedCard = true;
                        }
                    }
                    this.registrationForm.patchValue(this.userData._user);
                    console.log("getUser", this.userData._user);
                }

            }, (err) => {
                let toast = this.toastCtrl.create({
                    message: this.loginErrorString,
                    duration: 3000,
                    position: 'top'
                }).then(toast => toast.present());
                this.api.handleError(err);
            });
        }
        this.userData.getLanguage().then((value) => {
            console.log("getLanguage");
            console.log(value);
            if (value) {
                this.language = value;
            } else {
                this.language = "es";
            }
            let vm = this;
            setTimeout(function () {
                vm.languageLoaded = true;
            }, 1000);
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

    ngOnInit() {
    }

    doUpdate() {
        this.showLoader();
        // Attempt to login in through our User service
        this.user.myAccount(this.registrationForm.value).subscribe((resp: any) => {
            console.log("Response my account", resp);
            this.dismissLoader();
            if (resp.status == "success") {
                this.userData._user = resp.user;

                this.navCtrl.navigateRoot('tabs');
            } else {
                let toast = this.toastCtrl.create({
                    message: this.updateErrorString,
                    duration: 3000,
                    position: 'top'
                }).then(toast => toast.present());
            }

        }, (err) => {
            this.dismissLoader();
            this.api.handleError(err);
            // Unable to sign up

        });
    }

    showLoader() {
        if (document.URL.startsWith('http')) {
            this.loading = this.loadingCtrl.create({
                spinner: 'crescent',
                message: this.updateStartString,
                backdropDismiss: true
            }).then(toast => toast.present());
        } else {
            this.spinnerDialog.show(null, this.updateStartString);
        }
    }
    changeLanguage() {
        if (this.languageLoaded) {
            console.log("Change language", this.language);
            if (document.URL.startsWith('http')) {
                this.loading = this.loadingCtrl.create({
                    spinner: 'crescent',
                    backdropDismiss: true
                }).then(toast => toast.present());
            } else {
                this.spinnerDialog.show();
            }
            this.userData.setLanguage(this.language);
            let vm = this;
            setTimeout(function () {
                vm.translateService.use(vm.language);
                vm.translateService.setDefaultLang(vm.language);
                window.location.reload();
            }, 600);
        }
    }



}
