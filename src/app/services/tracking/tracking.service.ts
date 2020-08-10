import {Injectable} from '@angular/core';
import {Events} from '../events/events.service';
//import BackgroundGeolocation, {
//    State,
//    Config,
//    Location,
//    LocationError,
//    Geofence,
//    HttpEvent,
//    MotionActivityEvent,
//    ProviderChangeEvent,
//    MotionChangeEvent,
//    GeofenceEvent,
//    GeofencesChangeEvent,
//    HeartbeatEvent,
//    ConnectivityChangeEvent
//} from "cordova-background-geolocation-lt";
import {UserDataService} from '../user-data/user-data.service';
import {ApiService} from '../api/api.service';
@Injectable({
    providedIn: 'root'
})
export class TrackingService {
    isReady: boolean = false;
    constructor(public userData: UserDataService,
        public api: ApiService,
        public events: Events) {}
    // Like any Cordova plugin, you must wait for Platform.ready() before referencing the plugin.
    configureBackgroundGeolocation() {
        // 1.  Listen to events.
//        BackgroundGeolocation.onLocation(location => {
//            console.log('[location] - ', location);
//            this.events.publish('location:onLocation', location);
//        });
//
//        BackgroundGeolocation.onMotionChange(event => {
//            console.log('[motionchange] - ', event.isMoving, event.location);
//            this.events.publish('location:onMotionChange', event.isMoving);
//        });
//
//        BackgroundGeolocation.onHttp(response => {
//            console.log('[http] - ', response.success, response.status, response.responseText);
//        });
//
//        BackgroundGeolocation.onProviderChange(event => {
//            console.log('[providerchange] - ', event.enabled, event.status, event.gps);
//        });
//        BackgroundGeolocation.onPowerSaveChange((isPowerSaveMode) => {
//            console.log('[onPowerSaveChange: ', isPowerSaveMode);
//            this.events.publish('location:onPowerSaveChange', isPowerSaveMode);
//        });
//        BackgroundGeolocation.onGeofence(geofence => {
//            console.log('[geofence] ', geofence.identifier, geofence.action);
//            this.events.publish('location:onGeofence', {geofence:geofence});
//        });
        // 2.  Configure the plugin with #ready
        this.callReady(false);
    }
    callReady(start) {
        this.userData.getToken().then((value) => {
            console.log("getToken");
            console.log(value);
            if (value) {
//                BackgroundGeolocation.ready({
//                    reset: true,
//                    debug: true,
//                    headers: {
//                        "Authorization": "Bearer " + value
//                    },
//                    logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
//                    desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
//                    distanceFilter: 10,
//                    url: 'https://dev.lonchis.com.co/api/locations/user',
//                    autoSync: true,
//                    stopOnTerminate: false,
//                    startOnBoot: true
//                }, (state) => {
//                    if (!state.enabled && start) {
//                        // 3.  Start tracking.
//                        BackgroundGeolocation.start();
//                    }
//                    this.isReady = true;
//                    console.log('[ready] BackgroundGeolocation is ready to use');
//                });
            }
        });
    }
    startTracking() {
        if (this.isReady) {
//            BackgroundGeolocation.start(function () {
//                console.log("- Start success");
//            });
        } else {
            this.callReady(true);
        }
    }
    stopTracking() {
//        BackgroundGeolocation.stop(function () {
//                console.log("- Stop success");
//            });
    }
    removeGeofences() {
//        BackgroundGeolocation.removeGeofences();
    }
    createGeofence(latitude: any, longitude: any, objectId: any) {
//        BackgroundGeolocation.addGeofence({
//            identifier: objectId,
//            radius: 200,
//            latitude: latitude,
//            longitude: longitude,
//            notifyOnEntry: true,
//            notifyOnExit: true,
//            extras: {
//                stop_id: objectId
//            }
//        }).then((success) => {
//            console.log('[addGeofence] success');
//        }).catch((error) => {
//            console.log('[addGeofence] FAILURE: ', error);
//        });
    }
}
