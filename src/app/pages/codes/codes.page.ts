import {Component, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {NavController, ToastController} from '@ionic/angular';
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
    codesSuccess: string = "";
    codeError: string = "";
    constructor(public auth: AuthService, public navCtrl: NavController, public toastCtrl: ToastController,public api: ApiService, public translateService: TranslateService) {
        this.translateService.get('MEDICAL.SUCCESS').subscribe((value) => {
            this.codesSuccess = value;
        });
        this.translateService.get('MEDICAL.ERROR').subscribe((value) => {
            this.codeError = value;
        });
    }

    ngOnInit() {
    }
    update() {

        this.auth.updateCodes(this.data).subscribe((resp: any) => {
            if (resp.status = "success") {
                this.toastCtrl.create({
                    message: this.codesSuccess,
                    duration: 3000,
                    position: 'top'
                }).then(toast => toast.present());

            } else {
                this.toastCtrl.create({
                    message: this.codeError,
                    duration: 3000,
                    position: 'top'
                }).then(toast => toast.present());
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
            this.toastCtrl.create({
                message: this.codeError,
                duration: 3000,
                position: 'top'
            }).then(toast => toast.present());
            this.api.handleError(err);
        });
    }

}
