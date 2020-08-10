import {Component, OnInit} from '@angular/core';
import {NavController, ToastController, ModalController, AlertController, LoadingController} from '@ionic/angular';
import {ParamsService} from '../../services/params/params.service';
import {SpinnerDialog} from '@ionic-native/spinner-dialog/ngx';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute} from '@angular/router';
import {ImagesService} from '../../services/images/images.service';
import {ApiService} from '../../services/api/api.service';
import {ImagePicker} from '@ionic-native/image-picker/ngx';
import {FileTransfer, FileUploadOptions, FileTransferObject} from '@ionic-native/file-transfer/ngx';
@Component({
    selector: 'app-images',
    templateUrl: './images.page.html',
    styleUrls: ['./images.page.scss'],
})
export class ImagesPage implements OnInit {
    images: any[] = [];
    icon = "";
    getImagesError = "";
    constructor(public navCtrl: NavController,
        public activatedRoute: ActivatedRoute,
        public imagesServ: ImagesService,
        private transfer: FileTransfer,
        public toastCtrl: ToastController,
        public api: ApiService,
        public modalCtrl: ModalController,
        public alertCtrl: AlertController,
        private spinnerDialog: SpinnerDialog,
        public loadingCtrl: LoadingController,
        public params: ParamsService,
        public translateService: TranslateService,
        private imagePicker: ImagePicker) {
        this.translateService.get('IMAGES.GET_ERROR').subscribe((value) => {
            this.getImagesError = value;
        })
    }

    ngOnInit() {
    }
    showLoader() {
        if (document.URL.startsWith('http')) {
            this.loadingCtrl.create({
                spinner: 'crescent',
                backdropDismiss: true
            }).then(toast => toast.present());
        } else {
            this.spinnerDialog.show();
        }
    }
    async dismissLoader() {
        if (document.URL.startsWith('http')) {
            let topLoader = await this.loadingCtrl.getTop();
            while (topLoader) {
                if (!(await topLoader.dismiss())) {
                    console.log('Could not dismiss the topmost loader. Aborting...');
                    return;
                }
                topLoader = await this.loadingCtrl.getTop();
            }
        } else {
            this.spinnerDialog.hide();
        }
    }
    ionViewDidEnter() {
        this.showLoader();
        let params = this.params.getParams();
        let container = {
            type: params.type,
            trigger_id: params.objectId
        };
        if(params.icon){
            this.icon = params.icon;
        }
        this.images = [];
        this.imagesServ.getFiles(container).subscribe((data: any) => {
            this.dismissLoader();
            console.log("after get addresses");
            let results = data.data;
            for (let one in results) {
                this.images.push(results[one]);
            }
            console.log(JSON.stringify(data));
        }, (err) => {
            this.dismissLoader();
            // Unable to log in
            let toast = this.toastCtrl.create({
                message: this.getImagesError,
                duration: 3000,
                position: 'top'
            }).then(toast => toast.present());
            this.api.handleError(err);
        });
    }
    deleteImage(id) {
        this.showLoader();
        this.imagesServ.deleteFile(id).subscribe((data: any) => {
            this.dismissLoader();
            console.log("after delete image");
            for (let one in this.images) {
                if (this.images[one].id == id) {
                    this.images.splice(parseInt(one), 1);
                }
            }
            console.log(JSON.stringify(data));
        }, (err) => {
            this.dismissLoader();
            // Unable to log in
            let toast = this.toastCtrl.create({
                message: this.getImagesError,
                duration: 3000,
                position: 'top'
            }).then(toast => toast.present());
            this.api.handleError(err);
        });
    }
    done() {
        this.navCtrl.back();
    }
    openImages() {
        let params = this.params.getParams();
        let container = {'type': params.type,'intended_id':params.objectId};

        let options = {
            width: 800,
            height: 800,
            outputType: 0
        };
        this.showLoader();
        this.imagesServ.prepareForUpload(options,container,false).then((value: any) => {
            this.images = this.images.concat(value.files);
            this.dismissLoader();
        });
    }
    setAvatar() {
        let params = this.params.getParams();
        let container = {'type': params.type+"_avatar",'intended_id':params.objectId};

        let options = {
            width: 800,
            height: 800,
            maximumImagesCount: 1,
            outputType: 0
        };
        this.imagesServ.prepareForUpload(options,container,true).then((value: any) => {
            let results = value.files;
            if(results.length > 0){
                this.icon = results[0];
            }
            
            this.dismissLoader();
        });
    }
    prepareForUpload(options,container,avatar) {
        this.showLoader();
        this.imagePicker.getPictures(options).then((results) => {
            
            const fileTransfer: FileTransferObject = this.transfer.create();
            for (var i = 0; i < results.length; i++) {
                console.log('Image URI: ' + results[i]);
                console.log('Image: ',(i+1),results.length );
                let last = false;
                if((i+1)==results.length){
                    last = true;
                }
                this.upload(fileTransfer, results[i], container,last,avatar);
            }
        }, (err) => {});
    }
    upload(fileTransfer, path, params,last:boolean,avatar:boolean) {
        let headers = this.api.buildHeaders(null);
        headers = headers.headers;
        params['filetype'] = path.substr(path.lastIndexOf('.') + 1)
        console.log("Headers", headers.headers);
        let realHeaders = {};
        headers.forEach(function (key, value, map) {
            if (key == "Authorization" || key == "X-Auth-Token") {
                realHeaders[key] = value;
                console.log('key: "' + key + '", value: "' + value + '"');
            }

        });
        console.log("Headers", realHeaders);
        let options: FileUploadOptions = {
            fileKey: 'photo',
            fileName: path.substr(path.lastIndexOf('/') + 1),
            headers: realHeaders,
            params: params
        }
        console.log("upload", path, options);
        fileTransfer.upload(path, this.api.url + '/imagesapi', options)
            .then((data) => {
                let response = JSON.parse(data.response);
                console.log("Success upload", response)
                
                if(avatar){
                    this.icon = response.file.file;
                } else {
                    this.images.push(response.file);
                }
                if(last){
                    this.dismissLoader();
                }
            }, (err) => {
                console.log("Error upload", err)
            })
    }

}
