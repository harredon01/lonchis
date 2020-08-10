import {Component, OnInit, ViewChild} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {NavController, ToastController, ModalController, AlertController, LoadingController, IonContent} from '@ionic/angular';
import {Item} from '../../models/item';
import {Payment} from '../../models/payment';
import {ParamsService} from '../../services/params/params.service';
import {SpinnerDialog} from '@ionic-native/spinner-dialog/ngx';
import {OrderService} from '../../services/order/order.service';
import {OrderDataService} from '../../services/order-data/order-data.service';
import {UserService} from '../../services/user/user.service';
import {UserDataService} from '../../services/user-data/user-data.service';
import {CartService} from '../../services/cart/cart.service';
import {BillingService} from '../../services/billing/billing.service';
import {BuyerSelectPage} from '../buyer-select/buyer-select.page';
import {ApiService} from '../../services/api/api.service';
@Component({
    selector: 'app-checkout-prepare',
    templateUrl: './checkout-prepare.page.html',
    styleUrls: ['./checkout-prepare.page.scss'],
})
export class CheckoutPreparePage implements OnInit {
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
    shipping: any[] = [];
    selectShipping: boolean = false;
    shippingError: boolean = false;
    expectedProviders: any = 2;
    payment: Payment;
    order: any;
    coupon: any;
    payers: any[] = [];
    // Our translated text strings
    private cartErrorString: string;
    private couponErrorString: string;
    private couponErrorString2: string;
    public totalItems: any;
    public delivery: any;
    public delivery2: any;
    public deliveryRule: any;
    public subtotal: any;
    public total: any;
    split: any;
    recurring: any;

    private prepareOrderErrorString: string;
    private prepareOrderStartingString: string;
    private prepareOrderCreateString: string;
    private cardErrorString: string;
    private banksErrorString: string;
    private couponSuccessString: string;
    private loginErrorString: string;
    private cartUpdate: string;
    private requiresDeliveryString: string;
    private requiresShippingString: string;
    private requiresItemString: string;
    loading: any;

    constructor(public navCtrl: NavController,
        public cartProvider: CartService,
        public orderData: OrderDataService,
        public userData: UserDataService,
        public api: ApiService,
        public user: UserService,
        public orderProvider: OrderService,
        public modalCtrl: ModalController,
        public toastCtrl: ToastController,
        public billing: BillingService,
        public params: ParamsService,
        public alertCtrl: AlertController,
        public translateService: TranslateService,
        public loadingCtrl: LoadingController,
        private spinnerDialog: SpinnerDialog) {
        this.coupon = "";
        this.showPayment = false;
        this.hasSavedCard = false;
        this.requiresDelivery = false;
        console.log("User");
        console.log(JSON.stringify(this.userData._user));
        this.translateService.get('CHECKOUT_CARD.PAY_CC_ERROR').subscribe((value) => {
            this.cardErrorString = value;
        });
        this.translateService.get('CHECKOUT_PREPARE.COUPON_ERROR').subscribe((value) => {
            this.couponErrorString = value;
        });
        this.translateService.get('CHECKOUT_PREPARE.COUPON_UNUSABLE').subscribe((value) => {
            this.couponErrorString2 = value;
        });
        this.translateService.get('CHECKOUT_PREPARE.REQUIRES_DELIVERY').subscribe((value) => {
            this.requiresDeliveryString = value;
        });
        this.translateService.get('CHECKOUT_PREPARE.REQUIRES_SHIPPING').subscribe((value) => {
            this.requiresShippingString = value;
        });
        this.translateService.get('CHECKOUT_PREPARE.REQUIRES_ITEM').subscribe((value) => {
            this.requiresItemString = value;
        });
        this.translateService.get('CHECKOUT_PREPARE.PAY_IN_BANK_ERROR').subscribe((value) => {
            this.banksErrorString = value;
        });
        this.translateService.get('CHECKOUT_PREPARE.PREPARE_ORDER_CREATE').subscribe((value) => {
            this.prepareOrderCreateString = value;
        });
        this.translateService.get('CHECKOUT_PREPARE.PREPARE_ORDER_ERROR').subscribe((value) => {
            this.prepareOrderErrorString = value;
        });
        this.translateService.get('CHECKOUT_PREPARE.PREPARE_ORDER_STARTING').subscribe((value) => {
            this.prepareOrderStartingString = value;
        });
        this.translateService.get('CHECKOUT_PREPARE.COUPON_SUCCESS').subscribe((value) => {
            this.couponSuccessString = value;
        });
        this.translateService.get('USER.GET_USER_ERROR').subscribe((value) => {
            this.loginErrorString = value;
        });
        this.translateService.get('CART.ITEM_UPDATED').subscribe((value) => {
            this.cartUpdate = value;
        })


    }
    getOrder() {
        this.orderProvider.getOrder().subscribe((data: any) => {
            this.orderData.currentOrder = data.data;
            this.loadSavedPayers();
            this.setDiscounts();
        });
    }
    loadSavedPayers() {
        this.orderData.loadSavedPayers(this.orderData.currentOrder.id).then((value) => {
            if (this.orderData.payers.length > 0) {
                this.payers = this.orderData.payers;
                this.showPayers = true;
                if (this.showSplit) {
                    this.split = true;
                }
            }
            console.log("payers", this.payers);
        });
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
        this.requiresDelivery = false;
        let endDate = new Date();
        endDate.setDate(endDate.getDate() + 1);
        this.deliveryRule = endDate.toISOString();
        console.log("deliveryRule", this.deliveryRule);
        console.log("Has saved card", this.hasSavedCard);
        this.showPayers = false;
        this.showSplit = false;
        this.currentItems = [];
        this.conditions = [];
        this.payers = [];
        let paramsSent = this.params.getParams();
        if (paramsSent) {
            if (paramsSent.is_meal) {
                let isMeal = paramsSent.is_meal;
                console.log("Is meal", isMeal);
                if (isMeal == 0) {
                    this.showSplit = true;
                }
            }
        }
        if (this.orderData.currentOrder) {
            this.loadSavedPayers();
            this.setDiscounts();
        } else {
            this.getOrder();
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
    addCoupon() {
        console.log("add coupon", this.coupon);
        if (this.coupon.length > 0) {
            this.showLoaderEmpty();
            this.orderProvider.setCoupon(this.coupon).subscribe((resp: any) => {
                if (resp) {
                    let message = "";
                    if (resp.status == "success") {
                        this.orderData.cartData = resp.cart;
                        this.updateCartTotals();
                        this.coupon = "";
                        message = this.couponSuccessString;
                    } else {
                        message = this.couponErrorString2;
                        // Unable to log in

                    }
                    this.dismissLoader();
                    let toast = this.toastCtrl.create({
                        message: message,
                        duration: 3000,
                        position: 'top'
                    }).then(toast => toast.present());
                }
            }, (err) => {
                this.dismissLoader();
                // Unable to log in
                let toast = this.toastCtrl.create({
                    message: this.couponErrorString,
                    duration: 3000,
                    position: 'top'
                }).then(toast => toast.present());
                this.api.handleError(err);
            });
        }

    }
    selectDeliveryDate() {
        console.log("Delivery", this.delivery);
        if (this.delivery2) {
            this.orderData.deliveryDate = this.delivery + "T" + this.delivery2;
        } else {
            this.orderData.deliveryDate = this.delivery;
        }

        console.log("Order data delivery", this.orderData.deliveryDate);
    }

    openSupport() {
        this.params.setParams({
            type: "platform",
            objectId: "booking"
        })
        this.navCtrl.navigateForward('tabs/settings/addresses/');
    }

    /**
     * Navigate to the detail page for this item.
     */
    transactionResponse(transaction, paid) {
        this.dismissLoader();
        console.log("after payCreditCard");
        let total = this.orderData.currentOrder.total;
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
        this.navCtrl.navigateForward('tabs/payu/complete');
    }
    prepareOrder() {
        this.showLoader();
        this.showPayment = false;
        this.shippingError = false;
        let payers = [];
        let payersContainer = this.orderData.payers;
        for (let item in payersContainer) {
            payers.push(payersContainer[item].user_id);
        }
        let recurring_type = "limit";
        let recurring_value = 3;
        if (this.orderData.currentOrder.merchant_id == 1300) {
            recurring_type = "calendar";
            recurring_value = null;
        }
        let container = {
            "order_id": this.orderData.currentOrder.id,
            "payers": payers,
            "delivery_date": this.delivery,
            "split_order": this.split,
            "platform": "Booking",
            "recurring": this.recurring,
            "recurring_type": recurring_type,
            "recurring_value": recurring_value,
            "merchant_id": this.orderData.currentOrder.merchant_id
        };
        this.orderProvider.prepareOrder(container, "Booking").subscribe((resp: any) => {
            if (resp) {
                if (resp.status == "success") {
                    this.dismissLoader();
                    console.log("orderProvider", resp);
                    this.orderData.payment = resp.payment;
                    this.payment = resp.payment;
                    this.order = resp.order;
                    if (this.payment.total == this.payment.transaction_cost) {
                        let container = {
                            "payment_id": this.payment.id
                        }
                        this.showLoader();
                        this.billing.completePaidOrder(container).subscribe((resp: any) => {
                            if (resp.status == "success") {
                                this.transactionResponse(null, true);
                            } else {
                                this.showPayment = true;
                                this.scrollToTop();
                            }
                        }, (err) => {
                            this.showPayment = true;
                            this.scrollToTop();
                            console.log("completePaidOrderError", err);
                        });
                    } else {
                        let container = {"payment": this.payment};
                        this.params.setParams(container);
                        //this.navCtrl.navigateForward("tabs/mercado-pago-options");
                        this.navCtrl.navigateForward("tabs/payu/options");
                    }
                } else {
                    this.handleCheckError(resp);
                }

            }
        }, (err) => {
            this.dismissLoader();
            console.log("getCartError", err);
            this.orderData.cartData = null;
            this.dismissLoader();
            // Unable to log in
            let toast = this.toastCtrl.create({
                message: this.prepareOrderErrorString,
                duration: 3000,
                position: 'top'
            }).then(toast => toast.present());
            this.api.handleError(err);
        });
    }
    setDiscounts() {
        this.showLoader2()
        this.orderProvider.setDiscounts(this.orderData.currentOrder.id, "Booking").subscribe((resp: any) => {

            if (resp) {
                console.log("setDiscounts", resp);
                console.log(JSON.stringify(resp));
                this.orderData.payment = resp.payment;
                this.payment = resp.payment;
                this.checkOrder();
            }
        }, (err) => {
            this.dismissLoader();
            console.log("getCartError", err);
            this.orderData.cartData = null;
            this.api.handleError(err);
        });
    }
    async addPayers(missing: any) {
        let container = {
            "necessary": missing,
            "merchant": this.merchant
        };
        this.split = true;
        console.log("BuyerSelectPage", container);

        let addModal = await this.modalCtrl.create({
            component: BuyerSelectPage,
            componentProps: container
        });
        await addModal.present();
        const {data} = await addModal.onDidDismiss();
        if (data == "done") {
            this.payers = this.orderData.payers;
            this.showPayers = true;
            this.split = true;
            this.setDiscounts();
        }
    }
    showPromptDeposit(missing: any, item: any, merchant: any) {
        let message = "";
        if (merchant == 1299) {
            message = "Debes agregar " + missing + " depositos para comprar este plan. quieres que los agreguemos?";
        } else {
            message = "Debes agregar minimo " + missing + " mesero para completar este pedido. quieres que lo agreguemos?";
        }
        const prompt = this.alertCtrl.create({
            header: 'Atencion',
            message: message,
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
                        this.addCartItem(item.id, missing, merchant);
                    }
                }
            ]
        }).then(toast => toast.present());
    }
    showPromptPayers(missing: any) {
        const prompt = this.alertCtrl.create({
            header: 'Atencion',
            message: "Debes agregar " + missing + " usuarios para comprar este plan. quieres que los agreguemos?",
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
                        this.addPayers(missing);
                    }
                }
            ]
        }).then(toast => toast.present());
    }
    addCartItem(item, amount, merchant) {
        return new Promise((resolve, reject) => {
            let container = {
                order_id: this.orderData.currentOrder.id,
                product_variant_id: item,
                quantity: amount,
                item_id: null,
                merchant_id: merchant
            };
            this.cartProvider.addCartItem(container).subscribe((resp: any) => {
                this.orderData.cartData = resp.cart;
                this.updateCartTotals();
                this.setDiscounts();
            }, (err) => {
                //this.navCtrl.push(MainPage);
                // Unable to log in
                this.api.handleError(err);
                let toast = this.toastCtrl.create({
                    message: this.cartErrorString,
                    duration: 3000,
                    position: 'top'
                }).then(toast => toast.present());
                resolve(null);
            });
        });

    }
    setPlatformShipping(platform) {
        return new Promise((resolve, reject) => {
            console.log("Setting shipping condition", platform);
            this.showLoader();
            this.orderProvider.setPlatformShippingCondition(this.orderData.currentOrder.id, platform).subscribe((resp: any) => {
                console.log(JSON.stringify(resp));
                this.orderData.cartData = resp.cart;
                this.selectShipping = false;
                this.updateCartTotals();
                this.dismissLoader();
                this.setDiscounts();
            }, (err) => {
                this.dismissLoader();
                //this.navCtrl.push(MainPage);
                // Unable to log in
                let toast = this.toastCtrl.create({
                    message: this.cartErrorString,
                    duration: 3000,
                    position: 'top'
                }).then(toast => toast.present());
                this.api.handleError(err);
                resolve(null);
            });
        });

    }
    getPlatformShippingPrice(order, platform) {
        return new Promise((resolve, reject) => {
            console.log("getting shipping price");
            this.orderProvider.getPlatformShippingPrice(order, platform).subscribe((resp: any) => {
                if (resp.status == "success") {
                    let container = {platform: platform, price: resp.price}
                    this.shipping.push(container);
                }
                this.expectedProviders--;
                this.dismissLoader();
                this.selectShipping = true;
                console.log(JSON.stringify(resp));
            }, (err) => {
                this.dismissLoader();
                //this.navCtrl.push(MainPage);
                // Unable to log in
                let toast = this.toastCtrl.create({
                    message: this.cartErrorString,
                    duration: 3000,
                    position: 'top'
                }).then(toast => toast.present());
                this.api.handleError(err);
                resolve(null);
            });
        });
    }
    handleCheckError(resp: any) {
        let message = "";
        let showalert = true;
        if (resp.type == "credits") {
            this.dismissLoader();
            let missing = parseInt(resp.required_credits);
            console.log("Required credits", missing);
            console.log("creditItem", resp.creditItem);
            message = this.requiresItemString;
            console.log("creditItemMerchant", resp.creditItemMerchant);
            this.addCartItem(resp.creditItem.id, missing, resp.creditItemMerchant);
        } else if (resp.type == "buyers") {
            this.dismissLoader();
            showalert = false;
            let missing = parseInt(resp.required_buyers);
            this.addPayers(missing);
        } else if (resp.type == "shipping") {
            message = this.requiresShippingString;
            if (this.currentItems.length == 0) {
                this.getCart();
            }
            if (this.shipping.length == 0) {
                this.getPlatformShippingPrice(resp.order.id, "Rapigo");
                this.getPlatformShippingPrice(resp.order.id, "Basilikum");
            } else {
                this.shippingError = true;
            }

        } else if (resp.type == "delivery") {
            message = this.requiresDeliveryString;
            this.dismissLoader();
            let endDate = new Date();
            if (this.currentItems.length == 0) {
                this.getCart();
            }
            endDate.setDate(endDate.getDate() + 1);
            //this.delivery = endDate.toISOString();
            console.log("delivery", this.delivery);
            this.requiresDelivery = true;
        }
        if (showalert) {
            let toast = this.toastCtrl.create({
                message: message,
                duration: 3000,
                position: 'top'
            }).then(toast => toast.present());

        }

    }
    checkOrder() {
        let payers = [];
        this.shippingError = false;
        let payersContainer = this.orderData.payers;
        for (let item in payersContainer) {
            payers.push(payersContainer[item].user_id);
        }
        let data = {"payers": payers, "platform": "Booking"};
        this.orderProvider.checkOrder(this.orderData.currentOrder.id, data).subscribe((resp: any) => {
            if (resp) {
                console.log("Check order result", resp);
                console.log(JSON.stringify(resp));
                this.orderData.payment = resp.payment;
                this.payment = resp.payment;
                if (resp.status == "success") {
                    this.getCart();

                    this.dismissLoader();
                } else {
                    this.handleCheckError(resp);
                }
            }
        }, (err) => {
            this.dismissLoader();
            console.log("getCartError", err);
            this.orderData.cartData = null;
            this.api.handleError(err);
        });
    }

    getCart() {
        this.cartProvider.getCheckoutCart().subscribe((resp) => {
            if (resp) {
                console.log("getCheckoutCart", resp);
                this.orderData.cartData = resp;
                this.updateCartTotals();
            }
        }, (err) => {
            console.log("getCartError", err);
            this.orderData.cartData = null;
            this.api.handleError(err);
        });
    }

    showLoader() {
        if (document.URL.startsWith('http')) {
            this.loading = this.loadingCtrl.create({
                spinner: 'crescent',
                message: this.prepareOrderStartingString,
                backdropDismiss: true
            }).then(toast => toast.present());
        } else {
            this.spinnerDialog.show(null, this.prepareOrderStartingString);
        }
    }
    showLoaderEmpty() {
        if (document.URL.startsWith('http')) {
            this.loading = this.loadingCtrl.create({
                spinner: 'crescent',
                backdropDismiss: true
            }).then(toast => toast.present());
        } else {
            this.spinnerDialog.show();
        }
    }
    showLoader2() {
        if (document.URL.startsWith('http')) {
            this.loading = this.loadingCtrl.create({
                spinner: 'crescent',
                message: this.prepareOrderCreateString,
                backdropDismiss: true
            }).then(toast => toast.present());
        } else {
            this.spinnerDialog.show(null, this.prepareOrderCreateString);
        }
    }
    updateCartTotals() {
        let cartContainer = this.orderData.cartData;
        this.currentItems = [];
        console.log("cartContainer", cartContainer);
        let results = cartContainer.items;
        this.totalItems = cartContainer.totalItems;
        this.subtotal = cartContainer.subtotal;
        this.total = cartContainer.total;
        let conditions = cartContainer.conditions;
        for (let item in conditions) {
            if (conditions[item].getName == "Costo fijo transaccion") {
                conditions.splice(item, 1);
            }
            if (conditions[item].getName == "Costo variable transaccion") {
                conditions[item].total = conditions[item].total + 900;
            }
        }
        this.conditions = conditions;
        if (this.conditions) {
            this.conditions.sort(this.compare);
        }
        for (let index = 0; index < results.length; ++index) {
            console.log(results[index]);
            if (results[index].attributes.image) {
                results[index].image = results[index].attributes.image.file;
            }
            if (results[index].attributes.merchant_id) {
                this.merchant = results[index].attributes.merchant_id;
            }

            let itemAdd = new Item(results[index]);
            this.currentItems.push(itemAdd);
        }
        this.currentItems.sort(this.compare);
        console.log("Cart items", this.currentItems);
    }
    compare(a, b) {
        // Use toUpperCase() to ignore character casing
        let genreA = a.id;
        let genreB = b.id;

        let comparison = 0;
        if (genreA > genreB) {
            comparison = 1;
        } else if (genreA < genreB) {
            comparison = -1;
        }
        return comparison;
    }
    reduceCartItem(item: any) {
        item.quantity--;
        this.addCartItem2(item);

    }
    increaseCartItem(item: any) {
        item.quantity++;
        this.addCartItem2(item);
    }
    cartUpdateMessage() {
        let toast = this.toastCtrl.create({
            message: this.cartUpdate,
            duration: 3000,
            position: 'top'
        }).then(toast => toast.present());
    }
    handleCartSuccess(resp: any, item: any) {
        this.dismissLoader();
        this.getCart();
        this.cartUpdateMessage();
    }
    handleCartError(resp: any, item) {
        this.dismissLoader();
        console.log("Error", resp);
        let toast = this.toastCtrl.create({
            message: resp.message,
            duration: 3000,
            position: 'top'
        }).then(toast => toast.present());
    }
    handleServerCartError() {
        this.dismissLoader();
        //this.navCtrl.push(MainPage);
        // Unable to log in
        let toast = this.toastCtrl.create({
            message: this.cartErrorString,
            duration: 3000,
            position: 'top'
        }).then(toast => toast.present());
    }
    addCartItem2(item: any) {
        this.showLoader();
        return new Promise((resolve, reject) => {
            let container = null;
            container = {
                product_variant_id: item.attributes.product_variant_id,
                quantity: item.quantity,
                order_id: this.orderData.currentOrder.id,
                item_id: item.id,
                merchant_id: item.attributes.merchant_id
            };
            console.log("Add cart item", container);
            if (container.item_id) {
                this.cartProvider.updateCartItem(container).subscribe((resp: any) => {
                    console.log("updateCartItem", resp);
                    if (resp.status == "success") {
                        this.handleCartSuccess(resp, item);
                        if (resp.item) {
                            resolve(resp.item);
                        } else {
                            resolve(null);
                        }
                    } else {
                        this.handleCartError(resp, item);
                        resolve(null);
                    }

                }, (err) => {
                    this.handleServerCartError();
                    this.api.handleError(err);
                    resolve(null);
                });
            } else {
                this.cartProvider.addCartItem(container).subscribe((resp: any) => {
                    if (resp.status == "success") {
                        this.handleCartSuccess(resp, item);
                    } else {
                        this.handleCartError(resp, item);
                        resolve(null);
                    }
                    //this.navCtrl.push(MainPage);
                }, (err) => {
                    this.handleServerCartError();
                    this.api.handleError(err);
                    resolve(null);
                });
            }
        });
    }

    /**
     * Delete an item from the list of cart.
     */
    deleteItem(item) {
        this.showLoader();
        item.quantity = 0;
        this.cartProvider.updateCartItem(item).subscribe((resp: any) => {
            if (resp.status == "success") {
                this.handleCartSuccess(resp, item);
            } else {
                this.handleCartError(resp, item);
            }
        }, (err) => {
            this.handleServerCartError();
            this.api.handleError(err);
        });
    }

    ngOnInit() {
    }

}
