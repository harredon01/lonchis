import {Component, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {NavController, ToastController, ModalController, LoadingController} from '@ionic/angular';
import {ParamsService} from '../../services/params/params.service';
import {AddressCreatePage} from '../address-create/address-create.page';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {SpinnerDialog} from '@ionic-native/spinner-dialog/ngx';
import {ApiService} from '../../services/api/api.service';
import {OrderDataService} from '../../services/order-data/order-data.service';
import {UserDataService} from '../../services/user-data/user-data.service';
import {BillingService} from '../../services/billing/billing.service';
@Component({
    selector: 'app-checkout-card',
    templateUrl: './checkout-card.page.html',
    styleUrls: ['./checkout-card.page.scss'],
})
export class CheckoutCardPage implements OnInit {

    // The account fields for the login form.
    // If you're using the username field with or without email, make
    // sure to add it to the type
    //    card: {
    //        cc_branch: string,
    //        cc_expiration_month: string,
    //        cc_expiration_year: string,
    //        cc_name: string,
    //        cc_number: string,
    //        cc_security_code: string,
    //        save_card: boolean,
    //    } = {
    //            cc_branch: '',
    //            cc_expiration_month: '',
    //            cc_expiration_year: '',
    //            cc_name: '',
    //            cc_number: '',
    //            cc_security_code: '',
    //            save_card: false
    //        };
    payerForm: FormGroup;
    submitAttempt: boolean = false;
    dateError: boolean = false;
    cvvError: boolean = false;
    token: any;
    loading: any;
    useToken: boolean = false;

    private cardErrorString: string;
    private cardStartingString: string;

    constructor(public navCtrl: NavController,
        public orderData: OrderDataService,
        public params: ParamsService,
        public user: UserDataService,
        public modalCtrl: ModalController,
        public billing: BillingService,
        public toastCtrl: ToastController,
        public api: ApiService,
        public translateService: TranslateService,
        public formBuilder: FormBuilder,
        public loadingCtrl: LoadingController,
        private spinnerDialog: SpinnerDialog) {
        this.token = null;
        this.translateService.get('CHECKOUT_CARD.PAY_CC_ERROR').subscribe((value) => {
            this.cardErrorString = value;
        });
        this.translateService.get('CHECKOUT_CARD.PAY_CC_STARTING').subscribe((value) => {
            this.cardStartingString = value;
        });
        let c = new Date();
        this.payerForm = formBuilder.group({
            save_card: [''],
            cc_number: ['', Validators.compose([Validators.minLength(12), Validators.pattern('[0-9-]*'), Validators.required])],
            cc_security_code: ['', Validators.compose([Validators.minLength(3), Validators.maxLength(4), Validators.pattern('[0-9]*'), Validators.required])],
            cc_branch: ['', Validators.compose([Validators.maxLength(10), Validators.pattern('[A-Z ]*'), Validators.required])],
            cc_name: ['', Validators.compose([Validators.maxLength(100), Validators.pattern('[0-9a-zA-Z ]*'), Validators.required])],
            cc_expiration_month: ['', Validators.compose([Validators.maxLength(2), Validators.pattern('[0-9]*'), Validators.required, Validators.min(1), Validators.max(12)])],
            cc_expiration_year: ['', Validators.compose([Validators.maxLength(2), Validators.pattern('[0-9]*'), Validators.required, Validators.min(c.getFullYear() - 2000), Validators.max(2040)])],
        });
        let paramSent = this.params.getParams();
        if (paramSent.token && paramSent.method) {
            this.token = paramSent.token;
            this.payToken(paramSent.method);
        }
    }

    savePayer(item: any) {
        this.orderData.payerAddress = item;
    }




    showLoader() {
        if (document.URL.startsWith('http')) {
            this.loading = this.loadingCtrl.create({
                spinner: 'crescent',
                message: this.cardStartingString,
                backdropDismiss: true
            }).then(toast => toast.present());
        } else {
            this.spinnerDialog.show(null, this.cardStartingString);
        }
    }
    /**
       * The view loaded, let's query our items for the list
       */
    ionViewDidEnter() {
        //this.mockData();
    }
    creditTab(event) {
        let target = event.target || event.srcElement;
        let value = target.value;
        let branch = (/^(?:5[1-5][0-9]{2}|222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|2720)[0-9]{12}$/.test(value)) ? "MASTERCARD"
            : (/^(4[0-9]{12}(?:[0-9]{3})?$)|(^606374[0-9]{10}$)/.test(value)) ? "VISA"
                : (/^3[47][0-9]{13}$/.test(value)) ? 'AMEX'
                    : (/^[35](?:0[0-5]|[68][0-9])[0-9]{11}$|^30[0-5]{11}$|^3095[0-9]{10}$|^36[0-9]{12}$|^3[89][0-9]{12}$/.test(value)) ? 'DINERS'
                        : (/^6(?:011|5[0-9]{2}|4[4-9][0-9])[0-9]{12}$/.test(value)) ? 'DISCOVER'
                            : (/^589562[0-9]{10}$/.test(value)) ? 'NARANJA'
                                : (/^603488[0-9]{10}$|^2799[0-9]{9}$/.test(value)) ? 'SHOPPING'
                                    : (/^604(([23][0-9]{2})|(400))[0-9]{10}$|^589657[0-9]{10}$/.test(value)) ? 'CABAL'
                                        : (/^603493[0-9]{10}$/.test(value)) ? 'ARGENCARD'
                                            : (/^590712[0-9]{10}$/.test(value)) ? 'CODENSA'
                                                : (/^627180[0-9]{10}$/.test(value)) ? 'CMR'
                                                    : "";

        console.log("Credit branch", branch);
        this.payerForm.patchValue({cc_branch: branch});
    }
    keytab(event, maxlength: any) {
        let nextInput = event.srcElement.nextElementSibling; // get the sibling element
        console.log('nextInput', nextInput);
        var target = event.target || event.srcElement;
        console.log('target', target);
        console.log('targetvalue', target.value);
        console.log('targettype', target.nodeType);
        if (target.value.length < maxlength) {
            return;
        }
        if (nextInput == null)  // check the maxLength from here
            return;
        else
            nextInput.focus();   // focus if not null
    }
    async createAddress() {
        let container;
        container = {
            type: "billing"
        }
        let addModal = await this.modalCtrl.create({
            component: AddressCreatePage,
            componentProps: container
        });
        await addModal.present();
        const {data} = await addModal.onDidDismiss();
        if (data) {
            console.log("Process complete, address created", data);
            this.savePayer(data);

        }

    }
    getTokens() {
        this.useToken = false;
        this.billing.getRawSources().subscribe((data: any) => {
            console.log("after getBanks", data);
            if (data.source) {
                if (data.source.length > 0) {
                    this.token = data.source;
                    this.useToken = true;
                }
            }

        }, (err) => {
            this.api.handleError(err);
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
     * Navigate to the detail page for this item.
     */
    transactionResponse(transaction) {
        this.dismissLoader();
        console.log("after payCreditCard");
        this.orderData.clearOrder();
        this.params.setParams({
            transaction: transaction
        });
        this.navCtrl.navigateForward('tabs/payu/complete');
    }
    payCreditCard() {
        this.submitAttempt = true;
        this.dateError = false;
        this.cvvError = false;
        if (!this.payerForm.valid) {return;}
        let d = new Date(parseInt(this.payerForm.get('cc_expiration_year').value) + 2000, parseInt(this.payerForm.get('cc_expiration_month').value) - 1);
        let c = new Date();
        if (d < c) {
            this.dateError = true;
            return;
        }
        if (this.payerForm.get('cc_branch').value != "AMEX" && this.payerForm.get('cc_security_code').value.length != 3) {
            this.cvvError = true;
            return;
        }
        if (this.payerForm.get('cc_branch').value == "AMEX" && this.payerForm.get('cc_security_code').value.length != 4) {
            this.cvvError = true;
            return;
        }
        this.showLoader();
        let contForm = this.payerForm.value
        let buyer = this.orderData.buyerAddress;
        let payer = this.orderData.payerAddress;
        let payer_info = this.orderData.payerInfo;
        let container = {
            buyer_address: buyer.address,
            buyer_city: buyer.cityName,
            buyer_state: buyer.regionName,
            buyer_country: buyer.countryCode,
            buyer_postal: buyer.postal,
            buyer_phone: buyer.phone,
            payer_address: payer.address,
            payer_city: payer.cityName,
            payer_state: payer.regionName,
            payer_country: payer.countryCode,
            payer_postal: payer.postal,
            payer_phone: payer.phone,
            payer_name: payer_info.payer_name,
            payer_email: payer_info.payer_email,
            payer_id: payer_info.payer_id,
            cc_branch: contForm.cc_branch,
            cc_expiration_month: contForm.cc_expiration_month,
            cc_expiration_year: contForm.cc_expiration_year,
            cc_name: contForm.cc_name,
            cc_number: contForm.cc_number,
            cc_security_code: contForm.cc_security_code,
            save_card: contForm.save_card,
            payment_id: this.orderData.payment.id,
            platform: "Food"
        };
        this.billing.payCreditCard(container, "Payu").subscribe((data: any) => {
            let transaction = data.response.transactionResponse;
            this.transactionResponse(transaction);
        }, (err) => {
            this.dismissLoader();
            // Unable to log in
            let toast = this.toastCtrl.create({
                message: this.cardErrorString,
                duration: 3000,
                position: 'top'
            }).then(toast => toast.present());
            this.api.handleError(err);
        });
    }
    payToken(method) {
        this.showLoader();
        let buyer = this.orderData.buyerAddress;
        console.log("buyer", buyer);
        let payer = this.orderData.payerAddress;
        let payer_info = this.orderData.payerInfo;
        let container = {
            buyer_address: buyer.address,
            buyer_city: buyer.cityName,
            buyer_state: buyer.regionName,
            buyer_country: buyer.countryCode,
            buyer_postal: buyer.postal,
            buyer_phone: buyer.phone,
            payer_address: payer.address,
            payer_city: payer.cityName,
            payer_state: payer.regionName,
            payer_country: payer.countryCode,
            payer_postal: payer.postal,
            payer_phone: payer.phone,
            payer_name: payer_info.payer_name,
            payer_email: payer_info.payer_email,
            payer_id: payer_info.payer_id,
            token: this.token,
            cc_branch: method,
            payment_id: this.orderData.payment.id,
            platform: "Food"
        };
        console.log("before payCreditCard token", container);
        this.billing.payCreditCard(container, "PayU").subscribe((data: any) => {
            this.transactionResponse(data.response.transactionResponse);
        }, (err) => {
            this.dismissLoader();
            // Unable to log in
            let toast = this.toastCtrl.create({
                message: this.cardErrorString,
                duration: 3000,
                position: 'top'
            }).then(toast => toast.present());
            this.api.handleError(err);
        });
    }
    useOld() {
        this.useToken = false;
    }
    mockData() {
        let container = {
            cc_branch: "VISA",
            cc_expiration_month: "VISA",
            cc_expiration_year: "22",
            cc_name: "APPROVED",
            cc_number: "4111111111111111",
            cc_security_code: "123"
        };
        this.payerForm.setValue(container);
    }

    ngOnInit() {
    }

}
