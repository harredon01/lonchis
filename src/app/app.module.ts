import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouteReuseStrategy} from '@angular/router';
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {IonicModule, IonicRouteStrategy} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';
import {Geolocation} from '@ionic-native/geolocation/ngx';
import {Contacts } from '@ionic-native/contacts/ngx';
import {FileTransfer} from '@ionic-native/file-transfer/ngx';
import {SecureStorageEcho} from '@ionic-native/secure-storage-echo/ngx';
import {GooglePlus} from '@ionic-native/google-plus/ngx';
import {Facebook} from '@ionic-native/facebook/ngx';
import {HttpClientModule, HttpClient} from '@angular/common/http';
import {SignInWithApple } from '@ionic-native/sign-in-with-apple/ngx';
import { SQLite } from '@ionic-native/sqlite/ngx';
import { UniqueDeviceID } from '@ionic-native/unique-device-id/ngx';
import {OneSignal} from '@ionic-native/onesignal/ngx';
//import { Zoom } from '@ionic-native/zoom';
import { ImagePicker } from '@ionic-native/image-picker/ngx';
import {IonicStorageModule} from '@ionic/storage';
import {InAppBrowser} from '@ionic-native/in-app-browser/ngx';
import {AppComponent} from './app.component';
import {SpinnerDialog} from '@ionic-native/spinner-dialog/ngx';
import {AppRoutingModule} from './app-routing.module';
import {CartPageModule} from './pages/cart/cart.module'
import {CommentsPageModule} from './pages/comments/comments.module'
import {BookingDetailPageModule} from './pages/booking-detail/booking-detail.module'
import {ForgotPassPageModule} from './pages/forgot-pass/forgot-pass.module'
import {ConversionPageModule} from './pages/conversion/conversion.module'
import {AddressCreatePageModule} from './pages/address-create/address-create.module'
import {AddressesPageModule} from './pages/addresses/addresses.module'
import {AvailabilityCreatePageModule} from './pages/availability-create/availability-create.module'
export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}
@NgModule({
    declarations: [AppComponent],
    entryComponents: [],
    imports: [BrowserModule,
        HttpClientModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        }),
        IonicModule.forRoot(),
        IonicStorageModule.forRoot(),
        AppRoutingModule,
        CartPageModule,
        AddressCreatePageModule,
        AddressesPageModule,
        ConversionPageModule,
        ForgotPassPageModule,
        BookingDetailPageModule,
        CommentsPageModule,
        AvailabilityCreatePageModule],
    providers: [
        StatusBar,
        SplashScreen,
        Contacts,
        FileTransfer,
        SpinnerDialog,
        Geolocation,
        SecureStorageEcho,
        SignInWithApple,
        GooglePlus,
        UniqueDeviceID,
        Facebook,
        OneSignal,
//        Zoom,
        ImagePicker,
        SQLite,
        InAppBrowser,
        {provide: RouteReuseStrategy, useClass: IonicRouteStrategy}
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
