import {Component, OnInit} from '@angular/core';
import {NavController, ModalController, AlertController} from '@ionic/angular';
import {ParamsService} from '../../services/params/params.service';
import {Events} from '../../services/events/events.service';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute} from '@angular/router';
import {Router} from '@angular/router';
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
    categories: any[] = [];
    options: any[];
    urlSearch: string = "";
    payTitle: string = "";
    isOwner: boolean = false;
    slides: any[];
    loading: any;
    merchantObj: {
        merchant_name: string,
        merchant_description_more: boolean,
        merchant_description: string,
        merchant_type: string,
        src: string,
    } = {
            merchant_name: "",
            merchant_description: "",
            merchant_description_more: false,
            merchant_type: "",
            src: "",
        };
    possibleAmounts: any[];
    merchant: any;
    page: any;
    public showMoreText: string;
    public showLessText: string;
    public dateLessText: string;

    constructor(public navCtrl: NavController,
        public activatedRoute: ActivatedRoute,
        public productsServ: ProductsService,
        public api: ApiService,
        private drouter: DynamicRouterService,
        public modalCtrl: ModalController,
        public alertCtrl: AlertController,
        public cart: CartService,
        public route:Router,
        public events: Events,
        public params: ParamsService,
        public userData: UserDataService,
        public orderData: OrderDataService,
        public translateService: TranslateService) {
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
        this.page = 1;
        this.slides = [];
        let paramsSent = this.params.getParams();
        let merchant = this.activatedRoute.snapshot.paramMap.get('objectId');
        if (merchant) {
            this.merchant = merchant;
        } else {
            if (paramsSent) {
                if (paramsSent.objectId) {
                    this.merchant = paramsSent.objectId;
                }
            }
        }
        if (paramsSent) {
            if (paramsSent.owner) {
                this.isOwner = paramsSent.owner;
            }
        }
        let loadedSettings = false;
        if (paramsSent) {
            if (paramsSent.settings) {
                this.urlSearch = "tabs/settings/merchants/" + this.merchant;
                loadedSettings = true;
            }

        }
        if (!loadedSettings) {
            let category = this.activatedRoute.snapshot.paramMap.get('categoryId');
            this.urlSearch = 'tabs/home/categories/' + category + '/merchant/' + this.merchant;
        }
        this.possibleAmounts = [];
        this.api.loader();
        this.loadProducts();
        this.loadOptions();
        if (!this.orderData.cartData) {
            this.getCart();
        }
        console.log("User: ", this.userData._user);
        events.subscribe('cart:deleteItem', (resp: any) => {
            console.log("Deleting item", resp.item);
            this.clearCartItem(resp.item);
            // user and time are the same arguments passed in `events.publish(user, time)`
        });
        events.subscribe('cart:clear', (resp: any) => {
            this.clearCart();
            // user and time are the same arguments passed in `events.publish(user, time)`
        });
    }
    ionViewDidEnter() {
        this.possibleAmounts = [];
        this.api.loader();
        this.loadProducts();
        this.loadOptions();
        if (document.URL.startsWith('http')) {
            let vm = this;
            setTimeout(function () {vm.api.dismissLoader(); console.log("Retrying closing")}, 1000);
            setTimeout(function () {vm.api.dismissLoader(); console.log("Retrying closing")}, 2000);
        }
    }
    addCart(item: any) {
        console.log("Add cart item", item);
        if (item.type == 'Booking') {
            this.appointmentbook(item);
        } else {
            this.addCartItem(item);
        }

    }
    appointmentbook(item: any) {
        let questions = [];
        let category_id = null;
        let container = null;
        console.log("variants", item.variants)
        for (let i in item.variants) {
            if (item.variant_id == item.variants[i].id) {
                container = item.variants[i];
                break;
            }
        }
        console.log("Container", container);
        if (container.attributes) {
            if (container.attributes.questions) {
                questions = container.attributes.questions;
            }
            if (container.attributes.category_id) {
                category_id = container.attributes.category_id;
            }
        }
        let params = {
            "availabilities": null,
            "type": "Merchant",
            "objectId": this.merchant,
            "objectName": this.merchantObj.merchant_name,
            "objectDescription": this.merchantObj.merchant_description,
            "objectIcon": this.merchantObj.src,
            "expectedPrice": item.price,
            "questions": questions,
            "product_variant_id": item.variant_id,
            "quantity": item.amount,
            "purpose": "external_book"
        }
        console.log(params);
        this.params.setParams(params);
        if (category_id) {
            if (this.userData._user) {
                this.navCtrl.navigateForward("tabs/home/categories/" + category_id);
            } else {
                this.drouter.addPages("tabs/home/categories/" + category_id);
                this.navCtrl.navigateForward('login');
            }
        } else {
            if (this.userData._user) {
                this.navCtrl.navigateForward(this.urlSearch + "/book");
            } else {
                this.drouter.addPages(this.urlSearch + "/book");
                this.navCtrl.navigateForward('login');
            }
        }

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
                            if (item.attributes.is_shippable == true || item.attributes.shipping > 0) {
                                this.navCtrl.navigateForward('tabs/home/checkout/shipping/' + this.merchant);
                            } else {
                                this.navCtrl.navigateForward('tabs/home/checkout/prepare');
                            }
                        } else {
                            if (item.attributes.is_shippable == true || item.attributes.shipping > 0) {
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
        this.productsServ.calculateTotals("update cart item", this.categories);
        this.cart.cartUpdateMessage();
        if (showPromt) {
            this.presentAlertPay(resp.item);
        }
    }
    addCartItem(item: any) {
        this.cart.addCart(item).then((resp: any) => {
            console.log("updateCartItem", resp);
            if (resp.status == "success") {
                this.handleCartSuccess(resp, item);
                if (resp.item) {
                    return resp.item;
                }
            } else {
                this.api.dismissLoader();
                this.cart.handleCartError(resp, item);
            }
        });
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
        let container = {"includes": "categories,files,merchant", "merchant_id": this.merchant, "page": this.page};
        let activeView = this.route.url;
        console.log("getActive", activeView);
        let query = null;
        if (activeView.includes("settings")) {
            query = this.productsServ.getProductsMerchantPrivate(container);
        } else {
            query = this.productsServ.getProductsMerchant(container);
        }
        query.subscribe((resp: any) => {
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
                    if (this.categories[0].products.length > 1) {
                        this.categories[0].products[1].more = true;
                    }
                }
                console.log("Merchant", this.merchantObj);
                if (this.orderData.cartData) {
                    let items = this.orderData.cartData.items;
                    this.categories = this.productsServ.updateVisualWithCart(this.categories, items);
                }
                this.productsServ.calculateTotals("load products", this.categories);
                //this.createSlides();
            }
            this.api.dismissLoader();
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
        this.productsServ.selectVariant(item);
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
