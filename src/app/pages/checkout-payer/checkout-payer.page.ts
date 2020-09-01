import {Component, OnInit} from '@angular/core';
import {NavController, ModalController, AlertController} from '@ionic/angular';
import {Address} from '../../models/address';
import {ParamsService} from '../../services/params/params.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {OrderDataService} from '../../services/order-data/order-data.service';
import {UserDataService} from '../../services/user-data/user-data.service';
import {BillingService} from '../../services/billing/billing.service';
import {AddressesService} from '../../services/addresses/addresses.service';
import {AddressCreatePage} from '../address-create/address-create.page';
import {ApiService} from '../../services/api/api.service';
@Component({
    selector: 'app-checkout-payer',
    templateUrl: './checkout-payer.page.html',
    styleUrls: ['./checkout-payer.page.scss'],
})
export class CheckoutPayerPage implements OnInit {

    // The account fields for the login form.
    // If you're using the username field with or without email, make
    // sure to add it to the type
//    payer: {
//        payer_name: string,
//        payer_email: string,
//        payer_id: string,
//
//    } = {
//            payer_name: '',
//            payer_email: '',
//            payer_id: '',
//        };
    payerForm: FormGroup;
    submitAttempt: boolean = false;
    v: any;
    showAddressCard: boolean;
    selectedAddress: Address;
    currentItems: Address[];

    constructor(public navCtrl: NavController,
        public userData: UserDataService,
        public billing: BillingService,
        public alertCtrl: AlertController,
        public api: ApiService,
        public params: ParamsService,
        public orderData: OrderDataService,
        public modalCtrl: ModalController,
        public addresses: AddressesService,
        public formBuilder: FormBuilder) {
        this.showAddressCard = false;
        this.v = false;
        this.currentItems = [];
        console.log("user", this.userData._user);

        this.getTokens();

        this.payerForm = formBuilder.group({
            payer_name: ['', Validators.compose([Validators.maxLength(100), Validators.pattern('[a-zA-ZáúíóéÁÉÍÓÚñÑ 0-9._%+-]*'), Validators.required])],
            payer_email: ['', Validators.compose([Validators.maxLength(100), Validators.pattern('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-.]*\.[a-zA-Z]{2,}'), Validators.required])],
            payer_id: ['', Validators.compose([Validators.maxLength(30), Validators.pattern('[a-zA-Z 0-9._%+-]*'), Validators.required])],
        });
    }

    getTokens() {
        this.billing.getRawSources().subscribe((value: any) => {
            console.log(value);
            console.log(value.source);
            if (value) {
                if (value.source) {
                    this.showPromptToken(value);
                }
            }
        }, (err) => {
            console.log("Error",err)
            this.api.handleError(err);
        });
    }

    savePayer(item: Address) {
        this.orderData.payerAddress = item;
        this.showAddressCard = true;
        this.selectedAddress = item;
        this.checkAdvance();
    }
    showPromptToken(token: any) {
        const prompt = this.alertCtrl.create({
            header: 'Atencion',
            message: "Te gustaría usar la tarjeta que tienes guardada?",
            inputs: [],
            buttons: [
                {
                    text: 'No',
                    handler: data => {
                        console.log('Cancel clicked');
                    }
                },
                {
                    text: 'Si',
                    handler: data => {
                        this.useSavedToken(token);
                    }
                }
            ]
        }).then(toast => toast.present());
    }
    useSavedToken(source: any) {
        console.log("Saved token", source.extra);
        let extras = JSON.parse(source.extra);
        let container = {
            address: extras.billingAddress.street1,
            cityName: extras.billingAddress.city,
            regionName: extras.billingAddress.state,
            countryCode: extras.billingAddress.country,
            postal: extras.billingAddress.postalCode,
            phone: extras.billingAddress.phone
        };
        let item = new Address(container);
        this.orderData.payerAddress = item;
        let info = {
            payer_name: extras.fullName,
            payer_email: extras.emailAddress,
            payer_id: extras.dniNumber
        };
        this.orderData.payerInfo = info;
        this.showAddressCard = false;
        this.selectedAddress = item;
        this.params.setParams({"token": source.source, "method": extras.method});
        this.navCtrl.navigateForward('tabs/payu/credit/card');
    }
    useUser() {
        console.log("prefil", this.v);
        console.log("user", this.userData._user);
        let container: any = null;
        if (!this.v) {
            container = {
                payer_name: this.userData._user.firstName + " " + this.userData._user.lastName,
                payer_email: this.userData._user.email,
                payer_id: this.userData._user.docNum,
            };
        } else {
            container = {
                payer_name: "",
                payer_email: "",
                payer_id: "",
            };
        }

        console.log("Setting form values: ", container);
        this.payerForm.setValue(container);
    }

    /**
     * The user is done and wants to create the item, so return it
     * back to the presenter.
     */
    submitPayer() {
        this.submitAttempt = true;
        console.log("valid",this.payerForm.valid)
        console.log("value",this.payerForm.value)
        if (!this.payerForm.valid) {return;}
        this.orderData.payerInfo = this.payerForm.value;
        this.checkAdvance();

    }
    /**
     * The user is done and wants to create the item, so return it
     * back to the presenter.
     */
    checkAdvance() {
        if (this.orderData.payerAddress && this.orderData.payerInfo) {
            this.navCtrl.navigateForward('tabs/payu/credit/card');
        }
    }

    /**
       * The view loaded, let's query our items for the list
       */
    ionViewDidEnter() {
        let paramsSent = this.params.getParams();
        this.currentItems = paramsSent.items;
        if (this.orderData.payerAddress) {
            this.showAddressCard = true;
            this.selectedAddress = this.orderData.payerAddress;

        } else {


        }
    }
    keytab(event) {
        let nextInput = event.srcElement.nextElementSibling; // get the sibling element

        var target = event.target || event.srcElement;
        var id = target.id
        console.log(id.maxlength); // prints undefined

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
    continuePayer() {
        this.checkAdvance();
    }
    changeAddress() {
        this.showAddressCard = false;
    }

    ngOnInit() {
    }

}
