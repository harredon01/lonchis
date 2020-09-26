import {Component, OnInit, ViewChild} from '@angular/core';
import {CategoriesService} from '../../services/categories/categories.service';
import {NavController, ModalController, MenuController, AlertController} from '@ionic/angular';
import {Events} from '../../services/events/events.service';
import {AlertsService} from '../../services/alerts/alerts.service';
import {ProductsService} from '../../services/products/products.service';
import {CartService} from '../../services/cart/cart.service';
import {OrderDataService} from '../../services/order-data/order-data.service';
import {ParamsService} from '../../services/params/params.service';
import {UserDataService} from '../../services/user-data/user-data.service';
import {UserService} from '../../services/user/user.service';
import {MerchantsService} from '../../services/merchants/merchants.service';
import {ApiService} from '../../services/api/api.service';
//import {ArticlesService} from '../../services/articles/articles.service';
import {DynamicRouterService} from '../../services/dynamic-router/dynamic-router.service';
import {Merchant} from '../../models/merchant';
import {Article} from '../../models/article';
import {Product} from '../../models/product';
import {IonSlides} from '@ionic/angular';
import {CartPage} from '../cart/cart.page';
@Component({
    selector: 'app-home',
    templateUrl: './home.page.html',
    styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
    @ViewChild('slideWithNav', {static: false}) slideWithNav: IonSlides;
    location: string = "n1";
    celTitle: string = "";
    notifs: any = 0;
    categoriesArr: any[] = [];
    possibleAmounts: any[] = [];
    centerCat: any = 0;
    slideOpts = {
        initialSlide: 0,
        speed: 400,
        autoplay: true,
    };
    items: any[] = [];
    stores: any[] = [];
    centers: any[] = [];
    activeIndex = 0;
    slidesItems: any[] = [];
    newsItems: any[] = [];
    constructor(public navCtrl: NavController,
        public categories: CategoriesService,
        public alertController: AlertController,
        public alerts: AlertsService,
        public productsServ: ProductsService,
        //public articles: ArticlesService,
        public params: ParamsService,
        public userData: UserDataService,
        public userS: UserService,
        public menu: MenuController,
        public merchantsServ: MerchantsService,
        public api: ApiService,
        public drouter: DynamicRouterService,
        public modalCtrl: ModalController,
        public cartProvider: CartService,
        public orderData: OrderDataService,
        public events: Events) {
        let vm = this;
        events.subscribe('cart:orderFinished', () => {
            this.clearCart();
            // user and time are the same arguments passed in `events.publish(user, time)`
        });
        events.subscribe('notification:received', (resp: any) => {
            this.notifs++;
            if (resp.type == "order_status") {
                if (resp.payload.order_status == "approved") {
                    //this.getDeliveries(false);
                }
            }
            if (resp.type == "food_meal_started") {
                //this.getDeliveries(false);
            }
        });
        this.events.subscribe('storageInitialized', (data: any) => {
            this.checkLogIn();
            // user and time are the same arguments passed in `events.publish(user, time)`
        });
        this.events.subscribe('deviceSet', (data: any) => {
            this.getCart();
            // user and time are the same arguments passed in `events.publish(user, time)`
        });
        this.centerCat = {id: 13, name: "Centros de prueba", file: "https://picsum.photos/350/300"};
    }

    ngOnInit() {
        this.getItems();
        this.getMerchants('stores', 24);
        //this.getArticles();
        this.loadProducts();
        this.loadOptions();
    }
    ionViewDidEnter() {

        if (document.URL.startsWith('http')) {
            let vm = this;
            setTimeout(function () {vm.api.dismissLoader();; console.log("Retrying closing")}, 1000);
            setTimeout(function () {vm.api.dismissLoader();; console.log("Retrying closing")}, 2000);
        }

        if (this.userData._user) {
            console.log("Counting unread")
            this.alerts.countUnread().subscribe((resp: any) => {
                console.log("Counting unread resp", resp);
                this.notifs = resp.total;
            }, (err) => {
            });
            this.routeNext();
            this.events.publish("authenticated", {});
            console.log("Counting unread")
            this.alerts.countUnread().subscribe((resp: any) => {
                console.log("Counting unread resp", resp);
                this.notifs = resp.total;
            }, (err) => {
            });
        } else {
            this.checkLogIn();
        }
        if (this.userData.deviceSet) {
            this.getCart();
        }

    }
    getMerchants(arrayname, category) {
        this.api.loader();
        let searchObj = null
        let query = "page=1&category_id=" + category;
        searchObj = this.merchantsServ.getMerchants(query);
        searchObj.subscribe((data: any) => {
            let results = data.data;
            for (let one in results) {
                let container = new Merchant(results[one]);
                this[arrayname].push(container);
            }
            this.api.dismissLoader();
        }, (err) => {
            console.log("Error getMerchantsFromServer");
            this.api.dismissLoader();
            // Unable to log in
            this.api.toast('CATEGORIES.ERROR_GET');
            this.api.handleError(err);
        });
    }
//    getArticles() {
//        this.api.loader();
//        let searchObj = null;
//        this.slidesItems = [];
//        this.newsItems = [];
//        let query = "category_id=22,23&includes=files&order_by=category_id,asc";
//        searchObj = this.articles.getArticles(query);
//        searchObj.subscribe((data: any) => {
//            let results = data.data;
//            for (let one in results) {
//                let container = new Article(results[one]);
//                if (container.category_id == 22) {
//                    this.slidesItems.push(results[one]);
//                } else if (container.category_id == 23) {
//                    this.newsItems.push(results[one]);
//                }
//            }
//            this.api.dismissLoader();
//        }, (err) => {
//            console.log("Error getArticles");
//            this.api.dismissLoader();
//            // Unable to log in
//            this.api.toast('CATEGORIES.ERROR_GET');
//            this.api.handleError(err);
//        });
//    }
    checkLogIn() {
        this.userData.getToken().then((value) => {
            console.log("getToken");
            console.log(value);
            if (value) {
                this.navCtrl.navigateForward('login');
            }
        });
    }

    getItems() {
        this.api.loader();
        let query = "merchants";
        this.categories.getCategories(query).subscribe((data: any) => {
            this.api.dismissLoader();
            console.log("after getCategories");
            this.items = data.categories;
            console.log(JSON.stringify(data));
        }, (err) => {
            this.api.dismissLoader();
            // Unable to log in
            this.api.toast('CATEGORIES.ERROR_GET');
            this.api.handleError(err);
        });
    }
    /**
     * Navigate to the detail page for this item.
     */
    openItem(item: any, purpose: any, showAddress: any) {
        this.params.setParams({"item": item, "purpose": purpose, 'showAddress': showAddress});
        if (this.userData._user) {
            this.navCtrl.navigateForward('shop/home/categories/' + item.id);
        } else {
            this.navCtrl.navigateForward('home/' + item.id);
        }
    }
    openArticle(item: any) {
        this.params.setParams({"item": item});
        if (this.userData._user) {
            this.navCtrl.navigateForward('shop/home/articles/' + item.id);
        } else {
            this.navCtrl.navigateForward('home/articles/' + item.id);
        }
    }
    openStore(item: any, category: any) {
        this.params.setParams({
            objectId: item.id
        });
        if (this.userData._user) {
            this.navCtrl.navigateForward('shop/home/categories/' + category + "/merchant/" + item.id + "/products");
        } else {
            this.navCtrl.navigateForward('home/' + category + "/merchant/" + item.id + "/products");
        }
    }
    openMenu() {
        this.menu.enable(true, 'end');
        this.menu.open('end');
        this.notifs = 0;
        this.alerts.readAll();
    }
    searchItems(ev: any) {
        // set val to the value of the searchbar
        const val = ev.target.value;
        // if the value is an empty string don't filter the items
        if (val && val.trim() != '') {

        }
    }
    getCart() {
        if (this.userData._user) {
            this.cartProvider.getCheckoutCart().subscribe((resp) => {
                if (resp) {
                    console.log("getCart", resp);
                    this.orderData.cartData = resp;
                }
            }, (err) => {
                console.log("getCartError", err);
                this.orderData.cartData = null;
                this.api.handleError(err);
            });
        } else {
            this.cartProvider.getCart().subscribe((resp) => {
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
    }
    login() {
        this.navCtrl.navigateForward('login');
    }
    routeNext() {
        if (this.drouter.pages) {
            this.navCtrl.navigateForward(this.drouter.pages);
            this.drouter.pages = null;
        }
    }
    clearCart() {
        this.cartProvider.clearCart().subscribe((resp) => {
            if (resp) {
                console.log("clearCart", resp);
                this.orderData.cartData = null;
            }
        }, (err) => {
            console.log("clearCart", err);
            this.orderData.cartData = null;
            this.api.handleError(err);
        });
    }

    //Move to Next slide
    slideNext() {
        this.slideWithNav.slideNext();
        this.slideWithNav.getActiveIndex().then((value) => {
            this.activeIndex = value;
        });
    }

    //Move to previous slide
    slidePrev() {
        this.slideWithNav.slidePrev();
        this.slideWithNav.getActiveIndex().then((value) => {
            this.activeIndex = value;
        });
    }
    SlideDidChange() {
        this.slideWithNav.getActiveIndex().then((value) => {
            this.activeIndex = value;
        });
    }

    loadProducts() {
        this.categoriesArr = [];
        let container = {"includes": "categories,files", "category_id": 25};
        this.productsServ.getProductsMerchant(container).subscribe((resp) => {
            if (resp.products_total > 0) {
                this.categoriesArr = this.productsServ.buildProductInformation(resp);
                console.log("Result build product", this.categories);
                if (this.orderData.cartData) {
                    let items = this.orderData.cartData.items;
                    this.categoriesArr = this.productsServ.updateVisualWithCart(this.categoriesArr, items);
                }
                this.productsServ.calculateTotals("load products", this.categoriesArr);
                //this.createSlides();
            } else {
                this.api.dismissLoader();
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
        this.params.setParams({"merchant_id": 1299});
        if (data == "Shipping" || data == 'Prepare') {
            if (this.userData._user) {
                if (data == "Shipping") {
                    this.navCtrl.navigateForward('shop/home/checkout/shipping/' + 1299);
                } else {
                    this.navCtrl.navigateForward('shop/home/checkout/prepare');
                }
            } else {
                if (data == "Shipping") {
                    this.drouter.addPages('shop/home/checkout/shipping/' + 1299);
                } else {
                    this.drouter.addPages('shop/home/checkout/prepare');
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
    addCart(item: any) {
        console.log("Add cart item", item);
        if (item.type == 'Booking') {
            this.appointmentbook(item);
        } else {
            this.api.loader();
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
            "objectId": 1308,
            "objectName": "",
            "objectDescription": "",
            "objectIcon": "",
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
                this.navCtrl.navigateForward("shop/home/categories/" + category_id);
            } else {
                this.drouter.addPages("shop/home/categories/" + category_id);
                this.navCtrl.navigateForward('login');
            }
        } else {
            if (this.userData._user) {
                //this.navCtrl.navigateForward(this.urlSearch + "/book");
            } else {
                //this.drouter.addPages(this.urlSearch + "/book");
                this.navCtrl.navigateForward('login');
            }
        }

    }
    addCartItem(item: any) {
        this.cartProvider.addCart(item).then((resp: any) => {
            console.log("updateCartItem", resp);
            if (resp.status == "success") {
                this.handleCartSuccess(resp, item);
                if (resp.item) {
                    return resp.item;
                }
            } else {
                this.api.dismissLoader();
                this.cartProvider.handleCartError(resp, item);
            }
        });
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
        this.productsServ.calculateTotals("update cart item", this.categoriesArr);
        this.cartProvider.cartUpdateMessage();
        if (showPromt) {
            this.presentAlertPay(resp.item);
        }
    }
    presentAlertPay(item: any) {
        this.alertController.create({
            header: "Quieres ir a pagar",
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
                        this.params.setParams({"merchant_id": 1299});
                        if (this.userData._user) {
                            if (item.attributes.is_shippable == true) {
                                this.navCtrl.navigateForward('shop/home/checkout/shipping/' + 1299);
                            } else {
                                this.navCtrl.navigateForward('shop/home/checkout/prepare');
                            }
                        } else {
                            if (item.attributes.is_shippable == true) {
                                this.drouter.addPages('shop/home/checkout/shipping/' + 1299);
                            } else {
                                this.drouter.addPages('shop/home/checkout/prepare');
                            }
                            this.navCtrl.navigateForward('login');
                        }
                    }
                }
            ]
        }).then(toast => toast.present());
    }
}