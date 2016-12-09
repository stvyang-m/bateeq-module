// 'use strict'
// var DLModels = require('bateeq-models');
// var map = DLModels.map;
// var ObjectId = require('mongodb').ObjectId;
// var sqlConnect = require('./sqlConnect');
// var BaseManager = require('module-toolkit').BaseManager;
// var MongoClient = require('mongodb').MongoClient,
//     test = require('assert');



// module.exports = class SalesDataEtl extends BaseManager {
//     constructor(db, user) {
//         super(db, user);
//         this.collection = this.db.use(map.sales.SalesDoc);
//         this.collection = this.db.use(map.sales.SalesDoc);
//         this.collectionItem = this.db.use(map.sales.Item);
//         this.collectionBank = this.db.use(map.master.Bank);
//         this.collectionStore = this.db.use(map.master.Store);
//         this.collectionCardType = this.db.use(map.master.CardType);
//         // this.adas=1;
//     }


//     getNewDataSales() {
//         return new Promise(function (resolve, reject) {
//             sqlConnect.getConnect()
//                 .then((connect) => {
//                     var request = connect;
//                     var query = "select * from (select ROW_NUMBER() OVER(ORDER BY branch, nomor) AS number,branch,nomor,tanggal,shift,pos,kartu,no_krt,payment,sum(qty)as totalProduct, max(TOTAL) as subTotal,max(TOTAL) as grandTotal,0 as discount,'' as reference , max(voucher) as voucher, max(cash) as cash, max(debit) as debit,max(credit) as credit from penjualan group by branch,nomor,tanggal,shift,pos,kartu,no_krt,payment)a WHERE branch= 'SLO.02'";
//                     request.query(query, function (err, sales) {
//                         resolve(sales);
//                     });
//                 });
//         });
//     }


//     getDataSales() {

//         return new Promise((resolve, reject) => {

//             this.collection.find({}).toArray(function (err, sales) {

//                 resolve(sales)

//             });
//         });
//     }

//     getBanks() {
//         return new Promise((resolve, reject) => {
//             this.collectionBank.find({ "code": "BA-" + kartu }).toArray(function (err, Banks) {
//                 resolve(Banks[0]);
//             });

//         });
//     }


//     getCards(CardType) {
//         return new Promise((resolve, reject) => {

//             this.collectionCardType.find({ "name": CardType }).toArray(function (err, card) {

//                 resolve(card[0]);
//             });

//         });
//     }


//     migrateDataStores() {
//         return new Promise((resolve, reject) => {

//             var getNewDataSales = this.getDataStores();
//             var getDataSales = this.getDataSales();
//              var getStore,getItems,getBanks;

//             Promise.all([getNewDataSales, getDataSales, getStore]).then(result => {

//                 var tasks = [];
//                 for (var item of result[0]) {

//                      getStore = getStore(item.branch);

//                      getItems = getItems(item.branch, item.nomor);

//                      getBanks = this.getBanks;


//                     var CardType = "";

//                     if ((item.no_krt[0] == 5) && ((item.no_krt[1] == 1) || (item.no_krt[1] == 2) || (item.no_krt[1] == 3) || (item.no_krt[1] == 4) || (item.no_krt[1] == 5))) {

//                         CardType = "Mastercard";
//                     } else if ((item.no_krt[0] == 2) && ((item.no_krt[1] == 2) || (item.no_krt[1] == 3) || (item.no_krt[1] == 4) || (item.no_krt[1] == 5) || (item.no_krt[1] == 6) || (item.no_krt[1] == 7))) {
//                         CardType = "Mastercard";

//                     } else if (item.no_krt[0] == 4) {
//                         CardType = "Visa";

//                     } else {
//                         CardType = "";
//                     };

//                     var getcards = this.getCards();

//                     var paymentType = "Cash";

//                     if ((item.payment.trim() == "DEBIT CARD") || (item.payment.trim() == "CREDIT CARD")) {
//                         paymentType = "Card";
//                     }
//                     else if ((item.payment.trim() == "PARTIAL DEBIT CARD") || (item.payment.trim() == "PARTIAL CREDIT CARD")) {
//                         paymentType = "Partial";
//                     } else {
//                         paymentType = "Cash";
//                     };

//                     var cardTemp = "";

//                     if ((item.payment.trim() == "DEBIT CARD") || (item.payment.trim() == "PARTIAL DEBIT CARD")) {
//                         cardTemp = "Debit";
//                     } else if ((item.payment.trim() == "CREDIT CARD") || (item.payment.trim() == "PARTIAL CREDIT CARD")) {
//                         cardTemp = "Credit";
//                     } else {
//                         cardTemp = "";
//                     };

//                     var _id = new ObjectId();
//                     var _idStorage = new ObjectId();
//                     var _stamp = new ObjectId();
//                     var _stampStorage = new ObjectId();

//                     var openedDate = "";
//                     if (item.tanggal_buka == null) {
//                         openedDate = "";
//                     } else {
//                         openedDate = item.tanggal_buka;
//                     };

//                     var closedDate = "";
//                     if (item.tanggal_tutup == null) {
//                         closedDate = "";

//                     } else {
//                         closedDate = item.tanggal_tutup;
//                     };

//                     var status = "";
//                     if (item.status == null) {
//                         status = "";
//                     } else {
//                         status = item.status;
//                     };

//                     var isfound = false;
//                     for (var item2 of result[1]) {

//                         if (item.Kd_Cbg == item2.code) {
//                             //update;
//                             isfound = true;

//                             var update =
//                                 {
//                                     "_id": item2._id,
//                                     "_stamp": item2._stamp,
//                                     "_type": "sales-doc",
//                                     "_version": "1.0.0",
//                                     "_active": true,
//                                     "_deleted": false,
//                                     "_createdBy": "router",
//                                     "_createdDate": item2._createdDate,
//                                     "_createAgent": "manager",
//                                     "_updatedBy": "router",
//                                     "_updatedDate": new Date(),
//                                     "_updateAgent": "manager",
//                                     "code": item.nomor,
//                                     // "date": s[i].tanggal,
//                                     "date": item.tanggal,
//                                     "totalProduct": item.totalProduct,
//                                     "subTotal": item.subTotal,
//                                     "discount": item.discount,
//                                     "grandTotal": item.grandTotal,
//                                     "reference": item.reference,
//                                     // "shift": s[i].shift,
//                                     "shift": item.shift,
//                                     "pos": item.pos,
//                                     "storeId": result[2]._id,
//                                     "store": result[2],
//                                     "items": result[1],

//                                     "salesDetails":
//                                     {
//                                         "_stamp": new ObjectId(),
//                                         "paymentType": paymentType, //object card berdasarkan penjualan.kartu
//                                         "voucherId": {},
//                                         "voucher": penjualan.voucher,
//                                         "bankId": (result[2]) ? result[2]._id : '', //query penjualan.kartu
//                                         "bank": (result[2]) ? result[2] : '',
//                                         "cardTypeId": (result[3]) ? result[3]._id : '',
//                                         "cardType": (result[3]) ? result[3] : '',
//                                         "bankCardId": "",
//                                         "bankCard": {},
//                                         "card": cardTemp,
//                                         "cardNumber": penjualan.no_krt,
//                                         "cardName": "",
//                                         "cashAmount": penjualan.cash,
//                                         "cardAmount": penjualan.debit + penjualan.credit,

//                                     },

//                                     "remark": "",
//                                     "isVoid": false,
//                                 }


//                             tasks.push(this.collection.update({ _id: item2._id }, update, { ordered: false }));

//                             break;
//                         }

//                     }

//                     if (!isfound) {

//                         var insert =
//                             {
//                                 "_id": _id,
//                                 "_stamp": _stamp,
//                                 "_type": "store",
//                                 "_version": "1.0.0",
//                                 "_active": true,
//                                 "_deleted": false,
//                                 "_createdBy": "router",
//                                 "_createdDate": new Date(),
//                                 "_createAgent": "manager",
//                                 "_updatedBy": "router",
//                                 "_updatedDate": new Date(),
//                                 "_updateAgent": "manager",
//                                 "code": item.Kd_Cbg,
//                                 "name": item.Nm_Cbg,
//                                 "description": "",
//                                 "salesTarget": item.target_omset_bulan,
//                                 "storageId": _idStorage,

//                                 "storage": {
//                                     "_id": _idStorage,
//                                     "_stamp": _stampStorage,
//                                     "_type": "storage",
//                                     "_version": "1.0.0",
//                                     "_active": true,
//                                     "_deleted": false,
//                                     "_createdBy": "router",
//                                     "_createdDate": new Date(),
//                                     "_createAgent": "manager",
//                                     "_updatedBy": "router",
//                                     "_updatedDate": new Date(),
//                                     "_updateAgent": "manager",
//                                     "code": item.Kd_Cbg,
//                                     "name": item.Nm_Cbg,
//                                     "description": "",
//                                     "address": [(item.Alm_Cbg || '').trim().toString(), (item.Kota_Cbg || '').trim().toString()].filter(r => r && r.toString().trim().length > 0).join(" - "),
//                                     "phone": [(item.Kontak || '').trim().toString(), (item.Telp || '').trim().toString()].filter(r => r && r.toString().trim().length > 0).join(" - "),
//                                 },

//                                 "salesCategoryId": {},
//                                 "salesCategory": item.jenis_penjualan,
//                                 "shift": shift,
//                                 "city": item.Kota_Cbg,
//                                 "pic": item.Kontak,
//                                 "fax": item.FAX,
//                                 "openedDate": openedDate,
//                                 "closedDate": closedDate,
//                                 "storeArea": item.keterangan,
//                                 "storeWIde": item.luas_toko,
//                                 "online-offline": item.online_offline,
//                                 "storeCategory": item.jenis_toko,
//                                 "monthlyTotalCost": item.total_cost_bulanan,
//                                 "monthlyOmsetTarget": item.target_omset_bulan,
//                                 "status": status,
//                                 "address": [(item.Alm_Cbg || '').trim().toString(), (item.Kota_Cbg || '').trim().toString()].filter(r => r && r.toString().trim().length > 0).join(" - "),
//                                 "phone": [(item.Kontak || '').trim().toString(), (item.Telp || '').trim().toString()].filter(r => r && r.toString().trim().length > 0).join(" - "),
//                                 "salesCapital": 0
//                             }
//                         // insertArr.push(insert)

//                         tasks.push(this.collection.insert(insert, { ordered: false }));
//                     }

//                 }

//                 // return (tasks);
//                 Promise.all(tasks)
//                     .then((result) => {
//                         resolve(tasks);

//                     })

//                     .catch((e) => {
//                         done();
//                     })

//             });
//         });
//     }

//     getStore(sales) {
//         return new Promise((resolve, reject) => {

//             for (var i=0;i<sales.length;i++){
//                       this.collectionStore.find({ "code": sales[i].branch }).toArray(function (err, store) {
//                     resolve(store[0]);
//             });
//             }
       
      

//         });
//     }






// }