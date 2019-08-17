/*eslint-env es6*/
/*global firebase, moment, _, exportFromJSON*/

sap.ui.define(["sap/ui/base/Object", "sap/m/MessageBox", "sap/m/MessageToast"],
	function (UI5Object, MessageBox, MessageToast) {
		"use strict";

		return UI5Object.extend("com.digiArtitus.controller.Orders", {

			constructor: function (oInstance) {
				this._oInstance = oInstance;
				this._oView = oInstance.getView();
				this.oViewModel = this._oView.getModel("oViewModel");
			},

			liveOrders: function () {
				firebase
					.firestore()
					.collection("DATABASE")
					.doc(com.digiArtitus.companyCode)
					.collection("ORDERS")
					.onSnapshot(function (querySnapshot) {

						var oViewData = this.oViewModel.getData();
						var aData = [];

						querySnapshot.forEach(function (doc) {
							var oDate;
							if (typeof doc.data().TIME_STAMP === "number") {
								oDate = new Date(doc.data().TIME_STAMP);
							} else {
								oDate = doc.data().TIME_STAMP.toDate();
							}
							aData.push({
								"DOC_REF": doc.ref,
								"USER_ID": doc.data().USER_ID,
								"USER_COMPANY_CODE": doc.data().USER_COMPANY_CODE,
								"TIME_STAMP": oDate,
								"TIME_AGO": moment(oDate).fromNow(),
								"MOMENT_TIME_STAMP": moment(oDate),
								"ORDER_ID": doc.data().ORDER_ID,
								"ORDER_TYPE": doc.data().ORDER_TYPE,
								"ORDER_STATUS": doc.data().ORDER_STATUS,
								"TOTAL_PRICE": parseFloat(doc.data().TOTAL_PRICE).toFixed(2),
								"TOTAL_PAYABLE": parseFloat(doc.data().TOTAL_PAYABLE),
								"DELIVERY_CHARGE": doc.data().DELIVERY_CHARGE,
								"CUSTOMER": doc.data().CUSTOMER,
								"ITEMS": doc.data().ITEMS
							});
						});

						// sort by timestamp
						aData = _.orderBy(aData, function (oData) {
							return oData.MOMENT_TIME_STAMP;
						}, ["desc"]);

						oViewData.ORDERS = aData;

						// for dashboard
						var startOfToday = moment().startOf("day");
						var endOfToday = moment().endOf("day");

						// filter todays objects
						var filteredTodayObjects = _.filter(aData,
							function (each) {
								return each.MOMENT_TIME_STAMP
									.isBetween(startOfToday, endOfToday);
							});

						// get all category
						var oTotalMenuItems = _.flatMap(filteredTodayObjects, item =>
							_(item.ITEMS)
							.map(subItems => ({
								"NAME": subItems.MENU,
								"QUANTITY": parseInt(subItems.QUANTITY, 10)
							}))
							.value()
						);

						// calculate total category count and sort by count
						var aMenuCount = _(oTotalMenuItems)
							.groupBy("NAME")
							.map((item, id) => ({
								"MENU": id,
								"COUNT": _.sumBy(item, "QUANTITY")
							}))
							.value();
						aMenuCount = _.orderBy(aMenuCount, ["COUNT"], ["desc"]);
						oViewData.MENU_COUNT = aMenuCount;

						// calculate total price for today
						var dTodayTotalPrice = _.sumBy(filteredTodayObjects, "TOTAL_PAYABLE");
						oViewData.TODAY_TOTAL_PRICE = dTodayTotalPrice;

						// last week objects
						var aDynamicFilteredObjects = [];
						var aDynamicFilterObjectsTotal = [];
						var aChartData = [];
						var dynamicStartDay = null;
						var dynamicEndDay = null;
						for (var i = 1; i < 8; i++) {
							dynamicStartDay = moment().startOf("day").subtract(i, "day");
							dynamicEndDay = moment().endOf("day").subtract(i, "day");

							aDynamicFilteredObjects = _.filter(aData, function (each) {
								return each.MOMENT_TIME_STAMP
									.isBetween(dynamicStartDay, dynamicEndDay);
							});

							aDynamicFilterObjectsTotal = _.sumBy(aDynamicFilteredObjects, "TOTAL_PAYABLE");

							aChartData.push({
								"Day": dynamicStartDay.format("ddd"),
								"Revenue": aDynamicFilterObjectsTotal
							});
						}

						// total revenue last day
						var iTotalRevenueLastDay = aChartData[0].Revenue;

						var dDifference = iTotalRevenueLastDay - dTodayTotalPrice;
						var dPercentageDifference;

						if (iTotalRevenueLastDay > 0) {
							dPercentageDifference = (dDifference / iTotalRevenueLastDay) * 100;
						} else {
							dPercentageDifference = dDifference / 100;
							dPercentageDifference = Math.abs(dPercentageDifference);
						}

						oViewData.PERCENTAGE_DIFFERENCE = dPercentageDifference;

						if (!this.LOAD_CHART_ONLY_ONCE) {
							this.LOAD_CHART_ONLY_ONCE = true;
							// update chart in dashboard
							this._oInstance.chart.loadChart(aChartData);
						}

						// filter table
						var oTable = this._oView.byId("orders-id"),
							oBinding = oTable.getBinding("items"),
							oBeginDate = moment().startOf("day"),
							oEndDate = moment().endOf("day"),
							aFilters = [];

						oViewData.bOrdersToday = true;
						oViewData.bOrdersAll = false;

						aFilters.push(new sap.ui.model.Filter("TIME_STAMP", "BT", oBeginDate, oEndDate));
						oBinding.filter(aFilters);

						// update model data
						this.oViewModel.refresh();

					}.bind(this));
			},

			toggleOrders: function (oEvent) {
				var oTable = this._oInstance.byId("orders-id"),
					oBinding = oTable.getBinding("items"),
					oBeginDate = moment().startOf("day"),
					oEndDate = moment().endOf("day"),
					oViewData = this.oViewModel.getData(),
					aFilters = [];

				// filter type
				var bOrderToday = oEvent.getSource().data("orders") === "TODAY";
				oViewData.bOrdersToday = bOrderToday;
				oViewData.bOrdersAll = !bOrderToday;

				if (!bOrderToday) {
					oBeginDate.set({
						"year": 2019,
						"month": "1"
					});
				}

				aFilters.push(new sap.ui.model.Filter("TIME_STAMP", "BT", oBeginDate, oEndDate));
				oBinding.filter([aFilters]);

				// update model data
				this.oViewModel.refresh();
			},

			ordersExport: function () {
				// get orders data
				var aOrder = this.oViewModel.getData().ORDERS;
				var aTodayOrder = [];

				for (var i = 0, iLen = aOrder.length; i < iLen; i++) {
					if (moment(aOrder[i].TIME_STAMP).isSame(moment(), "day")) {
						aTodayOrder.push(aOrder[i]);
					}
				}

				if (aTodayOrder.length === 0) {
					MessageToast.show("No orders present TODAY to download!");
				}

				var aExportData = [];

				for (i = 0, iLen = aTodayOrder.length; i < iLen; i++) {
					aExportData.push({
						"Order ID": aTodayOrder[i].ORDER_ID,
						"Name": aTodayOrder[i].CUSTOMER.NAME,
						"Phone No.": aTodayOrder[i].CUSTOMER.PHONE_NO,
						"Total Price": aTodayOrder[i].TOTAL_PAYABLE.toFixed(2),
						"Address": aTodayOrder[i].CUSTOMER.ADDRESS + ", " + aTodayOrder[i].CUSTOMER.CITY + ", " + aTodayOrder[i].CUSTOMER.STATE + ", " +
							aTodayOrder[i].CUSTOMER.COUNTRY + ".",
						"Signature": ""
					});
				}

				var fileName = "Orders" + new Date().getTime();
				var exportType = "xls";

				exportFromJSON({
					data: aExportData,
					fileName: fileName,
					exportType: exportType
				});
			}
		});
	});