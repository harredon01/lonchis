import {Component, OnInit} from '@angular/core';
import {Facebook, FacebookLoginResponse} from '@ionic-native/facebook/ngx';
import {GooglePlus} from '@ionic-native/google-plus/ngx';
import {SignInWithApple, AppleSignInResponse, AppleSignInErrorResponse, ASAuthorizationAppleIDRequest} from '@ionic-native/sign-in-with-apple/ngx';
import {NavController, AlertController, ModalController} from '@ionic/angular';
import {Events} from '../../services/events/events.service';
import {InAppBrowser} from '@ionic-native/in-app-browser/ngx';
import {UserService} from '../../services/user/user.service';
import {UserDataService} from '../../services/user-data/user-data.service';
import {AuthService} from '../../services/auth/auth.service';
import {ApiService} from '../../services/api/api.service';
import {MapDataService} from '../../services/map-data/map-data.service';
import {ParamsService} from '../../services/params/params.service';
import {ForgotPassPage} from '../forgot-pass/forgot-pass.page';
import {DynamicRouterService} from '../../services/dynamic-router/dynamic-router.service';
@Component({
    selector: 'app-login',
    templateUrl: './login.page.html',
    styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
    // The account fields for the login form.
    // If you're using the username field with or without email, make
    // sure to add it to the type
    account: {username: string, password: string, client_secret: string, grant_type: string, scope: string, remember: boolean, client_id: any} = {
        username: '',
        password: '',
        client_secret: "nuoLagU2jqmzWqN6zHMEo82vNhiFpbsBsqcs2DPt",
        grant_type: 'password',
        scope: "*",
        remember: true,
        client_id: 1
    };
    public downloadProgress = 0;

    // Our translated text strings
    private isUpdating: boolean;
    constructor(public navCtrl: NavController,
        private googlePlus: GooglePlus,
        private fb: Facebook,
        private params: ParamsService,
        private signInWithApple: SignInWithApple,
        public user: UserService,
        public api: ApiService,
        private mapData: MapDataService,
        public dr: DynamicRouterService,
        private alertsCtrl: AlertController,
        private modalCtrl: ModalController,
        public auth: AuthService,
        public events: Events,
        public userData: UserDataService,
        public iab: InAppBrowser) {
        this.isUpdating = false;
        this.events.subscribe('storageInitialized', (data: any) => {
            this.checkLogIn();
            // user and time are the same arguments passed in `events.publish(user, time)`
        });

    }
    ionViewDidEnter() {
        if (this.userData.storageLoaded) {
            this.checkLogIn();
        }
    }

    goBack() {
        this.navCtrl.navigateBack('home');

    }
    async performForgotPass() {
        let addModal = await this.modalCtrl.create({
            component: ForgotPassPage,
        });
        await addModal.present();
        const {data} = await addModal.onDidDismiss();
        if (data) {
            console.log("Process complete, address created", data);
            this.postTokenAuth(data);
        }
    }
    loginGoogle() {
        if (this.userData.isDevice) {
            this.googlePlus.login({
                'webClientId': '379545099035-eef3pvfq2ipetc3vecoi72fum20ma4rt.apps.googleusercontent.com', // optional clientId of your Web application from Credentials settings of your project - On Android, this MUST be included to get an idToken. On iOS, it is not required.
                'offline': true // optional, but requires the webClientId - if set to true the plugin will also return a serverAuthCode, which can be used to grant offline access to a non-Google server
            })
                .then(res => {
                    console.log(res);
                    this.verifyToken(res.accessToken, "google", null);
                })
                .catch(err => console.error(err));
        } else {
            console.log("loginGoogle");
        }
    }
    loginFacebook() {
        if (this.userData.isDevice) {
            this.fb.login(['public_profile', 'email'])
                .then((res: FacebookLoginResponse) => {console.log('Logged into Facebook!', res); this.verifyToken(res.authResponse.accessToken, "facebook", null);})
                .catch(e => console.log('Error logging into Facebook', e));
        } else {
            console.log("loginFacebook");
        }
    }
    loginApple() {
        if (this.userData.isDevice) {
            this.signInWithApple.signin({
                requestedScopes: [
                    ASAuthorizationAppleIDRequest.ASAuthorizationScopeFullName,
                    ASAuthorizationAppleIDRequest.ASAuthorizationScopeEmail
                ]
            })
                .then((succ: AppleSignInResponse) => {
                    // https://developer.apple.com/documentation/signinwithapplerestapi/verifying_a_user
                    let userData = {
                        id: succ.user,
                        firstName: succ.fullName.givenName,
                        lastName: succ.fullName.familyName,
                        name: succ.fullName.givenName + ' ' + succ.fullName.familyName,
                        email: succ.email,
                    };
                    this.verifyToken(succ.identityToken, "apple", userData);
                })
                .catch((error: AppleSignInErrorResponse) => {
                    alert(error.code + ' ' + error.localizedDescription);
                    console.error(error);
                });
        } else {
            console.log("loginApple");
        }

    }
    verifyToken(token, platform, extra) {
        let container = {"token": token, "driver": platform, "extra": extra};
        this.auth.checkSocialToken(container).subscribe((resp: any) => {
            if (resp.status == "success") {
                this.postTokenAuth(resp.token);
            } else {
                this.api.toast('LOGIN.LOGIN_ERROR');
            }
            console.log("checkSocialToken result", resp);
        }, (err) => {
            console.log("checkSocialToken err", err);
            this.api.toast('LOGIN.LOGIN_ERROR');
        });
    }
    postTokenAuth(token) {
        this.userData.setToken(token);
        this.user.postLogin().then((value) => {
            this.api.dismissLoader();
            this.api.hideMenu();
            this.navCtrl.navigateRoot("shop");
            this.events.publish("authenticated", {});
        }, (err) => {
            this._loadUserData();
            // Unable to log in
            this.api.toast('LOGIN.LOGIN_ERROR');
        });
    }

    viewProduct() {
        let params = {
            "type": "Merchant",
            "objectId": 1303,
            "owner": false
        };
        this.params.setParams(params);
        this.navCtrl.navigateForward("merchant-products");
    }

    ngOnInit() {
    }
    checkLogIn() {
        this.api.loader();
        this.userData.getToken().then((value) => {
            console.log("getToken");
            console.log(value);
            if (value) {
                if (value.length > 0) {
                    this.postTokenAuth(value);
                } else {
                    this._loadUserData();
                }

            } else {
                this._loadUserData();
            }
            let vm = this
            setTimeout(function () {vm.api.dismissLoader();}, 1000);
        }, (err) => {
            this._loadUserData();
            let vm = this
            setTimeout(function () {vm.api.dismissLoader();}, 1000);
        });
    }

    // Attempt to login in through our User service
    doLogin() {
        console.log("doLogin");
        this.api.loader();
        this.user.login(this.account).subscribe((data) => {
            if (data.access_token) {
                this.user._loggedIn(data, this.account);
            }
            this.user.postLogin().then((value) => {
                this.api.dismissLoader();
                console.log("Post login complete");
                this.navCtrl.navigateRoot("shop");
                this.events.publish("authenticated", {});
            }, (err) => {
                console.log("Post login error on registration");
            });
        }, (err) => {
            this.api.dismissLoader();
            // Unable to log in
            this.api.toast('LOGIN.LOGIN_ERROR');
            this.api.handleError(err);
        });
    }
    forgotPass() {
        const browser = this.iab.create("https://dev.lonchis.com.co/password/reset");
        browser.on('exit').subscribe(event => {
        });
    }
    // Attempt to login in through our User service
    _loadUserData() {
        this.api.dismissLoader();
        this.userData.getUsername().then((value) => {
            console.log("getUsername", value);
            if (value) {
                if (value.length > 0) {
                    this.account.username = value;
                }

            }
        });
        this.userData.getPassword().then((value) => {
            console.log("getPassword", value);
            if (value) {
                if (value.length > 0) {
                    this.account.password = value;
                }
            }
        });
        this.userData.getRemember().then((value) => {
            console.log("getRemember", value);
            if (value) {
                if (value == "true") {
                    this.account.remember = true;
                } else if (value == "false") {
                    this.account.remember = false;
                }
                console.log("getRememberRes", this.account.remember);
            }
        });
    }

    singup() {
        console.log("Signup")
        this.navCtrl.navigateForward("signup");
    }

}
