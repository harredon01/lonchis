import {Component, OnInit, ViewChild} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {NavController, IonContent, ToastController} from '@ionic/angular';
import {ApiService} from '../../services/api/api.service';
import {AuthService} from '../../services/auth/auth.service';
@Component({
    selector: 'app-medical',
    templateUrl: './medical.page.html',
    styleUrls: ['./medical.page.scss'],
})
export class MedicalPage implements OnInit { 
    @ViewChild(IonContent) content: IonContent;
    public data: any = {};
    public showForm = false;
    private medicalSuccess:string = "";
    private medicalError:string = "";
    public showProfile = false;
    public genders:any[] = [
        {name: "M", value: "m"},
        {name: "F", value: "f"}
    ];
    public bloods:any[] = [
        {name: "A", value: "a"},
        {name: "O", value: "o"},
        {name: "B", value: "b"},
        {name: "AB", value: "ab"}
    ];
    public antigens:any[] = [
        {name: "+", value: "+"},
        {name: "-", value: "-"}
    ];
    constructor(public auth: AuthService, public navCtrl: NavController, public toastCtrl: ToastController,public api: ApiService, public translateService: TranslateService) {
        this.translateService.get('MEDICAL.SUCCESS').subscribe((value) => {
            this.medicalSuccess = value;
        });
        this.translateService.get('MEDICAL.ERROR').subscribe((value) => {
            this.medicalError = value;
        });
    }

    ngOnInit() {
    }
    keytab(event, maxlength: any) {
        let nextInput = event.srcElement.nextElementSibling; // get the sibling element
        console.log('nextInput', nextInput);
        var target = event.target || event.srcElement;
        console.log('target', target);
        console.log('targetvalue', target.value);
        console.log('targettype', target.nodeType);
        if (target.value.length < maxlength) {
            return;
        }
        if (nextInput == null)  // check the maxLength from here
            return;
        else
            nextInput.focus();   // focus if not null
    }
    toggleForm() {
        if (this.showProfile == true) {
            if (this.showForm == true) {
                this.showForm = false;
            } else {
                this.showForm = true;
                this.content.scrollToBottom(300);
            }
        }
    }
    update() {
        console.log("Sending");
        console.log(JSON.stringify(this.data));
        this.data.birth = this.data.birthYear + "-" + this.data.birthMonth + "-" + this.data.birthDay;
        this.auth.updateMedical(this.data).subscribe((resp: any) => {
            if (resp.status = "success") {
                this.toastCtrl.create({
                    message: this.medicalSuccess,
                    duration: 3000,
                    position: 'top'
                }).then(toast => toast.present());
                this.showForm = false;
            } else {
                this.toastCtrl.create({
                    message: this.medicalError,
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
        this.auth.verifyMedical(this.data).subscribe((resp: any) => {
            this.showProfile = true;
            console.log(JSON.stringify(resp));
            this.data = resp;
            var birthdate = new Date(this.data.birth);
            this.data.birthDay = birthdate.getDate() + 1;
            this.data.birthMonth = birthdate.getMonth() + 1;
            this.data.birthYear = birthdate.getFullYear();
            this.data.password = formData.password;
        }, (err) => {
            this.toastCtrl.create({
                message: this.medicalError,
                duration: 3000,
                position: 'top'
            }).then(toast => toast.present());
            this.api.handleError(err);
        });
    }
}
