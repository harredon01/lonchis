import {Component, OnInit} from '@angular/core';
import {NavController, ToastController, ModalController, AlertController, LoadingController} from '@ionic/angular';
import {ParamsService} from '../../services/params/params.service';
import {SpinnerDialog} from '@ionic-native/spinner-dialog/ngx';
import {Events} from '../../services/events/events.service';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute} from '@angular/router';
import {ProductsService} from '../../services/products/products.service';
import {OrderDataService} from '../../services/order-data/order-data.service';
import {UserDataService} from '../../services/user-data/user-data.service';
import {CartService} from '../../services/cart/cart.service';
import {DynamicRouterService} from '../../services/dynamic-router/dynamic-router.service';
import {Product} from '../../models/product';
import {CartPage} from '../cart/cart.page';
import {ApiService} from '../../services/api/api.service';
@Component({
    selector: 'app-merchant-products',
    templateUrl: './merchant-products.page.html',
    styleUrls: ['./merchant-products.page.scss'],
})
export class MerchantProductsPage implements OnInit {
    products: Product[] = [];
    categories: any[] = [];
    options: any[];
    urlSearch: string = "";
    payTitle: string = "";
    isOwner: boolean = false;
    slides: any[];
    loading: any;
    merchantObj: {
        merchant_name: string,
        merchant_description: string,
        merchant_type: string,
        src: string,
    } = {
            merchant_name: "",
            merchant_description: "",
            merchant_type: "",
            src: "",
        };
    possibleAmounts: any[];
    merchant: any;
    page: any;
    private cartErrorString: string;
    private showMoreText: string;
    private showLessText: string;
    private dateLessText: string;
    private clearCartText: string;
    private cartUpdate: string;
    private minAmount: string;

    constructor(public navCtrl: NavController,
        public activatedRoute: ActivatedRoute,
        public productsServ: ProductsService,
        public toastCtrl: ToastController,
        public api: ApiService,
        private drouter: DynamicRouterService,
        public modalCtrl: ModalController,
        public alertCtrl: AlertController,
        private spinnerDialog: SpinnerDialog,
        public loadingCtrl: LoadingController,
        public cart: CartService,
        public events: Events,
        public params: ParamsService,
        public userData: UserDataService,
        public orderData: OrderDataService,
        public translateService: TranslateService) {
        this.translateService.get('CART.ERROR_UPDATE').subscribe((value) => {
            this.cartErrorString = value;
        });
        this.translateService.get('CART.PAY_TITLE').subscribe((value) => {
            this.payTitle = value;
        })
        this.translateService.get('INPUTS.SHOW_MORE').subscribe((value) => {
            this.showMoreText = value;
        })
        this.translateService.get('INPUTS.SHOW_LESS').subscribe((value) => {
            this.showLessText = value;
        })
        this.translateService.get('PRODUCTS.DATE_LESS').subscribe((value) => {
            this.dateLessText = value;
        })
        this.translateService.get('CART.ERROR_CLEAR').subscribe((value) => {
            this.clearCartText = value;
        })
        this.translateService.get('CART.ITEM_UPDATED').subscribe((value) => {
            this.cartUpdate = value;
        })
        this.translateService.get('CART.MIN_QUANTITY').subscribe((value) => {
            this.minAmount = value;
        })
        this.page = 1;
        this.slides = [];
        let paramsSent = this.params.getParams();
        let merchant = this.activatedRoute.snapshot.paramMap.get('objectId');
        if(merchant){
            this.merchant = merchant;
        } else {
            this.merchant = paramsSent.objectId;
        }
        this.isOwner = paramsSent.owner;
        if (paramsSent.settings) {
            this.urlSearch = "tabs/settings/merchants/" + this.merchant;
        } else {
            let category = this.activatedRoute.snapshot.paramMap.get('categoryId');
            this.urlSearch = 'tabs/home/categories/' + category + '/merchant/' + this.merchant;
        }
        this.products = [];
        this.possibleAmounts = [];
        this.showLoader();
        this.loadProducts();
        this.loadOptions();
        if (!this.orderData.cartData) {
            this.getCart();
        }
        console.log("User: ", this.userData._user);
        events.subscribe('cart:deleteItem', (resp:any) => {
            console.log("Deleting item", resp.item);
            this.clearCartItem(resp.item);
            // user and time are the same arguments passed in `events.publish(user, time)`
        });
        events.subscribe('cart:clear', (resp:any) => {
            this.clearCart();
            // user and time are the same arguments passed in `events.publish(user, time)`
        });
    }
    ionViewDidEnter() {
        this.products = [];
        this.possibleAmounts = [];
        this.showLoader();
        this.loadProducts();
        this.loadOptions();
        if (document.URL.startsWith('http')) {
            let vm = this;
            setTimeout(function(){ vm.dismissLoader();console.log("Retrying closing") }, 1000);
            setTimeout(function(){ vm.dismissLoader();console.log("Retrying closing") }, 2000);
        }
    }
    addCart(item: any) {
        this.addCartItem(item);
    }
    editProduct(productId: any) {
        if (productId == 0) {
            productId = null;
        }
        console.log("Entering edit prod", this.urlSearch + "/products/edit/" + productId);
        this.navCtrl.navigateForward(this.urlSearch + "/products/edit/" + productId);
    }
    editImages(productId: any) {
        let container = {"type": "Product", "objectId": productId};
        this.params.setParams(container);
        this.navCtrl.navigateForward(this.urlSearch + "/products/images/" + productId);
    }
    presentAlertPay(item: any) {
        this.alertCtrl.create({
            header: this.payTitle,
            inputs: [],
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                    cssClass: 'secondary',
                    handler: () => {
                        console.log('Confirm Cancel');
                    }
                }, {
                    text: 'Ok',
                    handler: (resp) => {
                        console.log('Confirm Ok', item);
                        this.params.setParams({"merchant_id": this.merchant});
                        if (this.userData._user) {
                            if (item.attributes.is_shippable == true) {
                                this.navCtrl.navigateForward('tabs/home/checkout/shipping/' + this.merchant);
                            } else {
                                this.navCtrl.navigateForward('tabs/home/checkout/prepare');
                            }
                        } else {
                            if (item.attributes.is_shippable == true) {
                                this.drouter.addPages('tabs/home/checkout/shipping/' + this.merchant);
                            } else {
                                this.drouter.addPages('tabs/home/checkout/prepare');
                            }
                            this.navCtrl.navigateForward('login');
                        }
                    }
                }
            ]
        }).then(toast => toast.present());
    }
    showLoader() {
        if (document.URL.startsWith('http')) {
            this.loadingCtrl.create({
                spinner: 'crescent',
                backdropDismiss: true
            }).then(toast => toast.present());
        } else {
            this.spinnerDialog.show();
        }
    }
    showPrompt(item: any) {
        const prompt = this.alertCtrl.create({
            header: 'Atencion',
            message: this.clearCartText,
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
                        this.clearCartLocal(item);
                    }
                }
            ]
        }).then(toast => toast.present());
    }
    showPromptMin(item: any) {
        const prompt = this.alertCtrl.create({
            header: 'Atencion',
            message: this.minAmount + item.quantity,
            inputs: [],
            buttons: [
                {
                    text: 'OK',
                    handler: data => {
                        console.log('Cancel clicked');
                    }
                }
            ]
        }).then(toast => toast.present());
    }
    clearCartLocal(item: any) {
        this.cart.clearCart().subscribe((resp) => {
            this.orderData.cartData = {};
            this.orderData.shippingAddress = null;
            this.orderData.cartData.items = [];
            this.orderData.cartData.total = 0;
            this.orderData.cartData.subtotal = 0;
            this.orderData.cartData.totalItems = 0;
            this.events.publish('cart:clear',{});
            this.addCartItem(item);
            //this.navCtrl.push(MainPage);
        }, (err) => {
            //this.navCtrl.push(MainPage);
            // Unable to log in
            let toast = this.toastCtrl.create({
                message: this.cartErrorString,
                duration: 3000,
                position: 'top'
            }).then(toast => toast.present());
            this.api.handleError(err);
        });
    }
    showMore(item: any) {
        console.log("showMore");
        if (item.description_more) {
            item.description_more = false;
        } else {
            item.description_more = true;
        }
    }
    showMoreM(item: any) {
        //        this.openTutorials();
        console.log("showMoreM");
        if (item.merchant_description_more) {
            item.merchant_description_more = false;
        } else {
            item.merchant_description_more = true;
        }
    }
    clearCart() {
        for (let item in this.categories) {
            for (let i in this.categories[item].products) {
                this.categories[item].products[i].inCart = false;
                this.categories[item].products[i].item_id = null;
            }
        }
        return null;
    }
    clearCartItem(item: any) {
        let product_variant_it = item.attributes.product_variant_id;
        for (let item in this.categories) {
            for (let i in this.categories[item].products) {
                let container = this.categories[item].products[i];
                for (let variant in container.variants) {
                    if (container.variants[variant].id == product_variant_it) {
                        this.categories[item].products[i].inCart = false;
                        this.categories[item].products[i].item_id = null;
                        return true;
                    }
                }
            }
        }
        return null;
    }
    reduceCartItem(item: any) {
        item.amount--;
        this.addCartItem(item);

    }
    increaseCartItem(item: any) {
        item.amount++;
        this.addCartItem(item);
    }
    cartUpdateMessage() {
        let toast = this.toastCtrl.create({
            message: this.cartUpdate,
            duration: 1300,
            position: 'top'
        }).then(toast => toast.present());
    }
    handleCartSuccess(resp: any, item: any) {
        this.orderData.cartData = resp.cart;
        let showPromt = false;
        if (!item.inCart) {
            showPromt = true;
        }
        if (resp.item) {
            item.inCart = true;
            item.item_id = resp.item.id;
            item.amount = resp.item.quantity;
        } else {
            item.inCart = false;
            item.item_id = null;
            item.amount = 1;
        }
        this.calculateTotals("update cart item");
        this.cartUpdateMessage();
        if (showPromt) {
            this.presentAlertPay(resp.item);
        }
    }
    handleCartError(resp: any, item) {
        console.log("Error", resp);

        if (resp.message == "CLEAR_CART") {
            this.showPrompt(item);
        } else if (resp.message == "MIN_QUANTITY") {

            this.showPromptMin(resp);
        } else {
            let toast = this.toastCtrl.create({
                message: resp.message,
                duration: 3000,
                position: 'top'
            }).then(toast => toast.present());
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
    handleServerCartError() {
        this.dismissLoader();
        //this.navCtrl.push(MainPage);
        // Unable to log in
        this.toastCtrl.create({
            message: this.cartErrorString,
            duration: 3000,
            position: 'top'
        }).then(toast => toast.present());
    }
    addCartItem(item: any) {
        this.showLoader();
        let container = null;
        container = {
            product_variant_id: item.variant_id,
            quantity: item.amount,
            item_id: item.item_id,
            merchant_id: this.merchant
        };
        console.log("Add cart item", container);
        if (container.item_id) {
            this.cart.updateCartItem(container).subscribe((resp: any) => {
                console.log("updateCartItem", resp);
                if (resp.status == "success") {
                    this.handleCartSuccess(resp, item);
                    if (resp.item) {
                        return resp.item;
                    }
                } else {
                    this.dismissLoader();
                    this.handleCartError(resp, item);
                }
            }, (err) => {
                this.handleServerCartError();
                this.api.handleError(err);
            });
        } else {
            this.cart.addCartItem(container).subscribe((resp: any) => {
                if (resp.status == "success") {
                    this.handleCartSuccess(resp, item);
                } else {
                    this.dismissLoader();
                    this.handleCartError(resp, item);
                }
                //this.navCtrl.push(MainPage);
            }, (err) => {
                this.handleServerCartError();
                this.api.handleError(err);
            });
        }
    }
    createSlides() {
        this.slides = [];
        let slide = {
            "title": this.merchantObj.merchant_name,
            "description": this.merchantObj.merchant_description,
            "image": ""
        };
        this.slides.push(slide);
        for (let i in this.categories) {
            for (let j in this.categories[i].products) {
                let container = this.categories[i].products[j];
                let slide = {
                    "title": container.name,
                    "description": container.description,
                    "image": ""
                };
                this.slides.push(slide);
            }
        }

    }

    /**
     * Navigate to the detail page for this item.
     */
    showMoreCat(cat: any) {
        for (let item in this.categories) {
            this.categories[item].more = false;
        }
        if (cat.more) {
            cat.more = false;
        } else {
            cat.more = true;
        }
    }
    showMoreItem(cat: any) {
        if (cat.more) {
            cat.more = false;
        } else {
            cat.more = true;
        }
    }

    loadProducts() {
        this.productsServ.getProductsMerchant(this.merchant, this.page).subscribe((resp) => {
            if (resp.products_total > 0) {
                this.categories = this.productsServ.buildProductInformation(resp, this.merchant);
                console.log("Result build product", this.categories);
                this.merchantObj.merchant_name = this.categories[0].products[0].merchant_name;
                this.merchantObj.merchant_description = this.categories[0].products[0].merchant_description;
                this.merchantObj.src = this.categories[0].products[0].src;

                //this.openTutorials();  
                this.merchantObj.merchant_type = this.categories[0].products[0].merchant_type;
                if (this.categories.length > 0) {
                    this.categories[0].more = true;
                    if (this.categories[0].products.length > 0) {
                        this.categories[0].products[0].more = true;
                    }
                }
                console.log("Merchant", this.merchantObj);
                if (this.orderData.cartData) {
                    let items = this.orderData.cartData.items;
                    for (let key in items) {
                        let contItem = items[key].attributes;
                        if (contItem.type == "Product") {
                            contItem.id = items[key].id;
                            contItem.quantity = items[key].quantity;
                            for (let k in this.categories) {
                                for (let j in this.categories[k].products) {
                                    for (let i in this.categories[k].products[j].variants) {
                                        if (contItem.product_variant_id == this.categories[k].products[j].variants[i].id) {
                                            this.categories[k].products[j].inCart = true;
                                            this.categories[k].products[j].item_id = contItem.id;
                                            this.categories[k].products[j].amount = contItem.quantity;
                                            this.categories[k].products[j] = this.productsServ.updateProductVisual(this.categories[k].products[j].variants[i], this.categories[k].products[j]);
                                        }
                                    }

                                }
                            }
                            for (let j in this.products) {
                                for (let i in this.products[j].variants) {
                                    if (contItem.product_variant_id == this.products[j].variants[i].id) {
                                        this.products[j].inCart = true;
                                        this.products[j].item_id = contItem.id;
                                        this.products[j].amount = contItem.quantity;
                                        this.products[j] = this.productsServ.updateProductVisual(this.products[j].variants[i], this.products[j]);
                                    }
                                }
                            }
                        }
                    }
                }
                this.calculateTotals("load products");
                //this.createSlides();
            } else {
                this.dismissLoader();
            }
        }, (err) => {
            this.api.handleError(err);
            // Unable to log in
        });
    }
    async openCart() {
        let container = {cart: this.orderData.cartData};
        console.log("Opening Cart", container);
        let addModal = await this.modalCtrl.create({
            component: CartPage,
            componentProps: container
        });
        await addModal.present();
        const {data} = await addModal.onDidDismiss();
        this.params.setParams({"merchant_id": this.merchant});
        if (data == "Shipping" || data == 'Prepare') {
            if (this.userData._user) {
                if (data == "Shipping") {
                    this.navCtrl.navigateForward('tabs/home/checkout/shipping/' + this.merchant);
                } else {
                    this.navCtrl.navigateForward('tabs/home/checkout/prepare');
                }
            } else {
                if (data == "Shipping") {
                    this.drouter.addPages('tabs/home/checkout/shipping/' + this.merchant);
                } else {
                    this.drouter.addPages('tabs/home/checkout/prepare');
                }
                this.navCtrl.navigateForward('login');
            }
        }
    }

    loadOptions() {
        for (let i = 1; i < 90; i++) {
            let container = {"value": i};
            this.possibleAmounts.push(container);
        }
    }
    selectVariant(item: any) {
        console.log(item);
        for (let i in item.variants) {
            let container = item.variants[i];
            if (container.id == item.variant_id) {
                if (container.is_on_sale) {
                    console.log("selectVariantsale",container);
                    item.exprice = container.exprice;
                    item.price = container.price;
                    item.onsale = true;
                } else {
                    item.onsale = false;
                    item.price = container.price;
                }

                if (item.type == "meal-plan") {
                    if (container.attributes.buyers) {
                        item.unitLunches = container.attributes.buyers;
                    } else {
                        item.unitLunches = 1;
                    }

                    if (item.amount > 1 && item.amount < 11) {
                        item.subtotal = item.price * item.amount;
                        item.unitPrice = item.subtotal / (item.unitLunches * item.amount);
                    } else {
                        let control = item.amount / 10;
                        let counter2 = Math.floor(item.amount / 10);
                        if (control == counter2) {
                            item.subtotal = (item.price * item.amount) - ((counter2 - 1) * item.unitLunches * 11000);
                        } else {
                            item.subtotal = (item.price * item.amount) - (counter2 * item.unitLunches * 11000);
                        }
                        item.unitPrice = item.subtotal / (item.unitLunches * item.amount);
                    }
                }
                if (item.type == "delivery" || item.type == "catering") {
                    item.amount = item.min_quantity;
                }
            }
        }
        this.calculateTotals("select variant");
    }
    calculateTotals(where) {
        console.log("Calculate totals " + where);
        for (let i in this.categories) {
            for (let j in this.categories[i].products) {
                let container = this.categories[i].products[j];
                this.calculateTotalsProduct(container);
            }
        }
        if (where) {
            this.dismissLoader();
        }
    }
    calculateTotalsProduct(product: Product) {
        if (product.type == "meal-plan") {
            if (product.amount > 0 && product.amount < 10) {
                product.unitPrice = product.subtotal / (product.unitLunches * product.amount);
            } else {
                let counter2 = Math.floor(product.amount / 11);
                product.subtotal = (product.price * product.amount) - (counter2 * product.unitLunches * 11000);
                product.unitPrice = product.subtotal / (product.unitLunches * product.amount);
            }
        } else {
            if (product.onsale) {
                product.exsubtotal = product.exprice * product.amount;
                product.subtotal = product.price * product.amount;
            } else {
                product.subtotal = product.price * product.amount;
            }

        }
    }
    getCart() {
        this.cart.getCart().subscribe((resp) => {
            if (resp) {
                console.log("getCart", resp);
                this.orderData.cartData = resp;
            }
        }, (err) => {
            console.log("getCartError", err);
            this.orderData.cartData = null;
            this.api.handleError(err);
        });
    }

    ngOnInit() {
    }

}
