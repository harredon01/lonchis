import {Component, OnInit, ViewChild, ChangeDetectorRef} from '@angular/core';
import {Friend} from "../../models/friend";
import {Message} from "../../models/message";
import {IonInfiniteScroll} from '@ionic/angular';
import {NavController, AlertController, IonContent} from '@ionic/angular';
import {Events} from '../../services/events/events.service';
import {UserDataService} from '../../services/user-data/user-data.service';
import {ChatService} from '../../services/chat/chat.service';
import {ApiService} from '../../services/api/api.service';
import {ParamsService} from '../../services/params/params.service';
import {Router} from '@angular/router';
@Component({
    selector: 'app-chat-room',
    templateUrl: './chat-room.page.html',
    styleUrls: ['./chat-room.page.scss'],
})
export class ChatRoomPage implements OnInit {
    @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
    @ViewChild(IonContent) content: IonContent;
    public friend: Friend = new Friend({});
    public messages: Message[] = [];
    public tabBarElement: any;
    public input: string = '';
    public backButton: boolean = false;
    public type: string = '';
    public targetId: string = '';
    public objectId: string = '';
    public lastId: any = null;
    public isNew: boolean = true;
    public willContinue: boolean = true;
    paymentsGetStartString = '';
    avatar = 'assets/avatar/Dylan.png';
    public page = 0;
    public messagemore = false;

    constructor(public chats: ChatService,
        private cdr: ChangeDetectorRef,
        public api: ApiService,
        public navCtrl: NavController,
        public router: Router,
        public userData: UserDataService,
        public params: ParamsService,
        public events: Events) {
    }
    ionViewDidEnter() {
        this.tabBarElement = document.querySelector('#tabs .tabbar');
        let paramSent = this.params.getParams();
        if (paramSent) {
            if (paramSent.friend) {
                this.backButton = true;
                this.friend = paramSent.friend;
                this.type = "user_message";
                if (this.targetId == this.friend.id) {
                    this.isNew = false;
                } else {
                    this.isNew = true;
                    this.lastId = null;
                }
                this.targetId = this.friend.id;
                this.objectId = this.friend.id;
                this.page = 0;
                this.messages=[];
                this.getMessages(true, false);
            }
        } else {
            paramSent = {"type": "platform", "objectId": "food"};
            let typeObject = paramSent.type;
            let objectId = paramSent.objectId;
            if (typeObject == "group") {
                this.type = "group_message";
            } else {
                this.type = "user_message";
            }

            this.getSupportAgent(typeObject, objectId);
        }
        console.log("onPageWillEnter");
        this.events.subscribe('notification:received', (data: any) => {
            console.log("result warnshoov", data.notification);
            this.receiveMessage(data.notification);
        });
        this.willContinue = true;
        this.page = 0;
        console.log("using ionViewDidEnter", this.lastId);
        console.log("Friend", this.friend);
        let vm = this;
        setTimeout(() => {
            vm.recurringMessage();
        }, 5000);
    }

    ionViewDidLeave() {
        console.log("onPageWillLeave");
        this.events.publish('app:stopNotifsWeb', {});
        this.willContinue = false;
        //this.tabBarElement.style.display = 'flex';
        this.events.destroy('notification:received');
    }
    recurringMessage() {
        this.getMessages(true, true);
        if (this.willContinue) {
            let vm = this;
            setTimeout(() => {
                vm.recurringMessage();
            }, 30000);
        }

    }

    checkAddMessage(id) {
        for (let item in this.messages) {
            if (id == this.messages[item].id) {
                return false;
            }
        }
        return true;
    }
    getMessages(scroll, update) {
        if (!update) {
            this.api.loader();
        }
        let where = "";
        if (this.type == "user_message") {
            where = "type=user&to_id=" + this.objectId + "&page=" + this.page
        } else if (this.type == "group_message") {
            where = "type=group&to_id=" + this.objectId + "&page=" + this.page
        }
        if (update && this.lastId) {
            if (this.type == "user_message") {
                where = "type=user&to_id=" + this.objectId + "&page=1&id_after=" + this.lastId;
            } else if (this.type == "group_message") {
                where = "type=group&to_id=" + this.objectId + "&page=1&id_after=" + this.lastId;
            }
        } else {
            this.page++;
        }

        this.chats.getServerChatDetail(where).subscribe((results: any) => {
            if (!update) {
                this.api.dismissLoader();
            }
            let data = results.data;
            for (let msg in data) {
                if(update){
                    if(this.userData._user.id==data[msg].user_id){
                        continue;
                    }
                }
                let check = this.checkAddMessage(data[msg].id);
                if (check) {
                    let message: Message = new Message({});
                    message.id = data[msg].id;
                    message.to = 'me';
                    message.to_id = data[msg].messageable_id;
                    message.from_id = data[msg].user_id;
                    message.from = this.friend.username;
                    message.content = data[msg].message;
                    if (this.lastId) {
                        if (this.lastId < data[msg].id) {
                            this.lastId = data[msg].id;
                            this.messages.push(message);
                        } else {
                            this.messages.unshift(message);
                        }
                    } else {
                        this.lastId = data[msg].id;
                        this.messages.unshift(message);
                    }
                }
            }
            if (results.page < results.last_page) {
                this.messagemore = true;
            } else {
                //this.infiniteScroll.disabled;
                this.messagemore = false;
            }
            console.log("Scroll to bottom", scroll);
            if (scroll) {
                this.scrollToBottom();
            }
            console.log(JSON.stringify(data));
            console.log("Messages", this.messages);
            console.log("result last id:", this.lastId);
        }, (err) => {
            this.api.dismissLoader();
            // Unable to log in
            this.api.toast('CATEGORIES.ERROR_GET');
            this.api.handleError(err);
        });
    }
    getSupportAgent(typeObject, objectId) {
        this.api.loader();
        this.chats.getSupportAgent(typeObject, objectId).subscribe((results: any) => {
            console.log('getSupportAgent', results);
            this.api.dismissLoader();
            if (results.id) {
                this.friend = results;
                this.friend.avatar = "assets/avatar/Bentley.png";
                if (this.targetId == this.friend.id) {
                    this.isNew = false;
                } else {
                    this.isNew = true;
                    this.lastId = null;
                }
                this.targetId = this.friend.id;
                this.objectId = this.friend.id;
                this.page = 0;
                this.messages=[];
                this.getMessages(true, false);
            }
        }, (err) => {
            this.api.dismissLoader();
            // Unable to log in
            this.api.toast('CATEGORIES.ERROR_GET');
            this.api.handleError(err);
        });
    }
    doInfinite(infiniteScroll) {
        console.log('Begin async operation', this.messagemore);
        if (this.messagemore) {
            this.messagemore = false;
            let vm = this;
            setTimeout(() => {
                vm.getMessages(false, false);
                console.log('Async operation has ended');
                infiniteScroll.target.complete();
            }, 500);
        } else {
            infiniteScroll.target.complete();
        }

    }

    scrollToBottom() {
        let vm = this;
        setTimeout(() => {
            vm.content.scrollToBottom(300);
                setTimeout(() => {
                vm.content.scrollToBottom(300);
            }, 1000);
        }, 400);
    }

    receiveMessage(notification: any) {
        console.log("Notification Received", notification);
        notification.from_id = notification.trigger_id;
        notification.to_id = notification.user_id;
        console.log("Notification Received", notification.from_id);
        console.log("Notification Received", this.friend.id);
        console.log("Notification Received", (notification.from_id == this.friend.id));

        let activeView = this.router.url;
        console.log("getActive", activeView);
        if (activeView.includes("chat")) {
            if (notification.from_id == this.friend.id) {
                let message: Message = new Message({});
                message.id = notification.id;
                message.to = 'me';
                message.to_id = notification.user_id;
                message.from_id = notification.from_id;
                message.from = this.friend.name;
                message.content = notification.message;
                console.log("Correct", message);
                console.log("Correct messages", this.messages);
                this.messages.push(message);
                this.scrollToBottom();
                this.cdr.detectChanges();
            }
        }
    }


    doSend() {
        if (this.input.length > 0) {
            let message: Message = new Message({});
            message.to = this.friend.username;
            message.from = 'me';
            message.to_id = this.friend.id;
            message.from_id = this.userData._user.id;
            message.content = this.input;
            let formData = {
                type: "user_message",
                name: this.userData._user.name,
                message: this.input,
                from_id: this.userData._user.id,
                to_id: this.friend.id,
                status: "unread",
                target_id: this.friend.id,
                created_at: new Date()
            };
            this.chats.sendMessage(formData);
            this.messages.push(message);
            this.scrollToBottom();
            this.input = '';
        }
    }

    ngOnInit() {
    }

}
