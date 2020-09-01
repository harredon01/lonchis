import {Component, OnInit} from '@angular/core';
import {NavController, ModalController, AlertController} from '@ionic/angular';
import {ParamsService} from '../../services/params/params.service';
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
    constructor(public navCtrl: NavController,
        public activatedRoute: ActivatedRoute,
        public imagesServ: ImagesService,
        private transfer: FileTransfer,
        public api: ApiService,
        public modalCtrl: ModalController,
        public alertCtrl: AlertController,
        public params: ParamsService,
        private imagePicker: ImagePicker) {
    }

    ngOnInit() {
    }
    ionViewDidEnter() {
        this.api.loader();
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
            this.api.dismissLoader();
            console.log("after get addresses");
            let results = data.data;
            for (let one in results) {
                this.images.push(results[one]);
            }
            console.log(JSON.stringify(data));
        }, (err) => {
            this.api.dismissLoader();
            // Unable to log in
            this.api.toast('IMAGES.GET_ERROR');
            this.api.handleError(err);
        });
    }
    deleteImage(id) {
        this.api.loader();
        this.imagesServ.deleteFile(id).subscribe((data: any) => {
            this.api.dismissLoader();
            console.log("after delete image");
            for (let one in this.images) {
                if (this.images[one].id == id) {
                    this.images.splice(parseInt(one), 1);
                }
            }
            console.log(JSON.stringify(data));
        }, (err) => {
            this.api.dismissLoader();
            // Unable to log in
            this.api.toast('IMAGES.GET_ERROR');
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
        this.api.loader();
        this.imagesServ.prepareForUpload(options,container,false).then((value: any) => {
            this.images = this.images.concat(value.files);
            this.api.dismissLoader();
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
            
            this.api.dismissLoader();
        });
    }
    prepareForUpload(options,container,avatar) {
        this.api.loader();
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
                    this.api.dismissLoader();
                }
            }, (err) => {
                console.log("Error upload", err)
            })
    }

}
