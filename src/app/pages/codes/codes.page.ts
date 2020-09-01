import {Component, OnInit} from '@angular/core';
import {NavController} from '@ionic/angular';
import {ApiService} from '../../services/api/api.service';
import {AuthService} from '../../services/auth/auth.service';
@Component({
    selector: 'app-codes',
    templateUrl: './codes.page.html',
    styleUrls: ['./codes.page.scss'],
})
export class CodesPage implements OnInit {
    data: any;
    valid: boolean;
    constructor(public auth: AuthService, 
    public navCtrl: NavController, 
        public api: ApiService) {
    }

    ngOnInit() {
    }
    update() {

        this.auth.updateCodes(this.data).subscribe((resp: any) => {
            if (resp.status = "success") {
                this.api.toast('MEDICAL.SUCCESS');

            } else {
                this.api.toast('MEDICAL.ERROR');
            }
        }, (err) => {
            console.error('ERR', err);
            console.log(JSON.stringify(err));
            this.api.handleError(err);
            // err.status will contain the status code
        });
        // console.log( this.data );
    }
    verify() {
        let formData = {password: this.data.password};
        this.auth.verifyMedical(this.data).subscribe((authenticated: any) => {
            console.log("Password post");
            this.data.green = authenticated['green'];
            this.data.red = authenticated['red'];
            this.data.password = formData.password;
            this.valid = true;
        }, (err) => {
            this.api.toast('MEDICAL.ERROR');
            this.api.handleError(err);
        });
    }

}
