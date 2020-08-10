import {Injectable} from '@angular/core';
import {ApiService} from '../api/api.service';
import {ImagePicker} from '@ionic-native/image-picker/ngx';
import {FileTransfer, FileUploadOptions, FileTransferObject} from '@ionic-native/file-transfer/ngx';
@Injectable({
    providedIn: 'root'
})
export class ImagesService {

    constructor(public api: ApiService,
        private transfer: FileTransfer,
        private imagePicker: ImagePicker) {}
    getFiles(data: any) {
        let endpoint = '/imagesapi';
        let seq = this.api.get(endpoint, data);
        return seq;
    }
    deleteFile(data: any) {
        let endpoint = '/imagesapi/' + data;
        let seq = this.api.delete(endpoint, data);
        return seq;
    }
    prepareForUpload(options, container, avatar) {
        return new Promise((resolve, reject) => {
            this.imagePicker.getPictures(options).then((results) => {
                const fileTransfer: FileTransferObject = this.transfer.create();
                let images:any[] = [];
                for (var i = 0; i < results.length; i++) {
                    console.log('Image URI: ' + results[i]);
                    console.log('Image: ', (i + 1), results.length);
                    let last = false;
                    if ((i + 1) == results.length) {
                        last = true;
                    }
                    this.upload(fileTransfer, results[i], container, last, avatar).then((value: any) => {
                        console.log("After upload result", value);
                        images.push(value.file);
                        if(value.last){
                            resolve({images:images,last:true})
                        }
                        
                    });
                }
            }, (err) => {});
        });
    }

    upload(fileTransfer, path, params, last: boolean, avatar: boolean) {
        return new Promise((resolve, reject) => {
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
                    if (avatar) {
                        resolve({file: response.file.file, last: last});
                    } else {
                        resolve({file: response.file, last: last});
                    }
                }, (err) => {
                    console.log("Error upload", err);
                    reject(err);
                })
        });
    }
}
