import {Component, ViewChild, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import {NavController, AlertController, ModalController, IonContent} from '@ionic/angular';
import {FoodService} from '../../services/food/food.service';
import {UserDataService} from '../../services/user-data/user-data.service';
import {ApiService} from '../../services/api/api.service';
import {ParamsService} from '../../services/params/params.service';
import {Events} from '../../services/events/events.service';
import {Facebook} from '@ionic-native/facebook/ngx';
import {ConversionPage} from '../conversion/conversion.page';
import {AddressesPage} from '../addresses/addresses.page';
import {DynamicRouterService} from '../../services/dynamic-router/dynamic-router.service';

@Component({
    selector: 'app-programar',
    templateUrl: './programar.page.html',
    styleUrls: ['./programar.page.scss'],
})
export class ProgramarPage implements OnInit {
    @ViewChild(IonContent) content: IonContent;
    public listArticles: any = [];
    public slides: any = [];

    public foodTypeSelected: any = {}
    public attributes: any = [];
    public submitting: boolean = false;
    public isProgrammed: boolean;
    public isDeposit: boolean;
    weekenddateError: boolean = false;
    dateError: boolean = false;
    submitAttempt: boolean = false;
    deliveryForm: FormGroup;
    starterError: boolean = false;
    drinkError: boolean = false;
    hasStarter: boolean = false;
    hasDrink: boolean = false;
    shouldDrink: boolean = false;
    deliveriesChangeAddress: string;
    deliverydateErrorTitle: string;
    deliverydateErrorDesc: string;
    deliverysuspErrorTitle: string;
    deliverysuspErrorDesc: string;
    deliverySlide1Title: string;
    deliverySlide1Desc: string;
    deliverySlide2Title: string;
    deliverySlide2Desc: string;
    deliverySlide3Title: string;
    deliverySlide3Desc: string;
    deliveryStarterTitle: string;
    deliveryMainTitle: string;
    deliveryDrinkTitle: string;

    public detailDelivery: {type: string, starter: string, main: string} = {
        type: 'vegetariano', starter: 'opcion 1', main: 'plato 1'
    }
    public saveDelivery: {
        type_id: any,
        starter_id: any,
        drink_id: any,
        date: any,
        drink_name: string,
        main_id: any,
        type_name: number,
        starter_name: string,
        main_name: string,
        dessert_id: any,
        delivery_id: any,
        observation: string,
        details: any
    } = {
            type_id: 0,
            starter_id: '',
            drink_id: '',
            date: null,
            drink_name: '',
            main_id: '',
            type_name: 0,
            starter_name: '',
            main_name: '',
            dessert_id: '',
            delivery_id: 0,
            observation: '',
            details: this.detailDelivery
        };

    public deliveryParams: any;
    isDelivery: boolean = false;
    loading: any;
    constructor(public navCtrl: NavController,
        public events: Events,
        public userData: UserDataService,
        private drouter: DynamicRouterService,
        public fb: Facebook,
        public api: ApiService,
        private params: ParamsService,
        private translateService: TranslateService,
        private alertCtrl: AlertController,
        private modalCtrl: ModalController,
        public food: FoodService,
        public formBuilder: FormBuilder) {
        this.isProgrammed = false;
        this.isDeposit = false;
        this.submitting = false;
        this.slides = [];
        this.translateService.get('DELIVERY_PROGRAM.CHANGE_ADDRESS_TITLE').subscribe((value) => {
            this.deliveriesChangeAddress = value;
        });
        this.translateService.get('DELIVERY_PROGRAM.DELIVERY_DATE_ERROR_TITLE').subscribe((value) => {
            this.deliverydateErrorTitle = value;
        });
        this.translateService.get('DELIVERY_PROGRAM.DELIVERY_DATE_ERROR_DESC').subscribe((value) => {
            this.deliverydateErrorDesc = value;
        });
        this.translateService.get('DELIVERY_PROGRAM.DELIVERY_SUSP_ERROR_TITLE').subscribe((value) => {
            this.deliverysuspErrorTitle = value;
        });
        this.translateService.get('DELIVERY_PROGRAM.DELIVERY_SUSP_ERROR_DESC').subscribe((value) => {
            this.deliverysuspErrorDesc = value;
        });
        this.translateService.get('DELIVERY_PROGRAM.SLIDE1.TITLE').subscribe((value) => {
            this.deliverySlide1Title = value;
        });
        this.translateService.get('DELIVERY_PROGRAM.SLIDE1.DESC').subscribe((value) => {
            this.deliverySlide1Desc = value;
        });
        this.translateService.get('DELIVERY_PROGRAM.SLIDE2.TITLE').subscribe((value) => {
            this.deliverySlide2Title = value;
        });
        this.translateService.get('DELIVERY_PROGRAM.SLIDE2.DESC').subscribe((value) => {
            this.deliverySlide2Desc = value;
        });
        this.translateService.get('DELIVERY_PROGRAM.SLIDE3.TITLE').subscribe((value) => {
            this.deliverySlide3Title = value;
        });
        this.translateService.get('DELIVERY_PROGRAM.SLIDE3.DESC').subscribe((value) => {
            this.deliverySlide3Desc = value;
        });
        this.translateService.get('DELIVERY_PROGRAM.STARTER').subscribe((value) => {
            this.deliveryStarterTitle = value;
        });
        this.translateService.get('DELIVERY_PROGRAM.MAIN').subscribe((value) => {
            this.deliveryMainTitle = value;
        });
        this.translateService.get('DELIVERY_PROGRAM.DRINK').subscribe((value) => {
            this.deliveryDrinkTitle = value;
        });
        this.deliveryForm = formBuilder.group({
            lunch_type: ['', Validators.compose([Validators.required])],
            starter: [''],
            drink: [''],
            main_dish: ['', Validators.compose([Validators.required])],
            description: ['']
        });
        this.loadDelivery();
    }

    ngOnInit() {
        console.log('ngOnInit DeliveryProgramPage');
        this.submitting = false;
        this.getArticles();
    }

    changeSelection() {
        this.isProgrammed = false;
    }
    changeAddress(item: any, all: boolean) {
        let container = {"address_id": item.id, "delivery_id": this.deliveryParams.id, "all": all, "merchant_id": "1299"};
        this.food.updateDeliveryAddress(container).subscribe((resp: any) => {
            this.api.dismissLoader();
            if (resp.status == "success") {
                this.api.toast('DELIVERY_PROGRAM.CHANGE_ADDRESS_SUCCESS');
                this.deliveryParams.address = item;
            } else if (resp.message == "Forbidden product") {
                this.api.toast('DELIVERY_PROGRAM.CHANGE_ADDRESS_ERROR_PRODUCT');
            }
        }, (err) => {
            this.api.dismissLoader();
            this.api.toast('DELIVERY_PROGRAM.CHANGE_ADDRESS_ERROR');
        });
    }
    presentAlertChange(item: any) {
        const prompt = this.alertCtrl.create({
            header: this.deliveriesChangeAddress,

            inputs: [],
            buttons: [
                {
                    text: 'Solo Esta',
                    role: 'cancel',
                    cssClass: 'secondary',
                    handler: () => {
                        this.changeAddress(item, false);
                    }
                }, {
                    text: 'Todas',
                    handler: (data) => {
                        console.log('Confirm Ok', data);
                        this.changeAddress(item, true);
                    }
                }
            ]
        }).then(toast => toast.present());
    }
    async openChangeAddress() {
        let container = {"select": "shipping"};
        this.params.setParams(container);
        let addModal = await this.modalCtrl.create({
            component: AddressesPage,
            componentProps: container
        });
        await addModal.present();
        const {data} = await addModal.onDidDismiss();
        console.log("Cart closing", data);
        if (data) {
            this.presentAlertChange(data);
        }
    }

    checkDelivery() {
        console.log("checkDelivery", this.deliveryParams);
        if (this.deliveryParams.details) {
            this.isDelivery = true;
            if (this.deliveryParams.status == "enqueue") {
                this.isProgrammed = true;
                if (this.deliveryParams.details.dish) {
                    this.saveDelivery.type_id = this.deliveryParams.details.dish.type_id;
                    this.deliveryForm.patchValue({lunch_type: this.saveDelivery.type_id});
                    this.selectFoodType();
                    if (this.deliveryParams.details.dish.starter_id) {
                        this.hasStarter = true;
                        console.log(" loading starter");
                        let vm = this;
                        setTimeout(function () {
                            vm.saveDelivery.starter_id = vm.deliveryParams.details.dish.starter_id;
                            vm.selectInitFood();
                        }, 500);
                    }
                    if (this.deliveryParams.details.dish.drink_id) {
                        this.saveDelivery.drink_id = this.deliveryParams.details.dish.drink_id;
                        this.selectDrink();
                    }
                    if (this.deliveryParams.details.dish.main_id) {
                        this.saveDelivery.main_id = this.deliveryParams.details.dish.main_id;
                        this.deliveryForm.patchValue({main_dish: this.saveDelivery.main_id});
                        this.selectStandarFood();
                    }
                }
            }
            if (this.deliveryParams.details.deliver) {
                if (this.deliveryParams.details.deliver == "deposit") {
                    this.isDeposit = true;
                }
            }
        }
        if (this.deliveryParams.provider) {
            this.isDelivery = true;
        }
    }

    async openConversion() {
        this.navCtrl.navigateRoot('home');
        let addModal = await this.modalCtrl.create({
            component: ConversionPage
        });
        await addModal.present();
        const {data} = await addModal.onDidDismiss();
        if (data == "Checkout") {
            console.log("User: ", this.userData._user);
            if (this.userData._user) {
                this.params.setParams({"merchant_id": 1299});
                this.navCtrl.navigateForward('shop/home/checkout/shipping/' + 1299);
            } else {
                this.params.setParams({"merchant_id": 1299});
                this.drouter.addPages('shop/home/checkout/shipping/' + 1299);
                console.log("Pushing login");
                this.navCtrl.navigateForward('login');
            }
        }
    }
    loadDelivery() {
        this.hasStarter = true;
        this.hasDrink = false;
        this.shouldDrink = false;
        this.starterError = false;
        this.drinkError = false;
        let container = this.params.getParams();
        console.log("Programar Params", container);
        if (container) {
            if (container.item) {
                this.deliveryParams = container.item;
            }
        }
        console.log("Parsing", this.deliveryParams);
        if (this.deliveryParams.details) {
            if (typeof this.deliveryParams.details == 'string') {
                this.deliveryParams.details = JSON.parse(this.deliveryParams.details);
            }
            if (this.deliveryParams.details.drink) {
                if (this.deliveryParams.details.drink == "yes") {
                    this.hasDrink = true;
                    this.shouldDrink = true;
                }
            }
            if (!this.deliveryParams.details.dish) {
                console.log("No dish clearing form");
                this.deliveryForm.patchValue({lunch_type: ''});
                this.saveDelivery.starter_id = '';
                this.saveDelivery.type_id = '';
                this.saveDelivery.main_id = '';
                this.saveDelivery.drink_id = '';
                this.deliveryForm.patchValue({main_dish:''});
                this.scrollToTop();
            }
            this.saveDelivery.delivery_id = this.deliveryParams.id;
        }

        if (this.deliveryParams.delivery) {
            if (typeof this.deliveryParams.delivery == 'string') {
                this.deliveryParams.delivery = this.deliveryParams.delivery.replace(/-/g, '/');
            }
        } else if (this.deliveryParams.created_at) {
            let sdate = this.deliveryParams.start_date;
            this.deliveryParams.delivery = sdate.getFullYear() + "/" + (sdate.getMonth() + 1) + "/" + sdate.getDate() + " 12:00:00";
        }
        console.log("date1", this.deliveryParams.delivery);
        let date = new Date(this.deliveryParams.delivery);
        console.log("date2", date);
        let startDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
        console.log("date3", startDate);
        this.saveDelivery.date = startDate.toISOString();
        console.log("date4", startDate.toISOString());
        this.deliveryParams.delivery = date;
    }
    ionViewDidEnter() {
        this.loadDelivery();
    }

    scrollToBottom() {
        setTimeout(() => {
            this.content.scrollToBottom(300);
        }, 400);
    }
    scrollToTop() {
        setTimeout(() => {
            this.content.scrollToTop(300);
        }, 400);
    }
    selectMeal(item_id) {
        this.saveDelivery.type_id = item_id;
        this.deliveryForm.patchValue({lunch_type: this.saveDelivery.type_id});
        this.scrollToBottom();
        console.log('ionViewDidLoad DeliveryProgramPage');
        this.selectFoodType();
    }
    getIntroduction() {
        let slide = {
            "title": this.deliverySlide1Title,
            "description": this.deliverySlide1Desc,
            "image": "assets/icon/salad.svg"
        };
        this.slides.push(slide);
        let slide2 = {
            "title": this.deliverySlide2Title,
            "description": this.deliverySlide2Desc,
            "image": "assets/icon/feather.svg"
        };
        this.slides.push(slide2);
        let slide3 = {
            "title": this.deliverySlide3Title,
            "description": this.deliverySlide3Desc,
            "image": "assets/icon/lunch-box.svg"
        };
        this.slides.push(slide3);
    }


    getArticles() {
        this.api.loader();

        this.food.getArticlesByDateTimeRange({init: this.deliveryParams.delivery.getFullYear() + '-' + (this.deliveryParams.delivery.getMonth() + 1) + "-" + this.deliveryParams.delivery.getDate()}).subscribe((resp: any) => {
            //this.food.getArticlesByDateTimeRange({init: '2019-10-01', end: '2019-10-03'}).subscribe((resp) => {
            this.listArticles = resp.data;
            this.getIntroduction();
            for (let item in this.listArticles) {
                this.listArticles[item].hasDrink = false;
                this.listArticles[item].attributes = JSON.parse(this.listArticles[item].attributes);
                if (this.listArticles[item].attributes.bebidas) {
                    if (this.listArticles[item].attributes.bebidas.length > 0 && this.shouldDrink) {
                        this.listArticles[item].hasDrink = true;
                    }
                }
            }
            this.checkDelivery();
            this.api.dismissLoader();
        }, (err) => {
            this.api.dismissLoader();
        });
    }

    /**
     * Navigate to the detail page for this item.
     */
    openTutorials() {
        console.log("Pre slides", this.slides);
        this.params.setParams({
            slides: this.slides
        });
        if (this.userData._user) {
            this.navCtrl.navigateForward('home/tutorials');
        } else {
            this.navCtrl.navigateForward('shop/home/tutorials');
        }

    }
    programComplete() {
        this.params.setParams({
            delivery: this.deliveryParams
        });
        this.navCtrl.navigateForward('shop/home/programar/complete');
    }

    autoSelectSingles() {
        if (this.attributes.entradas) {
            if (this.attributes.entradas.length == 1) {
                let entrada = this.attributes.entradas[0];
                this.saveDelivery.starter_id = entrada.codigo;
                this.saveDelivery.starter_name = entrada.valor;
            }
        }
        if (this.attributes.plato.length == 1) {
            let plato = this.attributes.plato[0];
            this.saveDelivery.main_id = plato.codigo;
            this.saveDelivery.main_name = plato.valor;
            this.deliveryForm.patchValue({main_dish: this.saveDelivery.main_id});
        }
        if (this.attributes.bebidas) {
            if (this.attributes.bebidas.length == 1) {
                let bebida = this.attributes.bebidas[0];
                this.saveDelivery.drink_id = bebida.codigo;
                this.saveDelivery.drink_name = bebida.valor;
            }
        }

    }

    selectFoodType() {
        this.submitAttempt = false;
        let typeval = this.deliveryForm.get('lunch_type').value;
        if (typeval > 0) {
            this.saveDelivery.type_id = typeval;
            this.foodTypeSelected = this.listArticles.find(i => i.id == this.saveDelivery.type_id);
            console.log("selected", this.foodTypeSelected);
            if (this.foodTypeSelected) {
                this.attributes = this.foodTypeSelected.attributes;
                if (this.attributes.entradas.length == 0) {
                    this.hasStarter = false;
                } else {
                    this.hasStarter = true;
                }
                if (this.attributes.bebidas) {
                    if (this.attributes.bebidas.length == 0) {
                        this.hasDrink = false;
                    } else {
                        if (this.shouldDrink) {
                            this.hasDrink = true;
                        }
                    }
                } else {
                    this.hasDrink = false;
                }
                this.saveDelivery.type_name = this.foodTypeSelected.name
                this.saveDelivery.starter_id = "";
                this.saveDelivery.starter_name = "";
                this.saveDelivery.drink_id = "";
                this.saveDelivery.drink_name = "";
                this.saveDelivery.main_name = "";
                this.saveDelivery.main_id = "";
                this.autoSelectSingles();
            }
        }
    }

    selectInitFood() {
        this.submitAttempt = false;
        if (this.attributes.entradas) {
            let thestarter = this.attributes.entradas.find(i => i.codigo == this.saveDelivery.starter_id);
            if (thestarter) {
                console.log("selectInit", this.saveDelivery);
                this.saveDelivery.starter_id = thestarter.codigo;
                this.saveDelivery.starter_name = thestarter.valor;
                console.log("selectInit", this.saveDelivery);
                console.log("selectInit", this.saveDelivery.starter_id);
                console.log("selectInit", this.saveDelivery.starter_name);
                console.log("selectInit", thestarter);
                console.log("selectInit", thestarter.codigo);
                console.log("selectInit", thestarter.valor);
            }
        }
    }
    selectDrink() {
        this.submitAttempt = false;
        if (this.attributes.bebidas) {
            let thedrink = this.attributes.bebidas.find(i => i.codigo == this.saveDelivery.drink_id);
            if (thedrink) {
                this.saveDelivery.drink_id = thedrink['codigo'];
                this.saveDelivery.drink_name = thedrink['valor'];
                console.log("selectInit", this.saveDelivery);
                console.log("selectInit", thedrink);
            }
        }

    }

    selectStandarFood() {
        this.submitAttempt = false;
        if (this.attributes.plato) {
            let typeval = this.deliveryForm.get('main_dish').value;
            if (typeval > 0) {
                this.saveDelivery.main_id = typeval;
                let theMain = this.attributes.plato.find(i => i.codigo == this.saveDelivery.main_id);
                if (theMain) {
                    this.saveDelivery.main_id = theMain['codigo'];
                    this.saveDelivery.main_name = theMain['valor'];
                    console.log("selectStandar", this.saveDelivery);
                    console.log("selectInit", theMain);
                }
            }
        }
    }
    cancelSelection() {
        if (!this.submitting) {
            this.submitting = true;
        } else {
            return false;
        }
        console.log("Cancel selection");
        if (!this.isProgrammed) {
            this.navCtrl.pop();
        } else {
            this.api.loader();
            this.food.cancelDeliverySelection(this.deliveryParams.id).subscribe((resp: any) => {
                this.api.dismissLoader();
                if (resp.status == "success") {
                    this.deliveryParams.status = "pending";
                    this.events.publish('home:loadDeliveries', {});
                    this.programComplete();
                } else {
                    if (resp.message == "Limit passed") {
                        this.showPrompt();
                    } else {
                        this.showPrompt2();
                    }

                }

            }, (err) => {
                this.api.dismissLoader();
            });
        }
    }

    async showPrompt() {
        const prompt = await this.alertCtrl.create({
            header: this.deliverydateErrorTitle,
            message: this.deliverydateErrorDesc,
            inputs: [],
            buttons: [
                {
                    text: 'OK',
                    handler: data => {

                    }
                }
            ]
        });
        await prompt.present();
    }
    async showPrompt2() {
        const prompt = await this.alertCtrl.create({
            header: this.deliverysuspErrorTitle,
            message: this.deliverysuspErrorDesc,
            inputs: [],
            buttons: [
                {
                    text: 'OK',
                    handler: data => {

                    }
                }
            ]
        });
        await prompt.present();
    }
    sendDelivery() {
        this.api.loader();
        console.log("sdfsd", this.saveDelivery);
        this.fb.logEvent("Program Delivery");
        if (this.deliveryParams.id > 0) {
            this.food.updateDeliveryInformation(this.saveDelivery).subscribe((resp: any) => {
                this.submitting = false;
                this.api.dismissLoader();
                if (resp.status == "success") {
                    this.deliveryParams.status = "enqueue";
                    this.deliveryParams.pending_count = resp.pending_count;
                    this.events.publish('home:loadDeliveries', {});
                    this.programComplete();
                } else {
                    if (resp.message == "Limit passed") {
                        this.showPrompt();
                    } else {
                        this.showPrompt2();
                    }

                }

            }, (err) => {
                this.api.dismissLoader();
            });
        } else {
            this.presentAlertPay();
        }

    }
    async presentAlertPay() {
        const prompt = await this.alertCtrl.create({
            header: "Bienvenido!",
            subHeader: "Prueba tus primeros lonchis en envase desechable para ver si te gusta el concepto. Si apruebas te invitamos a que pruebes nuestros planes con envases desechables. Son mas baratos y amigables con el medio ambiente.",
            inputs: [{
                name: 'amount',
                type: 'number',
                min: 1,
                max: 80
            },],
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
                    handler: (data) => {
                        console.log('Confirm Ok');
                        let container = {
                            type: "delivery", params: this.saveDelivery
                        };
                        this.drouter.addPostPurchase(container);
                        this.navCtrl.back();
                        this.drouter.addPages([{
                            type: 'addCart',
                            amount: data.amount,
                            merchant_id: 1299,
                            item_id: null,
                            product_variant_id: 220,
                        }]);
                        this.navCtrl.navigateForward('login');
                    }
                }
            ]
        });
        prompt.present();
    }

    updateDelivery() {
        console.log("Update Delivery", this.submitting);
        if (!this.submitting) {
            this.submitting = true;
        } else {
            return false;
        }
        console.log("Update Delivery");
        this.starterError = false;
        this.drinkError = false;
        this.submitAttempt = true;
        if (this.saveDelivery.starter_id.length == 0 && this.attributes.entradas.length > 0) {
            this.starterError = true;
            this.submitting = false;
            return;
        }
        if (this.attributes.bebidas) {
            if (this.saveDelivery.drink_id.length == 0 && this.attributes.bebidas.length > 0) {
                this.drinkError = true;
                this.submitting = false;
                return;
            }
        }
        if (!this.deliveryForm.valid) {
            this.submitting = false;
            return;
        }
        this.sendDelivery();

    }

}
