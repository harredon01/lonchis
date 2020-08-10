import { Injectable } from '@angular/core';
import {Address} from '../../models/address'
@Injectable({
  providedIn: 'root'
})
export class MapDataService {
map: any;
    activeType: string;
    activeId: string;
    merchantId: string;
    activeObject: string;
    reports: any[];
    createdAddress:any;
    merchants: any[];
    shared: any[];
    objects: any[];
    routeStops: any[];
    polygons: any[];
    meMarker: any;
    address:Address;
    newReportMarker: any;
    routePolyline: any;
    routeMarker: any;
    activeDelivery: any;
    newAddressMarker: any;

    constructor() {
        this.map = null;
        this.address = new Address({});
        this.meMarker = null;
        this.newReportMarker = null;
        this.newAddressMarker = null;
        this.routePolyline = null;
        this.routeMarker = null;
        this.activeDelivery = null;
        this.reports = [];
        this.polygons = [];
        this.merchants = [];
        this.shared = [];
        this.objects = [];
    }
    /**
     * prepares sharer data for creating a marker
     */
    hideMarkerList(typeMarker: string) {
        let hidingList = this[typeMarker];
        for (let item in hidingList) {
            let cont = hidingList[item];
            cont.setVisible(false);
        }
    }
    hideAll() {
        this.hideMarkerList("Polygons");
        this.hideMarkerList("Reports");
        this.hideMarkerList("Merchants");
        this.hideMarkerList("Shared");
        this.hideMarkerList("Objects");
        this.hideMarkerList("routeStops");
        if (this.meMarker){
            this.meMarker.setVisible(false);
        }
        if (this.newReportMarker){
            this.newReportMarker.setVisible(false);
        }
        if (this.newAddressMarker){
            this.newAddressMarker.setVisible(false);
        }
        if (this.routePolyline){
            this.routePolyline.setVisible(false);
        }
        if (this.routeMarker){
            this.routeMarker.setVisible(false);
        }
    }
    showAll() {
        this.showMarkerList("Reports");
        this.showMarkerList("Merchants");
        this.showMarkerList("Shared");
        this.showMarkerList("Objects");
    }
    /**
     * prepares sharer data for creating a marker
     */
    showMarkerList(typeMarker: string) {
        typeMarker = typeMarker.toLowerCase();
        let hidingList = this[typeMarker];
        for (let item in hidingList) {
            let cont = hidingList[item];
            cont.setVisible(true);
        }
    }
    addItem(item: any, typeMarker: string) {
        typeMarker = typeMarker.toLowerCase();
        let container = this[typeMarker];
        try {
            container.push(item);
        } catch {
            console.log("item not supported", typeMarker);
        }
    }
    deleteItem(item: any, typeMarker: string) {
        typeMarker = typeMarker.toLowerCase();
        let container = this[typeMarker];
        try {
            container.splice(container.indexOf(item), 1);
        } catch {
            console.log("item not supported", typeMarker);
        }
    }
    getItem(item_id: any, typeMarker: string) {
        typeMarker = typeMarker.toLowerCase();
        let container = this[typeMarker];
        try {
            for (let marker in container) {
                let cont = container[marker];
                if (item_id == cont.get("id")) {
                    return cont;
                }

            }
            return null;
        } catch {
            console.log("item not supported", typeMarker);
        }
        return null;
    }
    getItemUser(user_id: any, typeMarker: string) {
        typeMarker = typeMarker.toLowerCase();
        let container = this[typeMarker];
        try {
            for (let marker in container) {
                let cont = container[marker];
                if (user_id == cont.get("user_id")) {
                    return cont;
                }

            }
            return null;
        } catch {
            console.log("item not supported", typeMarker);
        }
        return null;
    }

    addMap(item: any) {
        this.map = item;
    }

    getMap() {
        return this.map;
    }
}
