import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import {NavController} from '@ionic/angular';
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
    private updateStartString: string;
    loading: any;
    constructor(public navCtrl: NavController,
        public user: UserService,
        public userData: UserDataService,
        public api: ApiService,
        public translateService: TranslateService,
        public formBuilder: FormBuilder) {

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
                this.api.toast('USER.GET_USER_ERROR');
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

    ngOnInit() {
    }

    doUpdate() {
        this.api.loader('MY_ACCOUNT.UPDATE_START');
        // Attempt to login in through our User service
        this.user.myAccount(this.registrationForm.value).subscribe((resp: any) => {
            console.log("Response my account", resp);
            this.api.dismissLoader();
            if (resp.status == "success") {
                this.userData._user = resp.user;

                this.navCtrl.navigateRoot('tabs');
            } else {
                this.api.toast('MY_ACCOUNT.UPDATE_ERROR');
            }

        }, (err) => {
            this.api.dismissLoader();
            this.api.handleError(err);
            // Unable to sign up

        });
    }

    changeLanguage() {
        if (this.languageLoaded) {
            console.log("Change language", this.language);
            this.api.loader();
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
