/*eslint-env es6*/
/*global moment, _, exportFromJSON*/
/*eslint-disable no-loop-func*/

sap.ui.define(["sap/ui/base/Object", "sap/m/MessageBox", "sap/m/MessageToast", "com/digiArtitus/model/formatter"],
	function (UI5Object, MessageBox, MessageToast, formatter) {
		"use strict";

		return UI5Object.extend("com.digiArtitus.controller.Orders", {

			constructor: function (oInstance) {
				this._oInstance = oInstance;
				this._oView = oInstance.getView();
				this.oViewModel = this._oView.getModel("oViewModel");
			},

			liveOrders: function () {
				this._oInstance.orderUnsubscribe =       
				com.digiArtitus
					.FirestoreInstance()
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
							// this._oInstance.chart.loadChart(aChartData);
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

						// date instance
						var oDateInstance = moment();
						var isTodaySalesAvailable = parseFloat(oViewData.TODAY_TOTAL_PRICE) === 0;
						var iLen = 0;
						var aTopProductSales = [];
						var iTargetPerDay = 10000;
						var sTargetDeviationPercentage = parseFloat((((iTargetPerDay + parseFloat(oViewData.TODAY_TOTAL_PRICE)) / 2) - iTargetPerDay) / 100).toFixed(1);

						aMenuCount = _.sortBy(aMenuCount, ["COUNT"]).reverse();

						for (i = 0, iLen = aMenuCount.length; i < iLen; i++) {
							aTopProductSales.push({
								"Name": aMenuCount[i].MENU,
								"Description": "",
								"Count": aMenuCount[i].COUNT,
								"State": "Warning"
							});

							if (i === 4) {
								break;
							}
						}

						// dashboard sales model
						oViewData.DASHBOARD_SALES = {
							"sap.card": {
								"type": "List",
								"header": {
									"type": "Numeric",
									"data": {
										"json": {
											"kpiInfos": {
												"kpi": {
													"number": parseFloat(oViewData.TODAY_TOTAL_PRICE, 10).toFixed(2),
													"unit": "K",
													"trend": isTodaySalesAvailable ? "Down" : "Up",
													"state": isTodaySalesAvailable ? "Error" : "Good",
													"target": {
														"number": 10,
														"unit": "K"
													},
													"deviation": {
														"number": sTargetDeviationPercentage
													},
													"details": "Q" + oDateInstance.quarter() + ", " + oDateInstance.get("year")
												}
											}
										},
										"path": "/kpiInfos/kpi"
									},
									"title": "Top 5 products sales",
									"subTitle": "By average daily income",
									"unitOfMeasurement": "INR",
									"mainIndicator": {
										"number": "{number}",
										"unit": "{unit}",
										"trend": "{trend}",
										"state": "{state}"
									},
									"sideIndicators": [{
										"title": "Target",
										"number": "{target/number}",
										"unit": "{target/unit}"
									}, {
										"title": "Deviation",
										"number": "{deviation/number}",
										"unit": "%"
									}],
									"details": "{details}"
								},
								"content": {
									"data": {
										"json": aTopProductSales
									},
									"item": {
										"title": "{Name}",
										"description": "{Description}",
										"info": {
											"value": "{Count} No",
											"state": "{State}"
										}
									}
								}
							}
						};

						// load latest 10 orders to display in dashboard
						var aDashboardSaleOrder = [];

						filteredTodayObjects = oViewData.ORDERS;

						for (i = 0, iLen = filteredTodayObjects.length; i < iLen; i++) {
							aDashboardSaleOrder.push({
								"salesOrder": filteredTodayObjects[i].ORDER_ID,
								"customerName": filteredTodayObjects[i].CUSTOMER.NAME,
								"netAmount": com.digiArtitus.FormattedCurrency(filteredTodayObjects[i].TOTAL_PAYABLE),
								"status": filteredTodayObjects[i].ORDER_STATUS,
								"statusState": formatter.orderStatus(filteredTodayObjects[i].ORDER_STATUS) // "Success"
							});

							if (i === 8) {
								break;
							}
						}

						// dashboard sales table
						oViewData.DASHBOARD_SALES_TABLE = {
							"sap.card": {
								"type": "Table",
								"data": {
									"json": aDashboardSaleOrder
								},
								"header": {
									"title": "Sales Orders for Surgical",
									"subTitle": "Recent orders",
									"status": {
										"text": "{headerData/statusText}"
									}
								},
								"content": {
									"row": {
										"columns": [{
											"title": "Sales Order",
											"value": "{salesOrder}",
											"identifier": true,
											"width": "25%"
										}, {
											"title": "Customer",
											"value": "{customerName}",
											"width": "40%"
										}, {
											"title": "Net Amount",
											"value": "{netAmount}",
											"width": "15%"
										}, {
											"title": "Status",
											"value": "{status}",
											"state": "{statusState}",
											"width": "20%"
										}]
									}
								}
							}
						};

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
			},

			_customerInfoDialog: function () {
				if (!this.customerInfoDialog) {
					var oView = this._oView;
					this.customerInfoDialog = sap.ui.xmlfragment(oView.getId(), "com.digiArtitus.fragment.orders-customer-info", this);
					oView.addDependent(this.customerInfoDialog);
					// sync compact style
					jQuery.sap.syncStyleClass("sapUiSizeCompact", oView, this.customerInfoDialog);
				}
				return this.customerInfoDialog;
			},

			onOrderTypePress: function (oEvent) {
				var oSource = oEvent.getSource();
				var oData = oEvent.getSource().getBindingContext("oViewModel").getObject();
				var mCustomerData = [{
					pageId: "employeePageId",
					header: "Customer Info",
					icon: "sap-icon://customer",
					title: oData.CUSTOMER.NAME,
					description: "Customer",
					groups: [{
						heading: "Contact Details",
						elements: [{
							label: "Phone",
							value: "+91" + oData.CUSTOMER.PHONE_NO,
							elementType: sap.m.QuickViewGroupElementType.phone
						}, {
							label: "Email",
							value: oData.CUSTOMER.EMAIL_ID,
							emailSubject: "Subject",
							elementType: sap.m.QuickViewGroupElementType.email
						}, {
							label: "Address",
							value: oData.CUSTOMER.ADDRESS + ", " + oData.CUSTOMER.CITY + ", " + oData.CUSTOMER.STATE + ", " + oData.CUSTOMER.COUNTRY +
								".",
							elementType: sap.m.QuickViewGroupElementType.text
						}]
					}]
				}];

				this.oViewModel.setProperty("/ORDER_CUSTOMER_INFO", mCustomerData);

				// delay because addDependent will do a async rerendering and the actionSheet will immediately close without it.
				jQuery.sap.delayedCall(0, this, function () {
					this._customerInfoDialog().openBy(oSource);
				});
			},

			_orderStatusDialog: function () {
				if (!this.orderStatusDialog) {
					var oView = this._oView;
					this.orderStatusDialog = sap.ui.xmlfragment(oView.getId(), "com.digiArtitus.fragment.orders-status", this);
					oView.addDependent(this.orderStatusDialog);
					// sync compact style
					jQuery.sap.syncStyleClass("sapUiSizeCompact", oView, this.orderStatusDialog);
				}
				return this.orderStatusDialog;
			},

			onOrderStatusPress: function (oEvent) {
				var oSource = oEvent.getSource();
				var oData = oEvent.getSource().getBindingContext("oViewModel").getObject();

				// set to view model
				this.oViewModel.setProperty("/ORDER_STATUS_EDIT", oData);

				if (!oData.MOMENT_TIME_STAMP.isSame(moment(), "day")) {
					MessageToast.show("Order status for previous dates cannot be changed");
					return;
				}

				if (oData.ORDER_STATUS.toUpperCase() === "CANCELLED") {
					MessageToast.show("Order cancelled by the user, Status cannot be changed");
					return;
				}

				// delay because addDependent will do a async rerendering and the actionSheet will immediately close without it.
				jQuery.sap.delayedCall(0, this, function () {
					this._orderStatusDialog().openBy(oSource);
				});
			},

			onStatusChanged: function (oEvent) {
				com.digiArtitus.StartGlobalBusyIndicator();
				var oData = this.oViewModel.getProperty("/ORDER_STATUS_EDIT");
				oData.DOC_REF.update({
					"ORDER_STATUS": oEvent.getSource().data("key")
				}).then(com.digiArtitus.EndGlobalBusyIndicator()).catch(function (e) {
					MessageToast.show("Error in posting data");
					com.digiArtitus.EndGlobalBusyIndicator();
				});
			},

			onCloseDisplayItems: function () {
				this.orderItemsDisplayDialog.close();
			},

			onOrderItemsPress: function (oEvent) {
				var oData = oEvent.getSource().getBindingContext("oViewModel").getObject();
				this.oViewModel.setProperty("/DISPLAY_ORDERS", oData.ITEMS);

				if (!this.orderItemsDisplayDialog) {
					var oView = this._oView;
					this.orderItemsDisplayDialog = sap.ui.xmlfragment(oView.getId(), "com.digiArtitus.fragment.orders-display-items",
						this);
					oView.addDependent(this.orderItemsDisplayDialog);
					// sync compact style
					jQuery.sap.syncStyleClass("sapUiSizeCompact", oView, this.orderItemsDisplayDialog);
				}

				this.orderItemsDisplayDialog.open();
			},

			onOrderReceiptPress: function (oEvent) {
				var oResourceBundle = this._oView.getModel("i18n").getResourceBundle(),
					sLink = oResourceBundle.getText("RECEIPT_URL"),
					oData = oEvent.getSource().getBindingContext("oViewModel").getObject(),
					aItems = [],
					sQuery = "",
					sURL = "",
					oOutput = {
						"USER_PATH": com.digiArtitus.userId,
						"GST_NO": oData.GST_NO,
						"ORDER_ID": oData.ORDER_ID,
						"COMPANY_CODE": oData.USER_COMPANY_CODE,
						"ORDER_TYPE": oData.ORDER_TYPE,
						"ORDER_DATE": moment(oData.TIME_STAMP).format("Do MMM YYYY"),
						"CUSTOMER": oData.CUSTOMER,
						"DELIVERY_CHARGE": oData.DELIVERY_CHARGE,
						"TOTAL_PRICE": oData.TOTAL_PRICE,
						"GRAND_TOTAL": parseFloat(oData.TOTAL_PAYABLE).toFixed(2)
					};

				// Line items header
				aItems.push({
					"ITEM_NAME": "Item",
					"ITEM_DESCRIPTION": "Description",
					"SALE_PRICE": "Unit Cost",
					"QUANTITY": "Quantity",
					"TOTAL_PRICE": "Line Total"
				});

				for (var i = 0, iLen = oData.ITEMS.length; i < iLen; i++) {
					aItems.push({
						"ITEM_NAME": oData.ITEMS[i].NAME,
						"ITEM_DESCRIPTION": oData.ITEMS[i].DESCRIPTION,
						"SALE_PRICE": oData.ITEMS[i].SALE_PRICE,
						"QUANTITY": oData.ITEMS[i].QUANTITY,
						"TOTAL_PRICE": oData.ITEMS[i].TOTAL_PRICE
					});
				}

				oOutput.ITEMS = aItems;
				sQuery = encodeURIComponent(JSON.stringify(oOutput));
				sURL = sLink + sQuery;
				sap.m.URLHelper.redirect(sURL, true);
			}

		});
	});