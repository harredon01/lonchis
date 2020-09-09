import {Injectable} from '@angular/core';
import {ApiService} from '../api/api.service';
@Injectable({
    providedIn: 'root'
})
export class CategoriesService {

    constructor(public api: ApiService) {}

    getCategories(data: any) {
        let url = "/categories";
        let seq = this.api.get(url,data);
        return seq;
    }
    
    searchCategories(data: any) {
        let url = "/categories/search" ;
        let seq = this.api.post(url,data);
        return seq;
    }
}
