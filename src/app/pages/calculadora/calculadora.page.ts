import {Component, OnInit, ViewChild, ElementRef} from "@angular/core";
import {Chart} from "chart.js";
import {TranslateService} from '@ngx-translate/core';
import {ParamsService} from '../../services/params/params.service';
import {ModalController, NavController, ToastController, AlertController, LoadingController} from '@ionic/angular';
import {SpinnerDialog} from '@ionic-native/spinner-dialog/ngx';
import {Delivery} from '../../models/delivery';
import {UserDataService} from '../../services/user-data/user-data.service';
import {FoodService} from '../../services/food/food.service';
import {DynamicRouterService} from '../../services/dynamic-router/dynamic-router.service';
import {ConversionPage} from '../conversion/conversion.page';

@Component({
  selector: 'app-calculadora',
  templateUrl: './calculadora.page.html',
  styleUrls: ['./calculadora.page.scss'],
})
export class CalculadoraPage implements OnInit {
    
    @ViewChild("barCanvas1") barCanvas1: ElementRef;
    @ViewChild("barCanvas2") barCanvas2: ElementRef;
    @ViewChild("barCanvas3") barCanvas3: ElementRef;
    @ViewChild("barCanvas4") barCanvas4: ElementRef;
    @ViewChild("barCanvas5") barCanvas5: ElementRef;
    @ViewChild("barCanvas6") barCanvas6: ElementRef;
    @ViewChild("barCanvas4") barCanvas7: ElementRef;
    @ViewChild("barCanvas5") barCanvas8: ElementRef;
    @ViewChild("barCanvas6") barCanvas9: ElementRef;

    private barChart: Chart;
    show1: boolean = true;
    show2: boolean = true;
    show3: boolean = true;
    show4: boolean = true;
    show5: boolean = true;
    show6: boolean = true;
    show7: boolean = true;
    show8: boolean = true;
    show9: boolean = true;
    totals: any[] = [];
    ideals: any[] = [];
    currentItems: any[] = [];
    totalLabels: any[] = [];
    private deliveriesErrorString: string;
    private deliveriesStartingGetString: string;

    loadMore: boolean;
    loading: any;


    constructor(public navCtrl: NavController, public deliveries: FoodService,
        public toastCtrl: ToastController,
        public modalCtrl: ModalController,
        public userData: UserDataService,
        public alertCtrl: AlertController,
        private params: ParamsService,
        private drouter:DynamicRouterService,
        public translateService: TranslateService,
        public loadingCtrl: LoadingController,
        private spinnerDialog: SpinnerDialog) {
        this.translateService.get('DELIVERIES.ERROR_GET').subscribe((value) => {
            this.deliveriesErrorString = value;
        });
        this.translateService.get('DELIVERIES.STARTING_GET').subscribe((value) => {
            this.deliveriesStartingGetString = value;
        });
        this.currentItems = [];
        this.totalLabels = [];
    }

  ngOnInit() {
  }
  /**
     * The view loaded, let's query our items for the list
     */
    /**
       * The view loaded, let's query our items for the list
       */
    ionViewDidEnter() {
        if (this.userData._user){
            this.getItems();
        } else {
            this.showLoader();
        }
        this.getIndicators();
    }
    openConversion() {
        this.navCtrl.pop();
        if (this.userData._user){
            this.navCtrl.navigateForward('tabs/home/conversion');
        } else {
            this.navCtrl.navigateForward('home/conversion');
        }
    }
    async buyLunches() {
        this.navCtrl.pop();
        let addModal = await this.modalCtrl.create({
            component: ConversionPage
        });
        await addModal.present();
        const {data} = await addModal.onDidDismiss();
        if (data == "Checkout") {
            console.log("User: ", this.userData._user);
            if (this.userData._user) {
                this.params.setParams({"merchant_id": 1299});
                this.navCtrl.navigateForward('tabs/home/checkout/shipping/' + 1299);
            } else {
                this.params.setParams({"merchant_id": 1299});
                this.drouter.addPages('tabs/home/checkout/shipping/' + 1299);
                console.log("Pushing login");
                this.navCtrl.navigateForward('login');
            }
        } 
    }
    findLabel(daLabel) {
        for (let item in this.totalLabels) {
            if (this.totalLabels[item] == daLabel) {
                return true
            }
        }
        this.totalLabels.push(daLabel);
    }
    buildChart(title, graphLabels, graphData, canvas) {

        console.log("Title", title);
        console.log("graphLabels", graphLabels);
        console.log("graphData", graphData);
        console.log("canvas", canvas);
        this.barChart = new Chart(canvas.nativeElement, {
            type: "bar",
            data: {
                labels: graphLabels,
                datasets: [
                    {
                        label: title,
                        data: graphData,
                        backgroundColor: [
                            "rgba(255, 99, 132, 0.2)",
                            "rgba(54, 162, 235, 0.2)",
                            "rgba(255, 206, 86, 0.2)",
                            "rgba(75, 192, 192, 0.2)",
                            "rgba(153, 102, 255, 0.2)",
                            "rgba(255, 159, 64, 0.2)"
                        ],
                        borderColor: [
                            "rgba(255,99,132,1)",
                            "rgba(54, 162, 235, 1)",
                            "rgba(255, 206, 86, 1)",
                            "rgba(75, 192, 192, 1)",
                            "rgba(153, 102, 255, 1)",
                            "rgba(255, 159, 64, 1)"
                        ],
                        borderWidth: 1
                    }
                ]
            },
            options: {
                scales: {
                    yAxes: [
                        {
                            ticks: {
                                beginAtZero: true
                            }
                        }
                    ]
                }
            }
        });
        let totals = 0;
        for (let item in graphData) {
            totals += graphData[item];
        }
        let container = {"title": title, "totals": totals};
        this.totals.push(container);
    }

    changeType() {
        console.log('Change type');
        this.currentItems = [];
        this.getItems();
        
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
    /**
     * Navigate to the detail page for this item.
     */
    getItems() {
        let today = new Date();
        let todayString = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate() + " 23:59:59";
        let startDate = new Date(todayString);
        startDate.setDate(startDate.getDate() - 30);
        let stringStartDate = startDate.getFullYear() + "-" + (startDate.getMonth() + 1) + "-" + startDate.getDate() + " 00:00:00";
        this.showLoader();
        let where = `delivery>${stringStartDate}&delivery<${todayString}&order_by=delivery,asc&status=completed&limit=100`;

        this.deliveries.getDeliveries(where).subscribe((data: any) => {
            this.dismissLoader();
            console.log("after get Deliveries");
            this.splitResults(data.data);
            //this.buildChart();
        }, (err) => {
            this.dismissLoader();
            // Unable to log in
            let toast = this.toastCtrl.create({
                message: this.deliveriesErrorString,
                duration: 3000,
                position: 'top'
            }).then(toast => toast.present());
        });
    }
    getIndicators() {
        this.deliveries.getIndicators().subscribe((data: any) => {
            this.dismissLoader();
            if(data.status == "success"){
                this.ideals = data.results;
            }
            //this.buildChart();
        }, (err) => {
            this.dismissLoader();
            // Unable to log in
            let toast = this.toastCtrl.create({
                message: this.deliveriesErrorString,
                duration: 3000,
                position: 'top'
            }).then(toast => toast.present());
        });
    }
    splitResults(results: any) {
        const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun",
            "Jul", "Ago", "Sept", "Oct", "Nov", "Dic"
        ];
        let week1 = [];
        let week2 = [];
        let week3 = [];
        let week4 = [];
        let today = new Date();
        let dayT = new Date();
        dayT.setDate(dayT.getDate() - 30);
        let l1 = new Date();
        l1.setDate(l1.getDate() - 22);
        let l2 = new Date();
        l2.setDate(l2.getDate() - 15);
        let l3 = new Date();
        l3.setDate(l3.getDate() - 7);
        let dataSets = [];
        for (let item in results) {
            let container = results[item];
            container.delivery = container.delivery.replace(/-/g, '/');
            container.delivery = new Date(container.delivery);
            let delivery = new Delivery(container);
            if (container.delivery < l1) {
                week1.push(delivery);
            } else if (container.delivery >= l1 && container.delivery < l2) {
                week2.push(delivery);
            } else if (container.delivery >= l2 && container.delivery < l3) {
                week3.push(delivery);
            } else if (container.delivery > l3) {
                week4.push(delivery);
            }
        }
        if (week1.length > 0) {
            dataSets.push(this.processData(meses[dayT.getMonth()]+" "+dayT.getDate()+ " a "+meses[l1.getMonth()]+" "+l1.getDate(), week1));
        }
        if (week2.length > 0) {
            dataSets.push(this.processData(meses[l1.getMonth()]+" "+l1.getDate()+ " a "+meses[l2.getMonth()]+" "+l2.getDate(), week2));
        }
        if (week3.length > 0) {
            dataSets.push(this.processData(meses[l2.getMonth()]+" "+l2.getDate()+ " a "+meses[l3.getMonth()]+" "+l3.getDate(), week3));
        }
        if (week4.length > 0) {
            dataSets.push(this.processData(meses[l3.getMonth()]+" "+l3.getDate()+ " a "+meses[today.getMonth()]+" "+today.getDate(), week4));
        }
        let counter = 0;
        for (let item in this.totalLabels) {
            counter++;
            let labels = [];
            let datapoints = [];
            let title = this.totalLabels[item];
            for (let dat in dataSets) {
                labels.push(dataSets[dat].title);
                if(dataSets[dat][title]){
                    datapoints.push(dataSets[dat][title])
                } else {
                    datapoints.push(0);
                }
            }
            this.buildChart(title, labels, datapoints, this["barCanvas" + counter]);
        }
        let sets = this.totalLabels.length;
        for (let i = 9; i > sets; i--) {
            this["show" + i] = false;
        }
    }

    processData(title: any, results: any) {
        let pesosL = {"title": title};
        for (let one in results) {
            let delivery = results[one];
            let pesosG = delivery.details.pesos;
            for (let item in pesosG) {
                let found = false;
                this.findLabel(pesosG[item].name);
                if (pesosL[pesosG[item].name]) {
                    found = true;
                    pesosL[pesosG[item].name] += pesosG[item].value;
                }
                if (!found) {
                    pesosL[pesosG[item].name] = pesosG[item].value;
                }
            }
            this.currentItems.push(delivery);
        }
        return pesosL;
    }
}
