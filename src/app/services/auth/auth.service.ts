import { Injectable } from '@angular/core';
import {ApiService} from '../api/api.service';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(public api: ApiService) {}

    verifyMedical(user: any) {
        let endpoint = '/auth/verify_medical';
        let seq = this.api.post(endpoint, user);
        return seq;
    }
    verifyCodes(formData: any) {
        let endpoint = '/auth/verify_codes';
        let seq = this.api.post(endpoint, formData);
        return seq;
    }
    validateCodes(code: any) {
        let endpoint = '/auth/validate_codes';
        let codes = {code: code};
        let seq = this.api.post(endpoint, codes);
        return seq;
    }
    checkSocialToken(data: any) {
        let endpoint = '/auth/social';
        let seq = this.api.post(endpoint, data);
        return seq;
    }
    requestForgotPassword(data: any) {
        let endpoint = '/auth/password_request';
        let seq = this.api.post(endpoint, data);
        return seq;
    }
    updateForgotPassword(data: any) {
        let endpoint = '/auth/password_request_update';
        let seq = this.api.post(endpoint, data);
        return seq;
    }
    verifyTwoFactorToken(data: any) {
        let endpoint = '/auth/verify_two_factor';
        let seq = this.api.post(endpoint, data);
        return seq;
    }
    /**
     * Send a POST request to our login endpoint with the data
     * the user entered on the form.
     */
    updatePassword(passwordData: any) {
        let seq = this.api.post('/user/change_password', passwordData);
        return seq; 
    }
    /**
     * Send a POST request to our login endpoint with the data
     * the user entered on the form.
     */
    updateMedical(medical: any) {
        let seq = this.api.post('/auth/update_medical', medical);
        return seq; 
    }
    /**
     * Send a POST request to our login endpoint with the data
     * the user entered on the form.
     */
    updateCodes(codes: any) {
        let seq = this.api.post('/auth/update_codes', codes);
        return seq; 
    }
}
