import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Payment} from '../../models/payment';
import {TranslateService} from '@ngx-translate/core';
import {SpinnerDialog} from '@ionic-native/spinner-dialog/ngx';
import {ApiService} from '../../services/api/api.service';
import {OrderDataService} from '../../services/order-data/order-data.service';
import {NavController, ToastController, LoadingController, ModalController, AlertController} from '@ionic/angular';
import {UserDataService} from '../../services/user-data/user-data.service';
import {ParamsService} from '../../services/params/params.service';
import {MercadoPagoService} from '../../services/mercado-pago/mercado-pago.service';
import {BillingService} from '../../services/billing/billing.service';
declare var Mercadopago: any;
@Component({
    selector: 'app-mercado-pago',
    templateUrl: './mercado-pago.page.html',
    styleUrls: ['./mercado-pago.page.scss'],
})
export class MercadoPagoPage implements OnInit {
    paymentMethod: any;
//    year: any;
//    month: any;
    v: any;

    payment: Payment;
    cardBranch: any = "";
    loading: any;
    private cardPaymentErrorString: string;
    logo: any = "";
    installmentsSelected: any;
    issuerId: any;
    doctypes: any[] = [];
    validationErrors: any[] = [];
    installments: any[] = [];
    payerForm: FormGroup;
    submitAttempt: boolean = false;
    dateError: boolean = false;
    cvvError: boolean = false;

    constructor(public formBuilder: FormBuilder,
        private params: ParamsService,
        public userData: UserDataService,
        public api: ApiService,
        public orderData:OrderDataService,
        public billing: BillingService,
        public navCtrl:NavController,
        public translateService: TranslateService,
        public loadingCtrl: LoadingController,
        private spinnerDialog: SpinnerDialog,
        public toastCtrl: ToastController,
        private mercadoServ: MercadoPagoService) {
        this.translateService.get('CHECKOUT_BANKS.BANKS_GET_ERROR').subscribe((value) => {
            this.cardPaymentErrorString = value;
        });
        let paramsCont = this.params.getParams();
        if (paramsCont) {
            if (paramsCont.paymentMethod) {
                this.paymentMethod = paramsCont.paymentMethod;
            } else {
                this.paymentMethod = 'visa';
            }
            if (paramsCont.payment) {
                this.payment = new Payment(paramsCont.payment);
            } else {
                this.payment = new Payment({"id": 765, "total": 10000});
            }
        } else {
            this.payment = new Payment({"id": 765, "total": 10000});
            this.paymentMethod = 'visa';
        }
        Mercadopago.getIdentificationTypes((status, response) => {
            if (status !== 200) {
                console.log("Error")
            }
            console.log("Exito", response)
            this.doctypes = response;
        });
        let c = new Date();
        this.payerForm = formBuilder.group({
            cc_number: ['', Validators.compose([Validators.minLength(12), Validators.pattern('[0-9-]*'), Validators.required])],
            cc_save: [''],
            installmentsSelected: ['', Validators.required],
            email: ['', Validators.compose([Validators.maxLength(100), Validators.pattern('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-.]*\.[a-zA-Z]{2,}'), Validators.required])],
            payer_id: ['', Validators.required],
            doc_type: ['', Validators.required],
            paymentMethodId: ['', Validators.required],
            cc_security_code: ['', Validators.compose([Validators.minLength(3), Validators.maxLength(4), Validators.pattern('[0-9]*'), Validators.required])],
            cc_name: ['', Validators.compose([Validators.maxLength(100), Validators.pattern('[0-9a-zA-Z ]*'), Validators.required])],
            cc_expiration_month: ['', Validators.compose([Validators.maxLength(2), Validators.pattern('[0-9]*'), Validators.required, Validators.min(1), Validators.max(12)])],
            cc_expiration_year: ['', Validators.compose([Validators.maxLength(4), Validators.minLength(4), Validators.pattern('[0-9]*'), Validators.required, Validators.min(c.getFullYear()), Validators.max(2040)])],
        });
        let container = this.payerForm.value;
        container.paymentMethodId = this.paymentMethod;
        for (let prop in container) {
            if (!container[prop]) {
                container[prop] = "";
            }
        }
        container.cc_save = true;
        container.cc_expiration_year = '20';
        console.log("Set value",container);
        this.payerForm.setValue(container);
    }
    goBack(){
        this.navCtrl.back();
    }
    useUser() {
        console.log("prefil", this.v);
        console.log("user", this.userData._user);
        console.log("user2", this.userData._user.user);
        let container = this.payerForm.value;
        if (this.v) {
            container.email = "";
            container.payer_id = "";
            container.doc_type = "";
        } else {
            //            container.cc_name = this.userData._user.name;cc_expiration_year
            container.email = this.userData._user.email;
            container.cc_name = 'APRO';
            container.cc_security_code = '123';
            container.cc_expiration_year = '2020';
            container.cc_expiration_month = '12';
            container.cc_number = '4013540682746260';
            container.payer_id = this.userData._user.docNum;
            container.doc_type = this.userData._user.docType;
        }
        for (let prop in container) {
            if (!container[prop]) {
                container[prop] = "";
            }
        }
        console.log("Setting form values: ", container);
        this.payerForm.setValue(container);
    }
    showLoader() {
        if (document.URL.startsWith('http')) {
            this.loading = this.loadingCtrl.create({
                spinner: 'crescent',
                backdropDismiss: true
            }).then(toast => toast.present());
        } else {
            this.spinnerDialog.show();
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
    showAlert(alert) {
        let toast = this.toastCtrl.create({
            message: alert,
            duration: 3000,
            position: 'top'
        }).then(toast => toast.present());
    }
    showAlertTranslation(alert) {
        this.translateService.get(alert).subscribe(
            value => {
                if (value.includes("MERCADO")) {
                    this.translateService.get('MERCADOPAGO.DEFAULT').subscribe(
                        value2 => {
                            this.showAlert(value2);
                        }
                    )
                } else {
                    this.validationErrors.push(value);
                    this.showAlert(value)
                }
            }
        )
    }

    pay() {
        this.submitAttempt = true;
        this.dateError = false;
        this.cvvError = false;
        let values = this.payerForm.value;
        console.log("values", values)

        if (!this.payerForm.valid) {return;}
        let d = new Date(parseInt(this.payerForm.get('cc_expiration_year').value), parseInt(this.payerForm.get('cc_expiration_month').value) - 1);
        let c = new Date();
        if (d < c) {
            this.dateError = true;
            return;
        }
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
                let values = this.payerForm.value;
                let container = {
                    token: response.id,
                    payment_id: this.payment.id,
                    platform: "Booking",
                    payment_method_id: this.paymentMethod,
                    installments: this.installmentsSelected,
                    email: values.email,
                    save_card: values.cc_save,
                    issuer_id: this.issuerId
                };
                this.billing.payCreditCard(container, "MercadoPagoService").subscribe((data: any) => {
                    this.dismissLoader();
                    console.log("after payCredit");
                    console.log(JSON.stringify(data));
                    if (data.status == "success") {
                        this.orderData.clearOrder();
                        this.showAlertTranslation("MERCADOPAGO." + data.status_detail);
                        if (data.response == "in_process") {


                        } else {
                        }
                        let container = {"payment":this.payment,"status":data.status,"response":data.response,"status_detail":data.status_detail};
                        this.params.setParams(container);
                        this.navCtrl.navigateRoot("tabs/mercado-pago-options/thankyou");
                        
                    } else {
                        if(data.status_detail){
                            this.showAlertTranslation("MERCADOPAGO." + data.status_detail);
                        } else {
                            this.showAlert(this.cardPaymentErrorString);
                        }
                        
                    }
                }, (err) => {
                    this.dismissLoader();
                    // Unable to log in
                    this.showAlert(this.cardPaymentErrorString);
                    this.api.handleError(err);
                });
            }
            console.log("Exito", response);

        });
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
        this.cardBranch = branch;
        if (value.length >= 6) {
            Mercadopago.getPaymentMethod({"bin": value}, (status, response) => {
                if (status !== 200) {
                    console.log("Error", response)
                } else {
                    this.paymentMethod = response[0].id;
                    this.logo = response[0].secure_thumbnail;

                    console.log("Exito", response)
                }
            });
            Mercadopago.getInstallments({"bin": value, "amount": this.payment.total}, (status, response) => {
                if (status !== 200) {
                    console.log("Error", response)
                } else {
                    this.installments = response[0].payer_costs;
                    this.issuerId = response[0].issuer.id;
                    console.log("Issuer id");
                    console.log("Exito", response)
                }
            });
        }

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

    ngOnInit() {
    }
}
