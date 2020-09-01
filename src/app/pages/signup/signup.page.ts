import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NavController} from '@ionic/angular';
import {ApiService} from '../../services/api/api.service';
import {UserService} from '../../services/user/user.service';
@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {


    registrationForm: FormGroup;
    submitAttempt: boolean = false;
    passwordError: boolean = false;
    idType: any;
    loading: any;

    // Our translated text strings
  constructor(public navCtrl: NavController,
        public user: UserService,
        public api: ApiService,
        public formBuilder: FormBuilder) {
        this.idType = "text";
        this.registrationForm = formBuilder.group({
            password: ['', Validators.compose([Validators.maxLength(30), Validators.minLength(6), Validators.required])],
            password_confirmation: ['', Validators.compose([Validators.maxLength(30), Validators.minLength(6), Validators.required])],
            area_code: [''],
            cellphone: ['', Validators.compose([Validators.maxLength(30), Validators.pattern('[0-9._%+-]*'), Validators.required])],
            firstName: ['', Validators.compose([Validators.maxLength(50), Validators.pattern('[a-zA-Z áúíóéÁÉÍÓÚñÑ]*'), Validators.required])],
            lastName: ['', Validators.compose([Validators.maxLength(50), Validators.pattern('[a-zA-Z áúíóéÁÉÍÓÚñÑ]*'), Validators.required])],
            email: ['', Validators.compose([Validators.maxLength(100), Validators.pattern('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-.]*\.[a-zA-Z]{2,}'), Validators.required])]
        });
        let container = this.registrationForm.value;
        container.area_code = 57;
        this.registrationForm.setValue(container);
    }

  ngOnInit() {
  }
  doSignup() {
        this.submitAttempt = true;
        this.passwordError = false;
        console.log("Signing up");
        if (!this.registrationForm.valid) {return;}
        console.log("Registration valid");
        if (this.registrationForm.get('password').value != this.registrationForm.get('password_confirmation').value ) {
            this.passwordError = true;
            return;
        }
        console.log("Password match");
        this.api.loader();
        // Attempt to login in through our User service
        this.user.signup(this.registrationForm.value).subscribe((resp:any) => {
            if (resp.status == 'success') {
                let container = this.registrationForm.value;
                container.remember = true;
                this.user._loggedIn(resp, container);
            }
            this.api.dismissLoader();
            console.log("Post login", resp);
            this.user.postLogin().then((value) => {
                console.log("Post login complete");
                this.navCtrl.navigateForward('tabs');
            }, (err) => {
                console.log("Post login error on registration");
            });
        }, (err) => {
            // Unable to sign up
            console.log("Error", err);
            let message = err.error.message;
            let errorString = "";
            if (message.email || message == "email_exists") {
                this.api.toast('SIGNUP.ERROR_EMAIL');
            } else if (message.celphone || message == "cel_exists") {
                this.api.toast('SIGNUP.ERROR_CEL');
            } else {
                this.api.toast(message);
            }
            this.api.dismissLoader();
            this.api.handleError(err);
        });
    }

    selectType() {
        console.log("Select type", this.registrationForm.get('docType').value);
        if (this.registrationForm.get('docType').value == "CC" || this.registrationForm.get('docType').value == "TI" || this.registrationForm.get('docType').value == "CEL") {
            this.idType = "tel";
        } else {
            this.idType = "text";
        }
    }

}
