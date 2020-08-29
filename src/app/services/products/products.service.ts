import {Injectable} from '@angular/core';
import {Product} from '../../models/product';
import {ApiService} from '../api/api.service';
@Injectable({
    providedIn: 'root'
})
export class ProductsService {

    products: Product[] = [];

    constructor(public api: ApiService) {}

    getProductsMerchant(data:any) {
        let endpoint = '/merchants/products';
        let seq = this.api.get(endpoint,data);
        return seq;

    }
    getProductSimple(product: string) {
        let endpoint = '/products/' + product;
        let seq = this.api.get(endpoint);
        return seq;
    }
    getProductCategories(merchant_id: string,typeS: string) {
        let endpoint = '/merchants/' + merchant_id + '/categories/'+typeS;
        let seq = this.api.get(endpoint);
        return seq;
    }
    saveOrCreateProduct(product: any) {
        let endpoint = '/products';
        let seq = this.api.post(endpoint, product);
        if (product.id) {
            endpoint = '/products/' + product.id;
            seq = this.api.patch(endpoint, product);
        }
        return seq;
    }
    deleteProduct(product: any) {
        let endpoint = '/products/' + product;
        let seq = this.api.delete(endpoint, product);
        return seq;
    }
    saveOrCreateVariant(variant: any) {
        let endpoint = '/products/variant';
        let seq = this.api.post(endpoint, variant);
        if (variant.id) {
            endpoint = '/products/variant/' + variant.id;
            seq = this.api.patch(endpoint, variant);
        }

        return seq;
    }
    deleteVariant(variant: any) {
        let endpoint = '/products/variant/' + variant;
        let seq = this.api.delete(endpoint);
        return seq;
    }
    buildProduct(container: any, merchant: any, merchant_id: any) {
        let productInfo = new Product({});
        
        productInfo.id = container.product_id;
        productInfo.name = container.prod_name;
        productInfo.description = container.prod_desc;
        productInfo.description_more = false;
        productInfo.more = false;
        productInfo.type = container.type;
        productInfo.merchant_description_more = false;
        if (merchant) {
            productInfo.merchant_name = merchant.merchant_name;
            productInfo.merchant_description = merchant.merchant_description;
            productInfo.src = merchant.merchant_icon;

            productInfo.merchant_type = merchant.merchant_type;
        }

        productInfo.inCart = false;
        if (container.is_on_sale) {
            
            productInfo.onsale = true;
            productInfo.subtotal = productInfo.price;
            productInfo.exsubtotal = productInfo.exprice;
        } else {
            productInfo.subtotal = productInfo.price;
            productInfo.onsale = false;
        }

        productInfo = this.updateProductVisual(container, productInfo);
        productInfo.item_id = null;
        productInfo.amount = container.min_quantity;
        productInfo.imgs = [];
        return productInfo;
    }
    updateProductVisual(container: any, productInfo: Product) {
        if (container.is_on_sale) {
            console.log("updateProductVisualsale",productInfo);
            console.log("updateProductVisualsale2",container);
            productInfo.price = container.price;
            productInfo.onsale = true;
            productInfo.exprice = container.exprice;
        } else {
            productInfo.price = container.price;
            productInfo.onsale = false;
        }

        productInfo.variant_id = container.id;
        console.log("Update Prod Vis1", container);
        if (container.attributes) {
            let attributes = container.attributes;
            if (attributes.buyers) {
                productInfo.unitPrice = productInfo.price / attributes.buyers;
                productInfo.unitLunches = attributes.buyers;
            } else {
                productInfo.unitPrice = productInfo.price;
                productInfo.unitLunches = 1;
            }

        } else {
            productInfo.unitPrice = productInfo.price;
            productInfo.unitLunches = 1;
        }
        //        console.log("Update Prod Vis3", productInfo);
        return productInfo;
    }
    createDeliveryDate(days) {
        let startDate = new Date();
        let daysToAdd = parseInt(days);
        let weeksToAdd = Math.floor(daysToAdd / 5);
        let dow = startDate.getDay();
        if (dow == 0) {
            daysToAdd = daysToAdd + 1 + (weeksToAdd * 2);
        } else if (dow == 5) {
            daysToAdd = daysToAdd + 3 + (weeksToAdd * 2);
        } else if (dow == 6) {
            daysToAdd = daysToAdd + 2 + (weeksToAdd * 2);
        } else if (dow == 1) {
            if (daysToAdd > 4) {
                daysToAdd = daysToAdd + (weeksToAdd * 2);
            }
        } else if (dow == 2) {
            if (daysToAdd > 3) {
                daysToAdd = daysToAdd + 2 + (weeksToAdd * 2);
            }
        } else if (dow == 3) {
            if (daysToAdd > 2) {
                daysToAdd = daysToAdd + 2 + (weeksToAdd * 2);
            }
        } else if (dow == 4) {
            if (daysToAdd > 1) {
                daysToAdd = daysToAdd + 2 + (weeksToAdd * 2);
            }
        }
        let time = startDate.getTime() + (1000 * 60 * 60 * 24 * daysToAdd);
        return new Date(time);
    }
    createVariant(container: any) {
        let variant: any = {};
        //        console.log("Variant", container);
        //        console.log("Variant", container.id)
        variant.id = container.id;
        variant.description = container.description;
        if (container.attributes.length > 0) {
            variant.attributes = JSON.parse(container.attributes);
            if (variant.attributes.buyers) {
                variant.unitPrice = variant.price / variant.attributes.buyers;
            } else {
                variant.unitPrice = variant.price;
            }
        } else {
            variant.attributes = "";
        }
        if (container.is_on_sale) {
            variant.exprice = container.price;
            variant.price = container.sale;
        } else {
            variant.price = container.price;
        }
        variant.is_on_sale = container.is_on_sale;
        variant.min_quantity = container.min_quantity;
        return variant;
    }
    buildProductInformation(items, merchant_id: any) {
        let results = [];
        if (items['products_variants'].length > 0) {
            let resultsVariant = [];
            let resultsCategory = [];
            //            console.log("fhfhfhfhfhf", items['products_variants'][0]);
            let productInfo = this.buildProduct(items['products_variants'][0], items['merchant_products'][0], merchant_id);
            let activeCategory = {
                "name": items['products_variants'][0]['category_name'],
                "id": items['products_variants'][0]['category_id'],
                "description": items['products_variants'][0]['category_description'],
                "products": [],
                "more": false
            }
            for (let i = 0; i < items['products_variants'].length; i++) {
                if (items['products_variants'][i].product_id != productInfo.id) {
                    productInfo.variants = resultsVariant;
                    //                    console.log("activeCategory", activeCategory);
                    if (activeCategory.id) {
                        if (items['products_variants'][i - 1]['category_id'] == activeCategory.id) {
                            activeCategory.products.push(productInfo);
                        } else {
                            resultsCategory.push(activeCategory);
                            activeCategory = {
                                "name": items['products_variants'][i - 1]['category_name'],
                                "id": items['products_variants'][i - 1]['category_id'],
                                "description": items['products_variants'][i - 1]['category_description'],
                                "products": [],
                                "more": false
                            };
                            activeCategory.products.push(productInfo);
                        }
                    }
                    results.push(productInfo);
                    productInfo = this.buildProduct(items['products_variants'][i], items['merchant_products'][0], merchant_id);

                    resultsVariant = [];
                }
                let variant = this.createVariant(items['products_variants'][i]);
                if (variant.price < productInfo.price) {
                    productInfo = this.updateProductVisual(variant, productInfo);
                }
                resultsVariant.push(variant);
                if ((i + 1) >= items['products_variants'].length) {
                    productInfo.variants = resultsVariant;
                    if (activeCategory.id) {
                        if (items['products_variants'][i]['category_id'] == activeCategory.id) {
                            activeCategory.products.push(productInfo);
                            resultsCategory.push(activeCategory);
                        } else {
                            resultsCategory.push(activeCategory);
                            activeCategory = {
                                "name": items['products_variants'][i]['category_name'],
                                "id": items['products_variants'][i]['category_id'],
                                "description": items['products_variants'][i]['category_description'],
                                "products": [],
                                "more": false
                            };
                            activeCategory.products.push(productInfo);
                            resultsCategory.push(activeCategory);
                        }
                    }
                    results.push(productInfo);
                }
            }
            for (let j = 0; j < items['products_files'].length; j++) {
                for (let i = 0; i < results.length; i++) {
                    let imgInfo: any = {};
                    if (items['products_files'][j].trigger_id == results[i].id) {
                        imgInfo.file = items['products_files'][j].file;
                        results[i].imgs.push(imgInfo);
                        break;
                    }
                }
            }
            console.log('resultbuildCat', resultsCategory);
            return resultsCategory;
        }
        return null;
    }
}
