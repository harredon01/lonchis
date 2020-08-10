import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {ParamsService} from '../../services/params/params.service';
import {InAppBrowser} from '@ionic-native/in-app-browser/ngx';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {SpinnerDialog} from '@ionic-native/spinner-dialog/ngx';
import {TranslateService} from '@ngx-translate/core';
import {ApiService} from '../../services/api/api.service';
import {OrderDataService} from '../../services/order-data/order-data.service';
import {MercadoPagoService} from '../../services/mercado-pago/mercado-pago.service';
import {NavController, ToastController, LoadingController, ModalController, AlertController} from '@ionic/angular';
import {Payment} from '../../models/payment';
import {UserDataService} from '../../services/user-data/user-data.service';
import {BillingService} from '../../services/billing/billing.service';
declare var Mercadopago: any;
@Component({
    selector: 'app-mercado-pago-options',
    templateUrl: './mercado-pago-options.page.html',
    styleUrls: ['./mercado-pago-options.page.scss'],
})
export class MercadoPagoOptionsPage implements OnInit {
//    payer: {
//        doc_type: string,
//        email: string,
//        entity_type: string
//        payer_id: string,
//        financial_institution: string
//    } = {
//            email: '',
//            doc_type: '',
//            entity_type: '',
//            payer_id: '',
//            financial_institution: ""
//        };
//    payer2: {
//        payment_method_id: string,
//        email: string,
//    } = {
//            payment_method_id: '',
//            email: ''
//        };
//    payer3: {
//        cardId: string,
//        cvv: string,
//        installmentsSelected: string,
//    } = {
//            cardId: '',
//            cvv: '',
//            installmentsSelected: ''
//        };
    option: any;
    loading: any;
    payerForm: FormGroup;
    payerForm2: FormGroup;
    payerForm3: FormGroup;
    submitAttempt: boolean = false;
    submitAttempt2: boolean = false;
    submitAttempt3: boolean = false;
    v: any;
    v2: any;
    currentItems: any[];
    installments: any[] = [];
    cards: any[] = [];
//    installmentsSelected: any;
    issuerId: any;

    private banksErrorString: string;
    private bankPaymentErrorString: string;
    private emailPaymentTitle: string;
    private emailPaymentDesc: string;
    private confirmString: string;
    private gettingBanks: string;
    private cashErrorString: string;
    private makingPayment: string;
    private cardPaymentErrorString: string;
    validationErrors = [];
    paymentMethods: any[] = [];
    pse: any = {};
    cash: any = {};
    paymentsSelected: boolean = false;
    paymentM: any;
    payment: Payment;
    constructor(private params: ParamsService,
        private navCtrl: NavController,
        public iab: InAppBrowser,
        public cdr: ChangeDetectorRef,
        public orderData: OrderDataService,
        public billing: BillingService,
        public api: ApiService,
        public alertCtrl: AlertController,
        public loadingCtrl: LoadingController,
        private spinnerDialog: SpinnerDialog,
        public toastCtrl: ToastController,
        public userData: UserDataService,
        public translateService: TranslateService,
        public formBuilder: FormBuilder,
        private mercadoServ: MercadoPagoService) {
        let container = this.params.getParams();
        if (container) {
            if (container.payment) {
                this.payment = new Payment(container.payment)
            } else {
                this.payment = new Payment({"id": 12, "total": 50000});
            }
        } else {
            this.payment = new Payment({"id": 12, "total": 50000});
        }
        this.payerForm = formBuilder.group({
            financial_institution: ['', Validators.required],
            doc_type: ['', Validators.required],
            entity_type: ['', Validators.required],
            email: ['', Validators.compose([Validators.maxLength(100), Validators.pattern('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-.]*\.[a-zA-Z]{2,}'), Validators.required])],
            payer_id: ['', Validators.compose([Validators.maxLength(30), Validators.pattern('[a-zA-Z 0-9._%+-]*'), Validators.required])],
        });
        this.payerForm2 = formBuilder.group({
            payment_method_id: ['', Validators.compose([Validators.maxLength(30), Validators.pattern('[a-zA-Z 0-9._%+-]*'), Validators.required])],
            email: ['', Validators.compose([Validators.maxLength(100), Validators.pattern('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-.]*\.[a-zA-Z]{2,}'), Validators.required])],
        });
        this.payerForm3 = formBuilder.group({
            cardId: ['', Validators.required],
            cvv: ['', Validators.required],
            installmentsSelected: ['', Validators.required],
        });
        this.currentItems = [];
        this.translateService.get('CHECKOUT_BANKS.BANKS_GET_ERROR').subscribe((value) => {
            this.cardPaymentErrorString = value;
        });

        this.translateService.get('CHECKOUT_BANKS.BANKS_GET_ERROR').subscribe((value) => {
            this.banksErrorString = value;
        });
        this.translateService.get('CHECKOUT_CASH.PAY_CASH_ERROR').subscribe((value) => {
            this.cashErrorString = value;
        });
        this.translateService.get('CHECKOUT_BANKS.DEBIT_PAY_ERROR').subscribe((value) => {
            this.bankPaymentErrorString = value;
        });
        this.translateService.get('INPUTS.ACKNOWLEDGE').subscribe((value) => {
            this.confirmString = value;
        });
        this.translateService.get('PAYMENT.EMAIL_PAYMENT_CONFIRM_TITLE').subscribe((value) => {
            this.emailPaymentTitle = value;
        });
        this.translateService.get('PAYMENT.EMAIL_PAYMENT_CONFIRM_DESC').subscribe((value) => {
            this.emailPaymentDesc = value;
        });
        this.translateService.get('CHECKOUT_BANKS.GETTING_BANKS').subscribe((value) => {
            this.gettingBanks = value;
        });
        this.translateService.get('CHECKOUT_BANKS.MAKING_PAYMENT').subscribe((value) => {
            this.makingPayment = value;
        });
    }

    useUser() {
        console.log("prefil", this.v);
        console.log("user", this.userData._user);
        console.log("user2", this.userData._user.user);
        let container: any = null;
        if (this.v) {
            container = {
                email: "",
                payer_id: "",
                doc_type: "",
                entity_type: "",
                financial_institution: this.payerForm.get('financial_institution').value 
            };

        } else {
            container = {
                email: this.userData._user.email,
                payer_id: this.userData._user.docNum,
                entity_type: "individual",
                doc_type: this.userData._user.docType,
                financial_institution: this.payerForm.get('financial_institution').value
            };
        }

        console.log("Setting form values: ", container);
        this.payerForm.setValue(container);
        this.cdr.detectChanges();
    }
    useUser2() {
        console.log("prefil", this.v);
        console.log("user", this.userData._user);
        let container: any = null;
        if (this.v) {
            container = {
                email: "",
                payment_method_id: this.payerForm2.get('payment_method_id').value
            };
        } else {
            container = {
                payment_method_id: this.payerForm2.get('payment_method_id').value,
                email: this.userData._user.email,
            };
        }
        console.log("Setting form values: ", container);
        this.payerForm2.setValue(container);
        this.cdr.detectChanges();
    }

    cancelSelection() {
        this.paymentsSelected = false;
    }
    showMessage(message) {
        let toast = this.toastCtrl.create({
            message: message,
            duration: 3000,
            position: 'top'
        }).then(toast => toast.present());
    }
    ngOnInit() {

    }
    ionViewDidEnter() {
        this.paymentsSelected = false;
        this.getPaymentMethods();
        this.getCards();
        this.cdr.detectChanges();
    }
    getPaymentMethods() {
        this.mercadoServ.getPaymentMethods().subscribe((resp: any) => {
            console.log("Register connection result", resp);
            this.paymentMethods = resp;
        }, (err) => {

        });
    }
    getCards() {
        this.mercadoServ.getCards().subscribe((resp: any) => {
            console.log("Get cards result", resp);
            for (let item in resp) {
                resp[item].payment_type_id = "QUICK";
            }
            this.cards = resp;
        }, (err) => {

        });
    }
    submitPaymentPse() {
        this.submitAttempt = true;
        console.log("payBank valid", this.payerForm.valid);
        if (!this.payerForm.valid) {return;}
        this.showLoader();
        let container = {
            doc_type: this.payerForm.get('doc_type').value,
            entity_type: this.payerForm.get('entity_type').value ,
            financial_institution:this.payerForm.get('financial_institution').value,
            email: this.payerForm.get('email').value,
            payer_id: this.payerForm.get('payer_id').value,
            payment_id: this.payment.id,
            platform: "Food"
        }; 
        this.billing.payDebit(container, "MercadoPagoService").subscribe((data: any) => {
            this.dismissLoader();
            console.log("after payDebit");
            console.log(JSON.stringify(data));
            if (data.status == "success") {
                this.showAlertTranslation("MERCADOPAGO." + data.status_detail);
                this.orderData.currentOrder = null;
                if (data.response == "pending") {
                    const browser = this.iab.create(data.url);
                    browser.on('exit').subscribe(event => {
                        this.orderData.clearOrder();
                        let container = {"payment": this.payment, "status": data.status, "response": "pending", "status_detail": 'pending_contingency'};
                        this.params.setParams(container);
                        this.navCtrl.navigateRoot("tabs/mercado-pago-options/thankyou");
                    });

                } else {

                }
            } else {
                this.showAlertTranslation("MERCADOPAGO." + data.status_detail);
            }
        }, (err) => {
            this.dismissLoader();
            // Unable to log in
            this.showMessage(this.bankPaymentErrorString);
            this.api.handleError(err);
        });
    }
    showLoader() {
        if (document.URL.startsWith('http')) {
            this.loading = this.loadingCtrl.create({
                spinner: 'crescent',
                backdropDismiss: true
            }).then(toast => toast.present());
        } else {
            this.spinnerDialog.show(null, this.gettingBanks);
        }
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
    submitPaymentCash() {
        this.submitAttempt2 = true;
        if (!this.payerForm2.valid) {return;}
        this.showLoader();
        let container = {
            payment_method_id: this.payerForm2.get('payment_method_id').value,
            email: this.payerForm2.get('email').value,
            payment_id: this.payment.id,
            platform: "Food"
        };
        this.billing.payCash(container, "MercadoPagoService").subscribe((data: any) => {
            this.dismissLoader();
            console.log("after payCash");
            console.log(JSON.stringify(data));
            if (data.status == "success") {
                this.showAlertTranslation("MERCADOPAGO." + data.status_detail);
                if (data.response == "pending") {
                    const browser = this.iab.create(data.url);
                    browser.on('exit').subscribe(event => {
                        this.orderData.clearOrder();
                        let container = {"payment": this.payment, "status": data.status, "response": "pending", "status_detail": 'pending_cash', 'paymentMethod': "IN_BANK"};
                        this.params.setParams(container);
                        this.navCtrl.navigateRoot("tabs/mercado-pago-options/thankyou");
                    });

                } else {
                }

            } else {
                this.showAlertTranslation("MERCADOPAGO." + data.status_detail);
            }
        }, (err) => {
            this.dismissLoader();
            this.showMessage(this.cashErrorString);
            // Unable to log in
            this.api.handleError(err);
        });
    }
    openItem(item: any) {
        this.paymentsSelected = true;


        if (item.payment_type_id == "QUICK") {
            this.paymentM = 'card';
            let container = this.payerForm3.value;
            for (let prop in container) {
                if (!container[prop]) {
                    container[prop] = "";
                }
            }
            container.cardId = item.id;
            console.log("Set value", container);
            this.payerForm3.setValue(container);
            Mercadopago.getInstallments({"bin": item.first_six_digits, "amount": this.payment.total}, (status, response) => {
                if (status !== 200) {
                    console.log("Error", response)
                } else {
                    console.log("Get installments",response);
                    this.installments = response[0].payer_costs;
                    if (this.installments.length>0){
                        console.log("Patching",this.installments[0].installments);
                        this.payerForm3.patchValue({installmentsSelected: this.installments[0].installments });
                    }
                    
                    this.issuerId = response[0].issuer.id;
                    console.log("Issuer id");
                    console.log("Exito", response)
                }
            });
            //this.quickPay();
        } else if (item.payment_type_id == "ticket") {
            this.paymentM = 'cash';
            this.cash = item;
            this.payerForm2.patchValue({payment_method_id: item.id });
        } else if (item.payment_type_id == "credit_card") {
            let container = this.params.getParams();
            if (!container) {
                container = {};
            }
            container.paymentMethod = item.id;
            this.params.setParams(container);
            this.navCtrl.navigateForward('tabs/mercado-pago-options/card');
        } else if (item.payment_type_id == "bank_transfer") {
            this.paymentM = 'pse';
            console.log("Item", item);
            this.pse = item;
            this.currentItems = item.financial_institutions;
            this.payerForm.patchValue({payment_method_id: item.id });
        }
        this.cdr.detectChanges();
    }
    showAlertTranslation(alert) {
        this.translateService.get(alert).subscribe(
            value => {
                if (value.includes("MERCADO")) {
                    this.translateService.get('MERCADOPAGO.DEFAULT').subscribe(
                        value2 => {
                            this.showMessage(value2);
                        }
                    )
                } else {
                    this.validationErrors.push(value);
                    this.showMessage(value)
                }
            }
        )
    }

    payCard() {
        this.submitAttempt3 = true;

        if (!this.payerForm3.valid) {return;}
        this.showLoader();
        var $form = document.querySelector('#pay');

        Mercadopago.createToken($form, (status, response) => {
            Mercadopago.clearSession();
            if (status !== 200) {
                this.dismissLoader();
                console.log("Error", response)
                this.validationErrors = [];
                let errors = response.cause;
                for (let item in errors) {
                    this.showAlertTranslation("MERCADOPAGO." + errors[item].code);
                }

            } else {
                let container = {
                    token: response.id,
                    payment_id: this.payment.id,
                    platform: "Booking",
                    installments: this.payerForm3.get('installmentsSelected').value,
                    quick: true,
                    issuer_id: this.issuerId
                };
                this.billing.payCreditCard(container, "MercadoPagoService").subscribe((data: any) => {
                    this.dismissLoader();
                    console.log("after payCredit");
                    console.log(JSON.stringify(data));
                    if (data.status == "success") {
                        this.showAlertTranslation("MERCADOPAGO." + data.status_detail);
                        this.orderData.clearOrder();
                        if (data.response == "in_process") {


                        } else {

                        }
                        let container = {"payment": this.payment, "status": data.status, "response": data.response, "status_detail": data.status_detail};
                        this.params.setParams(container);
                        this.navCtrl.navigateRoot("tabs/mercado-pago-options/thankyou");
                    } else {
                        this.showAlertTranslation("MERCADOPAGO." + data.status_detail);
                    }
                }, (err) => {
                    this.dismissLoader();
                    // Unable to log in
                    this.showMessage(this.cardPaymentErrorString);
                    this.api.handleError(err);
                });
            }
            console.log("Exito", response);

        });
    }

}
