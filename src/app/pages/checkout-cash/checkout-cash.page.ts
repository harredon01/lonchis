import {Component, OnInit, ViewChild} from '@angular/core';
import {InAppBrowser} from '@ionic-native/in-app-browser/ngx';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NavController, ModalController, AlertController, IonContent} from '@ionic/angular';
import {ApiService} from '../../services/api/api.service';
import {OrderDataService} from '../../services/order-data/order-data.service';
import {UserDataService} from '../../services/user-data/user-data.service';
import {BillingService} from '../../services/billing/billing.service';
import {TranslateService} from '@ngx-translate/core';
@Component({
    selector: 'app-checkout-cash',
    templateUrl: './checkout-cash.page.html',
    styleUrls: ['./checkout-cash.page.scss'],
})
export class CheckoutCashPage implements OnInit {

    // The account fields for the login form.
    // If you're using the username field with or without email, make
    // sure to add it to the type
    @ViewChild(IonContent) content: IonContent;
    option: any;
    submitAttempt: boolean = false;
    v: any;
    payerForm: FormGroup;
//    payer: {
//        payment_method: string,
//        payer_email: string,
//    } = {
//            payment_method: '',
//            payer_email: '',
//        };

    private emailPaymentTitle: string;
    private emailPaymentDesc: string;
    private confirmString: string;

    constructor(public navCtrl: NavController,
        public orderData: OrderDataService,
        public billing: BillingService,
        public iab: InAppBrowser,
        public userData: UserDataService,
        public api: ApiService,
        public modalCtrl: ModalController,
        public alertCtrl: AlertController,
        public formBuilder: FormBuilder,
        public translateService: TranslateService) {

        this.payerForm = formBuilder.group({
            payment_method: ['', Validators.compose([Validators.maxLength(50), Validators.pattern('[a-zA-Z 0-9._%+-]*'), Validators.required])],
            payer_email: ['', Validators.compose([Validators.maxLength(100), Validators.pattern('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-.]*\.[a-zA-Z]{2,}'), Validators.required])]
        });

        this.translateService.get('INPUTS.ACKNOWLEDGE').subscribe((value) => {
            this.confirmString = value;
        });
        this.translateService.get('PAYMENT.EMAIL_PAYMENT_CONFIRM_TITLE').subscribe((value) => {
            this.emailPaymentTitle = value;
        });
        this.translateService.get('PAYMENT.EMAIL_PAYMENT_CONFIRM_CASH_DESC').subscribe((value) => {
            this.emailPaymentDesc = value;
        });
    }
    scrollToBottom() {
        setTimeout(() => {
            this.content.scrollToBottom(300);
        }, 400);
    }
    showPrompt() {
        const prompt = this.alertCtrl.create({
            header: this.emailPaymentTitle,
            message: this.emailPaymentDesc,
            inputs: [],
            buttons: [
                {
                    text: this.confirmString,
                    handler: data => {
                    }
                }
            ]
        }).then(toast => toast.present());
    }

    useUser() {
        console.log("prefil", this.v);
        console.log("user", this.userData._user);
        let container: any = null;
        let contForm = this.payerForm.value;
        if (this.v) {
            container = {
                payer_name: "",
                payment_method: contForm.payment_method
            };
        } else {
            container = {
                payment_method: contForm.payment_method,
                payer_email: this.userData._user.email,
            };
        }
        console.log("Setting form values: ", container);
        this.payerForm.setValue(container);
    }

    /**
       * The view loaded, let's query our items for the list
       */
    selectOption(option) {
        this.scrollToBottom();
        this.payerForm.patchValue({payment_method: option });
    }
    payCash() {
        this.submitAttempt = true;
        if (!this.payerForm.valid) {return;} 
        this.api.loader('CHECKOUT_CASH.PAY_CASH_STARTING');
        let container = {
            payment_method: this.payerForm.get('payment_method').value,
            payer_email: this.payerForm.get('payer_email').value,
            payment_id: this.orderData.payment.id,
            email: true,
            platform: "Food"
        };
        this.billing.payCash(container,"PayU").subscribe((data: any) => {
            this.api.dismissLoader();
            console.log("after payCash");
            console.log(JSON.stringify(data));
            if (data.code == "SUCCESS") {
                if (data.transactionResponse.state == "PENDING") {
                    //this.showPrompt();
                    const browser = this.iab.create(data.transactionResponse.extraParameters.URL_PAYMENT_RECEIPT_HTML);
                    browser.on('exit').subscribe(event => {
                        this.orderData.clearOrder();
                        this.navCtrl.navigateRoot("tabs");
                    });
                }
            }
        }, (err) => {
            this.api.dismissLoader();
            // Unable to log in
            this.api.toast('CHECKOUT_CASH.PAY_CASH_ERROR');
            this.api.handleError(err);
        });
    }

    ngOnInit() {
    }

}
