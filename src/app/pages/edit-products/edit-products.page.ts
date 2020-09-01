import {Component, OnInit} from '@angular/core';
import {NavController, ModalController, AlertController} from '@ionic/angular';
import {ParamsService} from '../../services/params/params.service';
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
    category: string = "";
    constructor(public navCtrl: NavController,
        public activatedRoute: ActivatedRoute,
        public productsServ: ProductsService,
        formBuilder: FormBuilder,
        public api: ApiService,
        public modalCtrl: ModalController,
        public alertCtrl: AlertController,
        public params: ParamsService) {
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
        this.api.loader();
        this.productsServ.getProductSimple(productId).subscribe((data: any) => {
            this.api.dismissLoader();

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
            this.api.dismissLoader();
            // Unable to log in
            this.api.toast('INPUTS.ERROR_SAVE');
            this.api.handleError(err);
        });
    }
    getCategories() {
        this.api.loader();
        let merchant = this.activatedRoute.snapshot.paramMap.get('objectId');
        this.productsServ.getProductCategories(merchant,"Product").subscribe((data: any) => {
            this.api.dismissLoader();
            console.log(JSON.stringify(data));
            this.categories = data.data;
        }, (err) => {
            this.api.dismissLoader();
            this.api.toast('INPUTS.ERROR_SAVE');
            this.api.handleError(err);
        });
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
        this.api.loader();
        let container = this.formP.value;
        if (container.id.length == 0) {
            let merchant = this.activatedRoute.snapshot.paramMap.get('objectId');
            container['merchant_id'] = merchant;
        }
        this.productsServ.saveOrCreateProduct(container).subscribe((data: any) => {
            this.api.dismissLoader();
            if (data.status == "success") {
                this.filterResults(data);
            } else {
                this.api.toast('INPUTS.ERROR_SAVE');
            }

        }, (err) => {
            this.api.dismissLoader();
            // Unable to log in
            this.api.toast('INPUTS.ERROR_SAVE');
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
        this.api.loader();
        let container = this.formPNew.value;
        let merchant = this.activatedRoute.snapshot.paramMap.get('objectId');
        container['merchant_id'] = merchant;
        this.productsServ.saveOrCreateProduct(container).subscribe((data: any) => {
            this.api.dismissLoader();
            if (data.status == "success") {
                this.filterResults(data);
            } else {
                this.api.toast('INPUTS.ERROR_SAVE');
            }
        }, (err) => {
            this.api.dismissLoader();
            // Unable to log in
            this.api.toast('INPUTS.ERROR_SAVE');
            this.api.handleError(err);
        });
    }
    deleteProduct() {
        this.api.loader();
        this.productsServ.deleteProduct(this.product.id).subscribe((data: any) => {
            this.api.dismissLoader();
            if (data.status == "success") {
                console.log("after deleteProduct");
                this.navCtrl.back();
                console.log(JSON.stringify(data));
            } else {
                this.api.toast('INPUTS.ERROR_SAVE');
            }

        }, (err) => {
            this.api.dismissLoader();
            // Unable to log in
            this.api.toast('INPUTS.ERROR_SAVE');
            this.api.handleError(err);
        });
    }
    deleteVariant(variantId) {
        this.api.loader();
        this.productsServ.deleteVariant(variantId).subscribe((data: any) => {
            this.api.dismissLoader();
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
                this.api.toast('INPUTS.ERROR_SAVE');
            }

        }, (err) => {
            this.api.dismissLoader();
            // Unable to log in
            this.api.toast('INPUTS.ERROR_SAVE');
            this.api.handleError(err);
        });
    }
    saveVariant() {
        this.submitAttemptV = true;
        console.log("saveavailability");
        if (!this.formV.valid) {return;}
        this.api.loader();
        this.productsServ.saveOrCreateVariant(this.formV.value).subscribe((data: any) => {

            this.api.dismissLoader();
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
                this.api.toast('INPUTS.ERROR_SAVE');
            }

        }, (err) => {
            this.api.dismissLoader();
            // Unable to log in
            this.api.toast('INPUTS.ERROR_SAVE');
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
