import {Component, OnInit} from '@angular/core';
import {NavController, ModalController} from '@ionic/angular';
import {Contacts, Contact, ContactField, ContactName, ContactFindOptions, ContactFieldType} from '@ionic-native/contacts/ngx';
import {parsePhoneNumberFromString, ParseError} from 'libphonenumber-js'
import {ContactsService} from '../../services/contacts/contacts.service';
import {ParamsService} from '../../services/params/params.service';
import {UserDataService} from '../../services/user-data/user-data.service';
import {ApiService} from '../../services/api/api.service';

@Component({
    selector: 'app-import-contacts',
    templateUrl: './import-contacts.page.html',
    styleUrls: ['./import-contacts.page.scss'],
})
export class ImportContactsPage implements OnInit {
    contacts2 = [];
    importcontacts = [];
    invites = [];
    constructor(private contacts: Contacts, public navCtrl: NavController,
        public params: ParamsService,
        public userData: UserDataService,
        public contactsServ: ContactsService,
        public modalCtrl: ModalController,
        public api: ApiService) {}

    ngOnInit() {
        this.api.loader();
        var options = new ContactFindOptions();
        options.filter = "";
        options.multiple = true;
        //options.desiredFields = [navigator.contacts.fieldType.id];
        options.hasPhoneNumber = true;
        let fields: ContactFieldType[] = ["displayName", "name"];
        this.contacts.find(fields, options).then((value) => {
            console.log("saveAddress result", value);
            this.onSuccess(value);
        }).catch((error) => {
            console.log('Error saveAddress', error);

        });
    }
    parsePhone(phone: any) {
        console.log("parse phone", phone);
        try {
            let phoneNumber: any = parsePhoneNumberFromString("+" + phone);
            console.log("parse phone result", phoneNumber);
            return phoneNumber;
        } catch (error) {
            console.log("error", error)
            if (error instanceof ParseError) {
                // Not a phone number, non-existent country, etc.
                console.log(error.message)
            } else {
                throw error
            }
            return null;
        }
    }


    onSuccess(contacts) {
        let area = this.userData._user.area_code;
        console.log(area);
        console.log(JSON.stringify(contacts));
        var contacts2 = [];
        for (var i = 0; i < contacts.length; i++) {
            var cellphones = contacts[i].phoneNumbers;
            for (let cellphone in cellphones) {
                var numberformatted = [];
                var str = cellphones[cellphone].value;
                var o = str.indexOf("+");
                str = str.replace(/[^\d]/g, '');
                if (str.length < 6) {
                    break;
                }
                if (o > -1) {
                    try {
                        let phone = this.parsePhone(str);
                        numberformatted[0] = phone.countryCallingCode;
                        numberformatted[1] = phone.nationalNumber;
                    } catch (err) {
                        break;
                    }

                } else {
                    var a = str.indexOf(area);
                    if (a == 0) {
                        try {
                            let phone = this.parsePhone(str);
                            numberformatted[0] = phone.countryCallingCode;
                            numberformatted[1] = phone.nationalNumber;
                        } catch (err) {
                            break;
                        }
                    } else {
                        if (str.length < 11) {
                            str = area + str;
                            try {
                                let phone = this.parsePhone(str);
                                numberformatted[0] = phone.countryCallingCode;
                                numberformatted[1] = phone.nationalNumber;
                            } catch (err) {
                                break;
                            }
                        } else {
                            try {
                                let phone = this.parsePhone(str);
                                numberformatted[0] = phone.countryCallingCode;
                                numberformatted[1] = phone.nationalNumber;
                            } catch (err) {
                                break;
                            }
                        }
                    }
                }
                console.log(cellphones[cellphone].value + "###" + numberformatted[0] + " " + numberformatted[1]);
                let phoneData = {area_code: numberformatted[0], cellphone: numberformatted[1]};
                contacts2.push(phoneData);
            }
        }
        var final = [];
        var final2 = [];
        var max = 50;
        var counter = 0;
        for (let number2 in contacts2) {
            var found = false;
            for (let number in final2) {
                //console.log(JSON.stringify(contacts2[number2]));
                if (contacts2[number2].area_code == final2[number].area_code && contacts2[number2].cellphone == final2[number].cellphone) {
                    found = true;
                }
            }
            if (found == false) {
                counter++;
                final.push(contacts2[number2]);
                final2.push(contacts2[number2]);
                if (counter >= max) {
                    this.contactsServ.checkContacts(final).subscribe((data: any) => {
                        this.contacts2 = this.contacts2.concat(data.contacts.contacts);
                    }, function (err) {
                        console.error('ERR', err);
                        // err.status will contain the status code
                    });
                    var final = [];
                    var counter = 0;
                }
            }
        }
        if (counter > 0) {
            this.contactsServ.checkContacts(final).subscribe((resp: any) => {
                this.api.dismissLoader();
                this.contacts2 = this.contacts2.concat(resp.contacts.contacts);
            }, function (err) {
                console.error('ERR', err);
                // err.status will contain the status code
            });
        } else {
            this.api.dismissLoader();
        }

    }
    checkSelection(contact: any) {
        let add = true;
        if (contact.selected) {
            contact.selected = false;
            add = false;
        } else {
            contact.selected = true;
        }
        if (add) {
            this.invites.push(contact.id);
        } else {
            for (let i = 0; i < this.invites.length; i++) {
                if (this.invites[i] == contact.id) {
                    this.invites.splice(i, 1);
                }
            }
        }
    }
    addContacts() {
        var finalids = [];
        for (let id in this.invites) {
            if (this.invites[id]) {
                finalids.push(this.invites[id]);
            }
        }
        console.log("Start importing", finalids);
        this.contactsServ.importContacts(finalids).subscribe((resp: any) => {
            console.log("Done importing");
            this.navCtrl.back();
        },
            function (data) {
                console.log("Error");
                console.log(JSON.stringify(data));
            });
        this.contacts2 = [];
        this.invites = [];
    }
    addContact(contact) {
        this.importcontacts.push(contact);
    }
}
