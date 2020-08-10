import {Injectable} from '@angular/core';
import {ApiService} from '../api/api.service';
@Injectable({
    providedIn: 'root'
})
export class BookingService {

    constructor(public api: ApiService) {}
    getBookingsObject(objectB: any) {
        let endpoint = '/bookings';
        let seq = this.api.get(endpoint,objectB);
        return seq;
    }
    getBooking(objectB: any) {
        let endpoint = '/bookings/'+objectB;
        let seq = this.api.get(endpoint );
        return seq;
    }
    getObjectsWithBookingUser() {
        let endpoint = '/bookings/user';
        let seq = this.api.get(endpoint);
        return seq;
    }
    checkExistingBooking(booking_id) {
        let endpoint = '/bookings/'+booking_id+"/check";
        let seq = this.api.get(endpoint);
        return seq;
    }
    addBookingObject(data: any) {
        let endpoint = '/bookings';
        let seq = this.api.post(endpoint, data);
        return seq;
    }
    editBookingObject(data: any) {
        let endpoint = '/bookings/edit';
        let seq = this.api.post(endpoint, data);
        return seq;
    }
    immediateBookingObject(data: any) {
        let endpoint = '/bookings/now';
        let seq = this.api.post(endpoint, data);
        return seq;
    }
    getAvailabilitiesObject(data: any)  {
        let url = "/availabilities";
        let seq = this.api.get(url,data);
        return seq;
    }
    saveOrCreateAvailability(data: any) {
        let endpoint = '/availabilities';
        let seq = this.api.post(endpoint, data);
        return seq;
    }
    deleteAvailability(data: any) {
        let endpoint = '/availabilities';
        let seq = this.api.delete(endpoint,data);
        return seq;
    }
    changeStatusBookingObject(data: any) {
        let endpoint = '/bookings/status';
        let seq = this.api.post(endpoint, data);
        return seq;
    }
    recheduleBookingObject(data: any) {
        let endpoint = '/bookings/schedule';
        let seq = this.api.post(endpoint, data);
        return seq;
    }
    registerConnection(data: any) {
        let endpoint = '/bookings/connection';
        let seq = this.api.post(endpoint, data);
        return seq;
    }
    leaveCall(data: any) {
        let endpoint = '/bookings/connection_end';
        let seq = this.api.post(endpoint, data);
        return seq;
    }
    deleteBookingObject(objectId: any) {
        let endpoint = '/bookings/'+objectId;
        let seq = this.api.delete(endpoint);
        return seq;
    }
    getMonthName(month:any){
        if(month==0){
            return "Enero"
        }
        if(month==1){
            return "Febrero"
        }
        if(month==2){
            return "Marzo"
        }
        if(month==3){
            return "Abril"
        }
        if(month==4){
            return "Mayo"
        }
        if(month==5){
            return "Junio"
        }
        if(month==6){
            return "Julio"
        }
        if(month==7){
            return "Agosto"
        }
        if(month==8){
            return "Septiembre"
        }
        if(month==9){
            return "Octubre"
        }
        if(month==10){
            return "Noviembre"
        }
        if(month==11){
            return "Diciembre"
        }
    }
}
