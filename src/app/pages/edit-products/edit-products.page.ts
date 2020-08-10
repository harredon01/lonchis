import {Component, OnInit} from '@angular/core';
import {NavController, ToastController, ModalController, AlertController, LoadingController} from '@ionic/angular';
import {ParamsService} from '../../services/params/params.service';
import {SpinnerDialog} from '@ionic-native/spinner-dialog/ngx';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ProductsService} from '../../services/products/products.service';
import {Product} from '../../models/product';
import {ApiService} from '../../services/api/api.service';
@Component({
    selector: 'app-edit-products',
    templateUrl: './edit-products.page.html',
    styleUrls: ['./edit-products.page.scss'],
})
export class EditProductsPage implements OnInit {
    product: Product;
    loading: any;
    submitAttemptP: boolean;
    isNew: boolean = false;
    selectingCategory: boolean = true;
    submitAttemptV: boolean;
    submitAttemptPNew: boolean;
    editingVariant: boolean;
    variants: any[] = [];
    categories: any[] = [];
    formP: FormGroup;
    formV: FormGroup;
    formPNew: FormGroup;
    productsErrorStringSave: string = "";
    variantsErrorStringSave: string = "";
    getProductErrorString: string = "";
    category: string = "";
    constructor(public navCtrl: NavController,
        public activatedRoute: ActivatedRoute,
        public productsServ: ProductsService,
        public toastCtrl: ToastController,
        formBuilder: FormBuilder,
        public api: ApiService,
        public modalCtrl: ModalController,
        public alertCtrl: AlertController,
        private spinnerDialog: SpinnerDialog,
        public loadingCtrl: LoadingController,
        public params: ParamsService,
        public translateService: TranslateService) {

        let vm = this;
        this.translateService.get('AVAILABILITY_CREATE.ERROR_SAVE').subscribe((value) => {
            vm.productsErrorStringSave = value;
        });
        this.translateService.get('AVAILABILITY_CREATE.ERROR_SAVE').subscribe((value) => {
            vm.variantsErrorStringSave = value;
        });
        this.translateService.get('AVAILABILITY_CREATE.ERROR_SAVE').subscribe((value) => {
            vm.getProductErrorString = value;
        });
        this.formP = formBuilder.group({
            id: [''],
            name: ['', Validators.required],
            description: ['', Validators.required]
        });
        this.formV = formBuilder.group({
            id: [''],
            sku: ['', Validators.required],
            product_id: ['', Validators.required],
            description: ['', Validators.required],
            price: ['', Validators.required],
            tax: [''],
            sale: [''],
            quantity: [''],
            is_on_sale: [''],
            is_digital: [''],
            is_shippable: [''],
        });
        this.formPNew = formBuilder.group({
            category_id: [''],
            category_name: [''],
            name: ['', Validators.required],
            description: ['', Validators.required],
            sku: ['', Validators.required],
            description2: ['', Validators.required],
            price: ['', Validators.required],
            tax: [''],
            sale: [''],
            quantity: [''],
            is_on_sale: [''],
            is_digital: [''],
            is_shippable: [''],
        });
    }

    ionViewDidEnter() {
        let product = this.activatedRoute.snapshot.paramMap.get('productId');
        console.log("Getting product", product);
        let merch = this.activatedRoute.snapshot.paramMap.get('objectId');
        console.log("Getting merch", merch);
        if (product != 'null') {
            this.getItem(product);
        } else {
            this.isNew = true;
            this.getCategories();
        }
    }

    addVariant() {
        this.editingVariant = true;
    }
    getItem(productId) {
        this.showLoader();
        this.productsServ.getProductSimple(productId).subscribe((data: any) => {
            this.dismissLoader();

            let results = data.product;
            this.product = new Product(results);
            this.variants = data.variants;
            console.log("after get getProductSimple", this.product);
            console.log("after get getProductSimpleV", this.variants);
            let container = {
                id: this.product.id,
                name: this.product.name,
                description: this.product.description
            };
            console.log("Setting form values: ", container);
            this.formP.setValue(container);
            console.log(JSON.stringify(data));
        }, (err) => {
            this.dismissLoader();
            // Unable to log in
            this.toastCtrl.create({
                message: this.getProductErrorString,
                duration: 3000,
                position: 'top'
            }).then(toast => toast.present());
            this.api.handleError(err);
        });
    }
    getCategories() {
        this.showLoader();
        let merchant = this.activatedRoute.snapshot.paramMap.get('objectId');
        this.productsServ.getProductCategories(merchant,"Product").subscribe((data: any) => {
            this.dismissLoader();
            console.log(JSON.stringify(data));
            this.categories = data.data;
        }, (err) => {
            this.dismissLoader();
            this.toastCtrl.create({
                message: this.getProductErrorString,
                duration: 3000,
                position: 'top'
            }).then(toast => toast.present());
            this.api.handleError(err);
        });
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
    selectCategory(categoryId) {
        let container = this.formPNew.value;
        container.category_id = categoryId;
        container.is_shippable = true;
        container.is_on_sale = true;
        container.is_digital = true;
        this.formPNew.setValue(container);
        this.selectingCategory = false;
    }
    addCategory() {
        let container = this.formPNew.value;
        container.category_name = this.category;
        container.is_shippable = true;
        container.is_on_sale = true;
        container.is_digital = true;
        this.formPNew.setValue(container);
        this.selectingCategory = false;
    }
    saveProduct() {
        this.submitAttemptP = true;
        console.log("saveOrCreateProduct");
        if (!this.formP.valid) {return;}
        this.showLoader();
        let container = this.formP.value;
        if (container.id.length == 0) {
            let merchant = this.activatedRoute.snapshot.paramMap.get('objectId');
            container['merchant_id'] = merchant;
        }
        this.productsServ.saveOrCreateProduct(container).subscribe((data: any) => {
            this.dismissLoader();
            if (data.status == "success") {
                this.filterResults(data);
            } else {
                this.toastCtrl.create({
                    message: this.productsErrorStringSave,
                    duration: 3000,
                    position: 'top'
                }).then(toast => toast.present());
            }

        }, (err) => {
            this.dismissLoader();
            // Unable to log in
            this.toastCtrl.create({
                message: this.productsErrorStringSave,
                duration: 3000,
                position: 'top'
            }).then(toast => toast.present());
            this.api.handleError(err);
        });
    }
    filterResults(data: any) {
        console.log("after saveOrCreateProduct", data);
        let results = data.product;
        results.variants = results.product_variants;
        this.product = new Product(results);
        if (results.variants) {
            this.variants = results.variants;
        }

        let container = {
            id: this.product.id,
            name: this.product.name,
            description: this.product.description
        };
        console.log("Setting form values: ", container);
        this.formP.setValue(container);
        this.isNew = false;
    }

    createProduct() {
        this.submitAttemptPNew = true;
        console.log("createProduct");
        if (!this.formPNew.valid) {return;}
        this.showLoader();
        let container = this.formPNew.value;
        let merchant = this.activatedRoute.snapshot.paramMap.get('objectId');
        container['merchant_id'] = merchant;
        this.productsServ.saveOrCreateProduct(container).subscribe((data: any) => {
            this.dismissLoader();
            if (data.status == "success") {
                this.filterResults(data);
            } else {
                this.toastCtrl.create({
                    message: this.productsErrorStringSave,
                    duration: 3000,
                    position: 'top'
                }).then(toast => toast.present());
            }
        }, (err) => {
            this.dismissLoader();
            // Unable to log in
            this.toastCtrl.create({
                message: this.productsErrorStringSave,
                duration: 3000,
                position: 'top'
            }).then(toast => toast.present());
            this.api.handleError(err);
        });
    }
    deleteProduct() {
        this.showLoader();
        this.productsServ.deleteProduct(this.product.id).subscribe((data: any) => {
            this.dismissLoader();
            if (data.status == "success") {
                console.log("after deleteProduct");
                this.navCtrl.back();
                console.log(JSON.stringify(data));
            } else {
                this.toastCtrl.create({
                    message: this.productsErrorStringSave,
                    duration: 3000,
                    position: 'top'
                }).then(toast => toast.present());
            }

        }, (err) => {
            this.dismissLoader();
            // Unable to log in
            this.toastCtrl.create({
                message: this.productsErrorStringSave,
                duration: 3000,
                position: 'top'
            }).then(toast => toast.present());
            this.api.handleError(err);
        });
    }
    deleteVariant(variantId) {
        this.showLoader();
        this.productsServ.deleteVariant(variantId).subscribe((data: any) => {
            this.dismissLoader();
            if (data.status == "success") {
                console.log("after deleteVariant");
                for (let item in this.variants) {
                    if (this.variants[item].id == variantId) {
                        this.variants.splice(parseInt(item), 1);
                    }
                }
                if (this.variants.length == 0 ){
                    this.navCtrl.back();
                }
                console.log(JSON.stringify(data));
            } else {
                this.toastCtrl.create({
                    message: this.variantsErrorStringSave,
                    duration: 3000,
                    position: 'top'
                }).then(toast => toast.present());
            }

        }, (err) => {
            this.dismissLoader();
            // Unable to log in
            this.toastCtrl.create({
                message: this.variantsErrorStringSave,
                duration: 3000,
                position: 'top'
            }).then(toast => toast.present());
            this.api.handleError(err);
        });
    }
    saveVariant() {
        this.submitAttemptV = true;
        console.log("saveavailability");
        if (!this.formV.valid) {return;}
        this.showLoader();
        this.productsServ.saveOrCreateVariant(this.formV.value).subscribe((data: any) => {

            this.dismissLoader();
            if (data.status == "success") {
                this.editingVariant = false;
                let variant = data.variant;
                let found = false;
                for (let item in this.variants) {
                    if (this.variants[item].id == variant.id) {
                        this.variants[item] = variant;
                        found = true;
                    }
                }
                if (!found) {
                    this.variants.push(variant);
                }
                console.log(JSON.stringify(data));
            } else {
                this.toastCtrl.create({
                    message: this.variantsErrorStringSave,
                    duration: 3000,
                    position: 'top'
                }).then(toast => toast.present());
            }

        }, (err) => {
            this.dismissLoader();
            // Unable to log in
            this.toastCtrl.create({
                message: this.variantsErrorStringSave,
                duration: 3000,
                position: 'top'
            }).then(toast => toast.present());
            this.api.handleError(err);
        });
    }
    editVariant(variant: any) {
        this.editingVariant = true;
        let container = {
            id: variant.id,
            product_id: variant.product_id,
            price: variant.price,
            tax: variant.tax,
            sale: variant.sale,
            quantity: variant.quantity,
            sku: variant.sku,
            description: variant.description,
            is_digital: variant.is_digital,
            is_shippable: variant.is_shippable,
            is_on_sale: variant.is_on_sale,
        };
        console.log("Setting form values: ", container);
        this.formV.setValue(container);
    }
    createVariant() {
        this.editingVariant = true;
        let container = {
            id: "",
            product_id: this.product.id,
            price: "",
            tax: "",
            sale: "",
            quantity: "",
            sku: "",
            description: "",
            is_digital: false,
            is_shippable: false,
            is_on_sale: false,
        };
        console.log("Setting form values: ", container);
        this.formV.setValue(container);
    }
    cancelEditVariant() {
        this.editingVariant = false;
    }

    ngOnInit() {
    }

}
