import {Injectable} from '@angular/core';
import {Product} from '../../models/product';
import {ApiService} from '../api/api.service';
@Injectable({
    providedIn: 'root'
})
export class ProductsService {

    products: Product[] = [];

    constructor(public api: ApiService) {}

    getProductsMerchant(data: any) {
        let endpoint = '/merchants/products';
        let seq = this.api.get(endpoint, data);
        return seq;

    }
    getProductsMerchantPrivate(data: any) {
        let endpoint = '/private/merchants/products';
        let seq = this.api.get(endpoint, data);
        return seq;

    }
    getProductSimple(product: string) {
        let endpoint = '/products/' + product;
        let seq = this.api.get(endpoint);
        return seq;
    }
    getProductCategories(params: any) {
        let endpoint = '/categories';
        let seq = this.api.get(endpoint, params);
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
    buildProduct(container: any, merchant: any) {
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
            productInfo.merchant_id = merchant.merchant_id;
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
        productInfo.variants = [];
        return productInfo;
    }
    calculateTotals(where, array) {
        console.log("Calculate totals " + where);
        for (let i in array) {
            for (let j in array[i].products) {
                array[i].products[j] = this.calculateTotalsProduct(array[i].products[j]);
            }
        }
        return array;
    }
    calculateTotalsProduct(product: Product) {
        if (product.onsale) {
            product.exsubtotal = product.exprice * product.amount;
            product.subtotal = product.price * product.amount;
        } else {
            product.subtotal = product.price * product.amount;
        }
        return product;
    }
    selectVariant(item: any) {
        console.log(item);
        for (let i in item.variants) {
            let container = item.variants[i];
            if (container.id == item.variant_id) {
                if (!item.amount) {
                    item.amount = container.min_quantity;
                }
                if (container.is_on_sale) {
                    console.log("selectVariantsale", container);
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
            }
        }
        return this.calculateTotalsProduct(item);
    }
    updateProductVisual(container: any, productInfo: Product) {
        if (container.is_on_sale) {
            productInfo.price = container.price;
            productInfo.onsale = true;
            productInfo.exprice = container.exprice;
        } else {
            productInfo.price = container.price;
            productInfo.onsale = false;
        }

        productInfo.variant_id = container.id;
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
    updateVisualWithCart(categories, items) {
        for (let key in items) {
            let contItem = items[key].attributes;
            if (true) {
                contItem.id = items[key].id;
                contItem.quantity = items[key].quantity;
                for (let k in categories) {
                    for (let j in categories[k].products) {
                        for (let i in categories[k].products[j].variants) {
                            if (contItem.product_variant_id == categories[k].products[j].variants[i].id) {
                                categories[k].products[j].inCart = true;
                                categories[k].products[j].item_id = contItem.id;
                                categories[k].products[j].amount = contItem.quantity;
                                categories[k].products[j] = this.updateProductVisual(categories[k].products[j].variants[i], categories[k].products[j]);
                            }
                        }

                    }
                }
            }
        }
        return categories;
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
    getCategory(variant, arrayCategories) {
        for (let i in arrayCategories) {
            if (arrayCategories[i].id == variant['category_id']) {
                return arrayCategories[i];
            }
        }
        let activeCategory = {
            "name": variant['category_name'],
            "id": variant['category_id'],
            "description": variant['category_description'],
            "products": [],
            "more": false
        }
        arrayCategories.push(activeCategory);
        return activeCategory
    }
    getProduct(variant, arrayCategories, merchant) {
        for (let i in arrayCategories) {
            for (let j in arrayCategories[i].products) {
                if (arrayCategories[i].products[j].id == variant['product_id']) {
                    return arrayCategories[i].products[j];
                }
            }
        }
        let productInfo = this.buildProduct(variant, merchant);
        return productInfo;
    }
    buildProductInformation(items) {
        if (items['products_variants'].length > 0) {
            let resultsCategory = [];
            let processedVariants = [];
            for (let i = 0; i < items['products_variants'].length; i++) {
                if (processedVariants.includes(items['products_variants'][i].id)) {
                    continue;
                } else {
                    processedVariants.push(items['products_variants'][i].id);
                }
                
                let category = this.getCategory(items['products_variants'][i], resultsCategory);
                console.log("Category found",category);
                let product = this.getProduct(items['products_variants'][i], resultsCategory, items['merchant_products'][0]);
                console.log("product found",product);
                if (!this.containsObject(product, category.products)) {
                    category.products.push(product);
                }
                let variant = this.createVariant(items['products_variants'][i]);
                if (variant.price < product.price) {
                    product = this.updateProductVisual(variant, product);
                }
                if (!this.containsObject(variant, product.variants)) {
                    product.variants.push(variant);
                }
            }
            for (let j in items['products_files']) {
                for (let i = 0; i < resultsCategory.length; i++) {
                    for (let k in resultsCategory[i].products) {
                        let imgInfo: any = {};
                        if (items['products_files'][j].trigger_id == resultsCategory[i].products[k].id) {
                            imgInfo.file = items['products_files'][j].file;
                            resultsCategory[i].products[k].imgs.push(imgInfo);
                            break;
                        }
                    }

                }
            }
            console.log('resultbuildCat', resultsCategory);
            return resultsCategory;
        }
        return null;
    }
    containsObject(obj, list) {
        var x;
        for (x in list) {
            if (list[x].id == obj.id) {
                return true;
            }
        }
        return false;
    }
}
