import {Component, OnInit, ViewChild} from '@angular/core';
import {NavController, ModalController, AlertController, IonContent} from '@ionic/angular';
import {Item} from '../../models/item';
import {Payment} from '../../models/payment';
import {ParamsService} from '../../services/params/params.service';
import {OrderService} from '../../services/order/order.service';
import {OrderDataService} from '../../services/order-data/order-data.service';
import {UserService} from '../../services/user/user.service';
import {UserDataService} from '../../services/user-data/user-data.service';
import {CartService} from '../../services/cart/cart.service';
import {BillingService} from '../../services/billing/billing.service';
import {BuyerSelectPage} from '../buyer-select/buyer-select.page';
import {ApiService} from '../../services/api/api.service';
@Component({
    selector: 'app-checkout-options-payu',
    templateUrl: './checkout-options-payu.page.html',
    styleUrls: ['./checkout-options-payu.page.scss'],
})
export class CheckoutOptionsPayuPage implements OnInit {
    @ViewChild(IonContent) content: IonContent;
    showPayment: boolean;
    showPayers: boolean;
    showSplit: boolean;
    paymentMethod: any;
    merchant: any;
    hasSavedCard: boolean;
    requiresDelivery: boolean;
    currentItems: Item[] = [];
    conditions: any[] = [];
    payment: Payment;
    order: any;
    coupon: any;
    payers: any[] = [];
    // Our translated text strings
    private cartErrorString: string;
    public totalItems: any;
    public delivery: any;
    public delivery2: any;
    public deliveryRule: any;
    public subtotal: any;
    public total: any;
    split: any;
    recurring: any;


    constructor(public navCtrl: NavController,
        public cartProvider: CartService,
        public orderData: OrderDataService,
        public userData: UserDataService,
        public api: ApiService,
        public user: UserService,
        public orderProvider: OrderService,
        public modalCtrl: ModalController,
        public billing: BillingService,
        public params: ParamsService,
        public alertCtrl: AlertController) {
        this.coupon = "";
        this.showPayment = false;
        this.payment= new Payment({});
        this.hasSavedCard = false;
        this.requiresDelivery = false;
        console.log("User");
        console.log(JSON.stringify(this.userData._user));

    }

    scrollToTop() {
        setTimeout(() => {
            this.content.scrollToTop(300);
        }, 400);

    }
    ionViewDidEnter() {
        this.coupon = "";
        this.showPayment = false;
        this.hasSavedCard = false;
        let endDate = new Date();
        endDate.setDate(endDate.getDate() + 1);
        this.user.getUser().subscribe((resp: any) => {
            if (resp) {
                console.log("getUser", resp);
                this.userData._user = resp.user;
                let savedCards = resp.savedCards;
                for (let key in savedCards) {
                    if (savedCards[key] == "PayU") {
                        this.userData._user.savedCard = true;
                        this.hasSavedCard = true;
                    }
                }
                console.log("getUser", this.userData._user);
            }

        }, (err) => {
            this.api.toast('USER.GET_USER_ERROR');
            this.api.handleError(err);
        });
        this.deliveryRule = endDate.toISOString();
        console.log("deliveryRule", this.deliveryRule);
        console.log("Has saved card", this.hasSavedCard);
        this.showPayers = false;
        this.showSplit = false;
        this.currentItems = [];
        this.conditions = [];
        this.payers = [];
        let paramsSent = this.params.getParams();
        if(paramsSent){
            if(paramsSent.payment){
                this.payment = paramsSent.payment;
            }
        }
    }


    selectPaymentOption() {
        let option = this.paymentMethod;
        if (option == "QUICK") {
            this.quickPay();
        } else if (option == "IN_BANK") {
            this.payInBank();
        } else {
            this.orderData.paymentMethod = option;
            let nextPage = this.orderData.getStep2(option);
            console.log("Next page", nextPage);
            this.navCtrl.navigateForward(nextPage);
        }
    }

    quickPay() {
        this.api.loader('CHECKOUT_PREPARE.PREPARE_ORDER_STARTING');

        let container = {
            quick: true,
            payment_id: this.payment.id,
            platform: "Food"
        };
        console.log("before payCreditCard token", container);
        this.billing.payCreditCard(container,"PayU").subscribe((data: any) => {
            let transaction = data.response.transactionResponse;
            this.transactionResponse(transaction, null);
        }, (err) => {
            this.api.dismissLoader();
            // Unable to log in
            this.api.toast('CHECKOUT_CARD.PAY_CC_ERROR');
            this.api.handleError(err);
        });
    }
    openSupport() {
        this.params.setParams({
            type: "platform",
            objectId: "food"
        })
        this.navCtrl.navigateForward('shop/settings/addresses/');
    }
    payInBank() {
        this.api.loader();
        let payers = [];
        let payersContainer = this.orderData.payers;
        for (let item in payersContainer) {
            payers.push(payersContainer[item].user_id);
        }
        let recurring_type = "limit";
        let recurring_value = 3;
        let order_id = null;
        let merchant_id = null;
        if(this.orderData.currentOrder){
            order_id = this.orderData.currentOrder.id;
            merchant_id = this.orderData.currentOrder.merchant_id;
        } else {
            order_id = this.payment.order.id;
            merchant_id = this.payment.order.merchant_id;
        }
        let container = {
            "order_id": order_id,
            "payers": payers,
            "split_order": this.split,
            "platform": "Food",
            "recurring": this.recurring,
            "recurring_type": recurring_type,
            "recurring_value": recurring_value,
            "merchant_id": merchant_id,
            "payment_id": this.payment.id
        };
        console.log("before payCreditCard token", container);
        this.billing.payInBank(container).subscribe((data: any) => {
            this.api.dismissLoader();
            if (data.status == "success") {
                console.log("after payInBank");
                this.orderData.clearOrder();
                this.params.setParams({
                    objectId: data.payment.id,
                    newPayment: true
                });
                    this.navCtrl.navigateForward('shop/settings/payments/' + data.payment.id);
                } else {
                // Unable to pay in bank
                this.api.toast('CHECKOUT_PREPARE.PAY_IN_BANK_ERROR');
            }

        }, (err) => {
            this.api.dismissLoader();
            // Unable to log in
            this.api.toast('CHECKOUT_CARD.PAY_CC_ERROR');
            this.api.handleError(err);
        });
    }
    /**
     * Navigate to the detail page for this item.
     */
    transactionResponse(transaction, paid) {
        this.api.dismissLoader();
        console.log("after payCreditCard");
        let total = null;
        if(this.orderData.currentOrder){
            total = this.orderData.currentOrder.total;
        }
        this.orderData.clearOrder();
        let vm = this;
        setTimeout(function () {vm.user.postLogin();}, 1000);
        let container = null;
        if (paid) {
            container = {
                transaction: transaction,
                total: total,
                is_paid: true
            };
        } else {
            container = {
                transaction: transaction,
                total: total
            };
        }
        this.params.setParams(container);
        this.navCtrl.navigateForward('shop/payu/complete');
    }


    ngOnInit() {
    }

}
