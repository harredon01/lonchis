import {Injectable} from '@angular/core';
import {ApiService} from '../api/api.service';
@Injectable({
    providedIn: 'root'
})
export class FoodService {

    constructor(public api: ApiService) {}
    getArticlesByDate(item?: any) {
        let url = '/articles?start_date=' + item
        let seq = this.api.get(url);
        return seq;
    }
    getRouteInfo(delivery) {
        let seq = this.api.get(`/food/route_detail/` + delivery);
        return seq;
    }
    getArticlesByDateTimeRange(range) {
        let seq = this.api.get(`/articles?start_date=${range.init}&includes=file`);
        return seq;
    }
    updateDeliveryAddress(delivery) {
        let seq = this.api.post(`/deliveries/address`, delivery);
        return seq;
    }
    cancelDeliverySelection(delivery) {
        let seq = this.api.post(`/deliveries/cancel/` + delivery, {});
        return seq;
    }
    updateDeliveryInformation(delivery) {
        let seq = this.api.post(`/deliveries/options`, delivery);
        return seq;
    }
    getDeliveries(url) {
        if (url) {
            url = "/deliveries?" + url;
        } else {
            url = "/deliveries";
        }
        let seq = this.api.get(url);
        return seq;
    }
    getMonthName(item: any) {
        if (item == 0) {
            return "Ene";
        }
        if (item == 1) {
            return "Feb";
        }
        if (item == 2) {
            return "Mar";
        }
        if (item == 3) {
            return "Abr";
        }
        if (item == 4) {
            return "May";
        }
        if (item == 5) {
            return "Jun";
        }
        if (item == 6) {
            return "Jul";
        }
        if (item == 7) {
            return "Ago";
        }
        if (item == 8) {
            return "Sept";
        }
        if (item == 9) {
            return "Oct";
        }
        if (item == 10) {
            return "Nov";
        }
        if (item == 11) {
            return "Dic";
        }
    }
    getDayName(item: any) {
        if (item == 0) {
            return "Domingo";
        }
        if (item == 1) {
            return "Lunes";
        }
        if (item == 2) {
            return "Martes";
        }
        if (item == 3) {
            return "Miércoles";
        }
        if (item == 4) {
            return "Jueves";
        }
        if (item == 5) {
            return "Viernes";
        }
        if (item == 6) {
            return "Sábado";
        }
    }
    getArticles(where) {
        let url ="";
        if (where) {
            url = "/articles?" + where;
        } else {
            url = "/articles";
        }
        let seq = this.api.get(url);
        return seq;
    }
    getPendingDelivery() {
        let seq = this.api.get(`/deliveries/pending` );
        return seq;
    }
    updateDeliveryDate(delivery) {
        let seq = this.api.post(`/deliveries/date`, delivery);
        return seq;
    }
    getIndicators( ) {
        let seq = this.api.get(`/food/indicators`);
        return seq;
    }
}
