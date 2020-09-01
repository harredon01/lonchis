import {Component, OnInit} from '@angular/core';
import {NavController, ModalController} from '@ionic/angular';
import {ParamsService} from '../../services/params/params.service';
import {BookingService} from '../../services/booking/booking.service';
import {BookingDetailPage} from '../booking-detail/booking-detail.page';
import {CommentsPage} from '../comments/comments.page';
import {ApiService} from '../../services/api/api.service';
import {TranslateService} from '@ngx-translate/core';
import {Booking} from '../../models/booking';
import {UserDataService} from '../../services/user-data/user-data.service';
//import * as OT from '@opentok/client';
declare var OT: any;
@Component({
    selector: 'app-opentok',
    templateUrl: './opentok.page.html',
    styleUrls: ['./opentok.page.scss'],
})
export class OpentokPage implements OnInit {
    session: any;
    publisher: any;
    apiKey: any;
    bookingId: any = null;
    mainBooking: Booking;
    sessionId: string;
    recipient: any;
    token: string;
    activeCall: boolean = false;
    streamCreated: boolean = false;
    ended: boolean = false;

    constructor(public navCtrl: NavController,
        public modalCtrl: ModalController,
        public userData: UserDataService,
        public api: ApiService,
        public translateService: TranslateService,
        public params: ParamsService,
        public bookingS: BookingService) {
        this.apiKey = '46389642';
        this.recipient = {};
        this.sessionId = '';
        this.token = '';
        this.mainBooking = new Booking({});
    }
    ngOnInit() {
    }
    ionViewDidEnter() {
        let params = this.params.getParams();
        console.log("Call params", params);

        this.sessionId = params.sessionId;
        this.token = params.token;
        if (this.bookingId) {
            if (this.bookingId != params.booking_id) {
                this.activeCall = false;
                this.streamCreated = false;
                this.ended = false;
            }
        }
        this.bookingId = params.booking_id;

        this.getBooking();
    }
    getBooking() {
        this.bookingS.getBooking(this.bookingId).subscribe((resp: any) => {
            console.log("getBooking", resp);
            if (resp.status == 'success') {
                this.mainBooking = new Booking(resp.booking);
                this.mainBooking.clean();
                if (this.userData._user.id == this.mainBooking.customer.id) {
                    this.recipient = this.mainBooking.bookable;
                } else {
                    this.recipient = this.mainBooking.customer;
                }
                console.log("getBooking result", this.recipient);
            } else {
                this.translateService.get('OPENTOK.DENIED').subscribe((value) => {
                    this.recipient.name = value;
                });
            }


        }, (err) => {

        });
    }

    endCall() {
        this.ended = true;
        this.session.disconnect();
        let container = {"booking_id": this.bookingId, "connection_id": this.session.connection.connectionId};
        this.bookingS.leaveCall(container).subscribe((resp: any) => {
            console.log("end call result", resp);
            if (resp.status == "success") {
                this.bookingId = -1;
            } else {
                this.endCall();
            }
        }, (err) => {

        });
    }
    async viewNotes() {
        let container = {};
        let el = (document.querySelector('.OT_publisher') as HTMLElement);
        let el2 = (document.querySelector('.OT_subscriber') as HTMLElement);
        if (el) {
            el.style.setProperty('display', 'none');
        }
        if (el2) {
            el2.style.setProperty('display', 'none');
        }
        OT.updateViews();
        let params = this.params.getParams();
        if (!params) {
            params = {};
        }
        params.modal = true;
        this.params.setParams(params);
        let addModal = await this.modalCtrl.create({
            component: BookingDetailPage,
            componentProps: container
        });
        await addModal.present();
        const {data} = await addModal.onDidDismiss();
        console.log("Modal Closed");
        if (el) {
            el.style.setProperty('display', 'block');
        }
        if (el2) {
            el2.style.setProperty('display', 'block');
        }
        OT.updateViews();
    }
    async rate() {
        let container = {objectJson: this.mainBooking.bookable, type_object: "Merchant", object_id: this.mainBooking.id};
        this.params.setParams(container);
        let addModal = await this.modalCtrl.create({
            component: CommentsPage,
            componentProps: container
        });
        await addModal.present();
        const {data} = await addModal.onDidDismiss();
        console.log("Modal Closed");
        this.navCtrl.navigateRoot("tabs/categories");
    }
    done() {
        this.navCtrl.navigateRoot("tabs/categories");
    }

    startCall() {
        this.activeCall = true;
        this.session = OT.initSession(this.apiKey, this.sessionId);
        console.log("Session started", this.session);
        let publisherOptions = {
            insertMode: 'append',
            width: 90,
            height: 120,
        };
        this.api.loader();
        this.publisher = OT.initPublisher('publisher', publisherOptions);
        OT.updateViews();
        this.session.on({
            streamCreated: (event: any) => {
                console.log('Stream created');
                let options = {width: "100%", height: '89%', insertMode: 'append'};
                this.session.subscribe(event.stream, 'subscriber', options);
                setTimeout(function () {OT.updateViews();}, 400);

            },
            streamDestroyed: (event: any) => {
                console.log(`Stream ${event.stream.name} ended because ${event.reason}`);
                this.ended = true;

            },
            connectionCreated: (event: any) => {
                console.log(`connectionCreated`);

            },
            connectionDestroyed: (event: any) => {
                console.log(`connection ended because ${event.reason}`);
                this.ended = true;
            },
            sessionConnected: (event: any) => {

                let container = {"booking_id": this.bookingId, "connection_id": this.session.connection.connectionId};
                this.registerConnection(container);
                this.session.publish(this.publisher);
                this.api.dismissLoader();
                let el = (document.querySelector('.OT_publisher') as HTMLElement);
                if (el) {
                    el.style.setProperty('display', 'block');
                }
                //OT.updateViews();
                setTimeout(function () {OT.updateViews();}, 400);
            }
        });

        this.session.connect(this.token, (error: any) => {
            if (error) {
                console.log(`There was an error connecting to the session ${error}`);
            }
        });
    }
    registerConnection(container) {
        this.bookingS.registerConnection(container).subscribe((resp: any) => {
            console.log("Register connection result", resp);
            if (resp.status == 'success') {
                console.log("Connection registered")
            } else {
                this.registerConnection(container);
            }
        }, (err) => {

        });
    }

}
