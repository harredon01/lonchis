import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { BehaviorSubject } from 'rxjs';
import {Platform} from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  private database: SQLiteObject;
    //initially set dbReady status to false
    private dbReady = new BehaviorSubject<boolean>(false);

    constructor(private platform: Platform, private sqlite: SQLite) {
        this.platform.ready().then(() => {
                    
if (!document.URL.startsWith('http')) {
            this.sqlite.create({
                name: 'food.db',
                location: 'default'
            })
                .then((db: SQLiteObject) => {
                    this.database = db;

                    this.createTables().then(() => {
                        //we loaded or created tables, so, set dbReady to true
                        this.dbReady.next(true);
                    });
                }).catch((error: any) => {
                console.log(error);
            });
}
        });
    }

    private createTables() {
        return this.database.executeSql(
            `CREATE TABLE IF NOT EXISTS locations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lat REAL,
        long REAL,
        status TEXT,
        name TEXT,
        islast INTEGER,
        trip TEXT,
        user_id INTEGER,
        speed TEXT,
        activity TEXT,
        battery TEXT,
        accuracy TEXT,
        report_time TEXT,
        phone TEXT,
        type TEXT,
        altitude TEXT,
        is_moving TEXT,
        is_final INTEGER
      );`
            , <any> {})
            .then(() => {
                return this.database.executeSql(
                    `CREATE TABLE IF NOT EXISTS messages 
                      (id integer primary key, 
                      type text,
                      name text,
                      message text, 
                      from_id integer, 
                      to_id integer,
                      target_id integer, 
                      status text, 
                      created_at datetime);`, <any> {}).then(() => {
                          this.database.executeSql(
                            `CREATE TABLE IF NOT EXISTS friends 
                            (id integer primary key, 
                            email text, 
                            user_id integer);`, <any> {})
                        return this.database.executeSql(
                            `CREATE TABLE IF NOT EXISTS payers 
                            (id integer primary key, 
                            order_id integer, 
                            email text, 
                            user_id integer);`, <any> {})
                          }).catch((err) => console.log("error detected creating tables", err));
            }).catch((err) => console.log("error detected creating tables", err));

    }


    private isReady() {
        return new Promise((resolve, reject) => {
            //if dbReady is true, resolve
            if (this.dbReady.getValue()) {
                resolve();
            }
            //otherwise, wait to resolve until dbReady returns true
            else {
                this.dbReady.subscribe((ready) => {
                    if (ready) {
                        resolve();
                    }
                });
            }
        })
    }


    executeSql(query: string, params: any[]) {
        return new Promise((resolve, reject) => {
            this.isReady()
                .then(() => {
                    return this.database.executeSql(query,
                        //cast booleans to binary numbers        
                        params).then((data) => {
                            console.log(query);
                            console.log(params)

                            let lists = [];
                            if (data.rows) {
                                for (let i = 0; i < data.rows.length; i++) {
                                    lists.push(data.rows.item(i));
                                }
                            }
                            console.log("Result: ", data);
                            resolve(lists);
                        }, (err) => console.error(err));
                });
        })


    }
}
