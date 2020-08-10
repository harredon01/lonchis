import {Injectable} from '@angular/core';
import {ApiService} from '../api/api.service';
import {Storage} from '@ionic/storage';
import {DatabaseService} from '../../services/database/database.service';
@Injectable({
    providedIn: 'root'
})
export class LocationsService {
    constructor(private api: ApiService, private database: DatabaseService, private storage: Storage) {}

    getSharedLocationsExternal(page: any) {
        return new Promise((resolve, reject) => {
            this.getLastLocationId().then((resp) => {
                if (resp) {
                    this.getSharedLocations(page, resp).subscribe((data) => {
                        resolve(data);
                    }, (err) => {
                    this.api.handleError(err);
                        console.log("getSharedLocation Error", err);
                    });
                } else {
                    this.getSharedLocations(page, "0").subscribe((data) => {
                        resolve(data);
                    }, (err) => {
                    this.api.handleError(err);
                        console.log("getSharedLocation Error", err);
                    });
                }

            }, (err) => {
                this.getSharedLocations(page, "0").subscribe((data) => {
                    resolve(data);
                }, (err) => {
                this.api.handleError(err);
                    console.log("getSharedLocation Error", err);
                });
            });
        });

    }
    getSharedLocations(page: any, id_after: any) {
        let url = "/locations";
        if (page) {
            url = url + "?page=" + page + "&id_after=" + id_after;
        }
        let seq = this.api.get(url);
        return seq;
    }
    getActivePolygons(merchantId: any) {
        let url = "/coverage?merchant_id=" + merchantId;
        let seq = this.api.get(url);
        return seq;
    }
    getCountries() {
        let url = "/countries?limit=100&order_by=id,asc";
        let seq = this.api.get(url);
        return seq;
    }
    getRegionsCountry(countryId: any) {
        let url = "/regions?limit=100&order_by=name,asc&country_id=" + countryId;
        let seq = this.api.get(url);
        return seq;
    }
    getCitiesRegion(regionId: any) {
        let url = "/cities?limit=100&order_by=name,asc&region_id=" + regionId;
        let seq = this.api.get(url);
        return seq;
    }
    getReportsMerchantsLocations(latit: any, longit: any, radius: any) {
        let endpoint = "/merchants/nearby_all";
        let data = {lat: latit, long: longit, radius: radius};
        let seq = this.api.get(endpoint, data);
        return seq;
    }
    getTrip(user_id: any, trip: any) {
        console.log("Get trip set");
        console.log(user_id);
        console.log(trip);
        let page = 1;
        console.log(page);
        this.getTripSet(user_id, trip, page);
    }

    getTripSet(user_id: any, trip: any, page: any) {
        let url = "/historic_locations?target_id=" + user_id + "&trip_id=" + trip;
        if (page) {
            url = url + "&page=" + page;
        }
        let seq = this.api.get(url);

        seq.subscribe((data: any) => {
            console.log("after get locations");
            console.log(JSON.stringify(data));
            if (data['last_page'] > page) {
                page++;
                this.getTripSet(user_id, trip, page);
            }
            this.saveLocations(data['data']);
            return data;

            // If the API returned a successful response, mark the user as logged in
        }, err => {
            console.error('ERROR', err);
            this.api.handleError(err);
        });
        return seq;
    }

    saveLocations(locations: any) {
        let lastLocation = 0;
        for (let item in locations) {
            lastLocation = locations[item].id;
            this.process(locations[item]);
        }
        this.setLastLocationId(lastLocation + "");
    }
    process(location: any) {

        let query = "SELECT * FROM locations where id = ? ";
        let params = [location.id];
        this.database.executeSql(query, params)
            .then((res: any) => {
                if (res.rows.length == 0) {
                    let query = "INSERT INTO locations (id, trip, phone, speed, activity, battery, lat, long, name, type, user_id, is_final, report_time ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)";
                    let params = [location.id, location.trip, location.phone, location.speed, location.activity, location.battery, location.lat, location.long, location.name, location.type, location.user_id, location.is_final, location.report_time];
                    this.database.executeSql(query, params)
                        .then((res: any) => {
                            console.log("Location saved");
                        }, (err) => console.error(err));

                }

            }, (err) => console.error(err));
    }

    getLastLocationId(): Promise<string> {
        return this.storage.get('lastLocationId').then((value) => {
            return value;
        });
    }
    /**
     * Saves username in local storage.
     */
    setLastLocationId(locationId: string): Promise<any> {
        return this.storage.set('lastLocationId', locationId);
    }
}
