/*global firebase*/

sap.ui.define(["sap/ui/base/Object", "sap/ui/model/json/JSONModel", "sap/ui/model/Filter", "sap/m/MessageBox", "sap/m/MessageToast"],
	function (UI5Object, JSONModel, Filter, MessageBox, MessageToast) {
		"use strict";

		return UI5Object.extend("com.digiArtitus.controller.Billing", {

			constructor: function (oInstance) {
				this._oInstance = oInstance;
				this._oView = oInstance.getView();
				this.oViewModel = this._oView.getModel("oViewModel");
			},

			loadBillingModel: function () {
				this._oInstance.billingUnsubscribe =
				com.digiArtitus
					.FirestoreInstance()
					.collection("DATABASE")
					.doc(com.digiArtitus.companyCode)
					.collection("COLLECTION")
					.onSnapshot(function (querySnapshot) {
						var aCollectionData = [];
						querySnapshot.forEach(function (doc) {
							aCollectionData.push({
								"NAME": doc.data().NAME
							});
						});

						for (var i = 0, iLen = aCollectionData.length; i < iLen; i++) {
							com.digiArtitus
								.FirestoreInstance()
								.collection("DATABASE")
								.doc(com.digiArtitus.companyCode)
								.collection("ITEMS")
								.where("COLLECTION", "==", aCollectionData[i].NAME)
								.get()
								.then(function (querySnapshotItem) {
									var aData = [];
									querySnapshotItem.forEach(function (doc) {
										if (doc.data().ACTIVE) {
											aData.push({
												"COLLECTION": doc.data().COLLECTION,
												"MENU": doc.data().MENU,
												"IMAGE_NAME": doc.data().IMAGE_NAME,
												"IMAGE_URL": doc.data().IMAGE_URL,
												"USER_COMPANY_CODE": doc.data().USER_COMPANY_CODE,
												"ITEM_CODE": doc.data().ITEM_CODE,
												"NAME": doc.data().NAME,
												"DESCRIPTION": doc.data().DESCRIPTION,
												"NET_PRICE": doc.data().NET_PRICE,
												"SALE_PRICE": doc.data().SALE_PRICE,
												"RANGE_OF_PRODUCTS": doc.data().RANGE_OF_PRODUCTS,
												"RANGE_OF_PRODUCTS_ITEMS": doc.data().RANGE_OF_PRODUCTS_ITEMS
											});
										}
									});

									var k = 0;
									var kLen = aData.length;
									var aOutput = [];

									if (kLen !== 0) {
										for (k = 0; k < kLen; k++) {
											// check for range of products entry
											if (aData[k].RANGE_OF_PRODUCTS) {
												for (var j = 0, jLen = aData[k].RANGE_OF_PRODUCTS_ITEMS.length; j < jLen; j++) {
													aOutput.push({
														"COLLECTION": aData[k].COLLECTION,
														"MENU": aData[k].MENU,
														"IMAGE_NAME": aData[k].IMAGE_NAME,
														"IMAGE_URL": aData[k].IMAGE_URL,
														"USER_COMPANY_CODE": aData[k].USER_COMPANY_CODE,
														"ITEM_CODE": aData[k].ITEM_CODE,
														"NAME": aData[k].NAME,
														"DESCRIPTION": aData[k].RANGE_OF_PRODUCTS_ITEMS[j].DESCRIPTION,
														"NET_PRICE": parseFloat(aData[k].RANGE_OF_PRODUCTS_ITEMS[j].NET_PRICE),
														"SALE_PRICE": parseFloat(aData[k].RANGE_OF_PRODUCTS_ITEMS[j].SALE_PRICE),
														"DISCOUNT": this._fnDiscountPercentage(
															aData[k].RANGE_OF_PRODUCTS_ITEMS[j].NET_PRICE,
															aData[k].RANGE_OF_PRODUCTS_ITEMS[j].SALE_PRICE)
													});
												}
											} else {
												aOutput.push({
													"COLLECTION": aData[k].COLLECTION,
													"MENU": aData[k].MENU,
													"IMAGE_NAME": aData[k].IMAGE_NAME,
													"IMAGE_URL": aData[k].IMAGE_URL,
													"USER_COMPANY_CODE": aData[k].USER_COMPANY_CODE,
													"ITEM_CODE": aData[k].ITEM_CODE,
													"NAME": aData[k].NAME,
													"DESCRIPTION": aData[k].DESCRIPTION,
													"NET_PRICE": parseFloat(aData[k].NET_PRICE),
													"SALE_PRICE": parseFloat(aData[k].SALE_PRICE),
													"DISCOUNT": this._fnDiscountPercentage(aData[k].NET_PRICE, aData[k].SALE_PRICE)
												});
											}
										}
									}

									// if no entries found skip the button creation
									if (aOutput.length === 0) {
										return;
									}

									var sBindingEntity = aOutput[0].COLLECTION + "_BILLING";
									var oButton = new sap.m.Button({
										icon: "sap-icon://add",
										type: sap.m.ButtonType.Ghost,
										text: aOutput[0].COLLECTION,
										press: this.onBillingItemsAddPress.bind(this)
									}).addStyleClass("sapUiTinyMarginBegin");
									oButton.data("BINDING_ENTITY", sBindingEntity);
									var oDynamicHBox = this._oView.byId("billing-dynamic-btn");
									oDynamicHBox.addItem(oButton);

									// dynamic billing items
									this.oViewModel.setProperty("/" + sBindingEntity, aOutput);
								}.bind(this));
						}
					}.bind(this));
			},

			_fnDiscountPercentage: function (sOld, sNew) {
				var dSalePrice = 0.0;
				var dNetPrice = 0.0;
				var dDiscount = 0.0;
				var dDiscountPercentage = 0.0;

				dNetPrice = parseFloat(sOld);
				dSalePrice = parseFloat(sNew);
				dDiscount = dNetPrice - dSalePrice;
				dDiscountPercentage = (dDiscount / dNetPrice) * 100;

				// check for negative values 
				dDiscountPercentage = Math.round(dDiscountPercentage) <= 0 ? 0 : Math.round(dDiscountPercentage);

				return dDiscountPercentage;
			},

			_billingPageDefaults: function () {
				this.oViewModel.setProperty("/BILLING_NAME", "");
				this.oViewModel.setProperty("/BILLING_STREET_NO", com.digiArtitus.billingStreetNo);
				this.oViewModel.setProperty("/BILLING_STREET", com.digiArtitus.billingStreet);
				this.oViewModel.setProperty("/BILLING_CITY", com.digiArtitus.billingCity);
				this.oViewModel.setProperty("/BILLING_ZIPCODE", com.digiArtitus.billingZipcode);
				this.oViewModel.setProperty("/BILLING_COUNTRY", com.digiArtitus.billingCountry);
				this.oViewModel.setProperty("/BILLING_PHONE_NO", "");
				this.oViewModel.setProperty("/BILLING_EMAIL", "");
				this.oViewModel.setProperty("/BILLING_ITEMS", []);
			},

			_validateInput: function (oInput) {
				var oBinding = oInput.getBinding("value");
				var sValueState = "None";
				var bValidationError = false;
				try {
					oBinding.getType().validateValue(oInput.getValue());
				} catch (oException) {
					sValueState = "Error";
					bValidationError = true;
					oInput.focus();
				}
				oInput.setValueState(sValueState);
				return bValidationError;
			},

			onBillingItemsAddPress: function (oEvent) {
				if (!this._oBillingDialog) {
					this._oBillingDialog = sap.ui.xmlfragment(this._oView.getId(), "com.digiArtitus.fragment.billing-items",
						this);
				}

				var sBindingEntity = "/" + oEvent.getSource().data("BINDING_ENTITY");

				var oBillingModel = this._oView.getModel("oBillingModel");
				if (oBillingModel) {
					oBillingModel.destroy();
				}

				this._oBillingDialog.setModel(new JSONModel(this.oViewModel.getProperty(sBindingEntity)), "oBillingModel");

				// Multi-select if required
				var bMultiSelect = true;
				this._oBillingDialog.setMultiSelect(bMultiSelect);

				// Remember selections if required
				var bRemember = false;
				this._oBillingDialog.setRememberSelections(bRemember);

				this._oView.addDependent(this._oBillingDialog);

				// toggle compact style
				jQuery.sap.syncStyleClass("sapUiSizeCompact", this._oView, this._oBillingDialog);
				this._oBillingDialog.open();
			},

			onBillingItemsDialogSearch: function (oEvent) {
				var sValue = oEvent.getParameter("value");
				var oFilter = new Filter("NAME", sap.ui.model.FilterOperator.Contains, sValue);
				var oBinding = oEvent.getSource().getBinding("items");
				oBinding.filter([oFilter]);
			},

			onBillingItemsDialogClose: function (oEvent) {
				var aContexts = oEvent.getParameter("selectedContexts");
				if (aContexts && aContexts.length) {
					var aData = [];
					aContexts.map(function (oContext) {
						aData.push({
							"IMAGE_URL": oContext.getObject().IMAGE_URL,
							"COLLECTION": oContext.getObject().COLLECTION,
							"MENU": oContext.getObject().MENU,
							"ITEM_CODE": oContext.getObject().ITEM_CODE,
							"NAME": oContext.getObject().NAME,
							"DESCRIPTION": oContext.getObject().DESCRIPTION,
							"NET_PRICE": oContext.getObject().NET_PRICE,
							"SALE_PRICE": oContext.getObject().SALE_PRICE,
							"DISCOUNT": oContext.getObject().DISCOUNT,
							"QUANTITY": 1,
							"TOTAL_PRICE": oContext.getObject().SALE_PRICE
						});
					});
					this.oViewModel.setProperty("/BILLING_ITEMS", aData);
					// update total 
					this._updateBillTotal();
				} else {
					MessageToast.show("No new item was selected.");
				}
				oEvent.getSource().getBinding("items").filter([]);
			},

			onBillingItemDelete: function (oEvent) {
				var oBindingContext = oEvent.getParameter("listItem").getBindingContext("oViewModel");
				var sPath = oBindingContext.getPath();
				var iIndex = sPath.substr(sPath.lastIndexOf("/") + 1);
				var aData = this.oViewModel.getProperty("/BILLING_ITEMS");
				// remove item
				aData.splice(iIndex, 1);
				this.oViewModel.setProperty("/BILLING_ITEMS", aData);
				// update total 
				this._updateBillTotal();
			},

			onBillingQuantityLiveChange: function (oEvent) {
				var oBindingContext = oEvent.getSource().getBindingContext("oViewModel");
				var oData = oBindingContext.getObject();
				var sPath = oBindingContext.getPath();
				var sQuantity = oEvent.getParameter("value");
				var sValue = parseFloat(oData.SALE_PRICE * sQuantity);

				this.oViewModel.setProperty(sPath + "/TOTAL_PRICE", sValue);
				// update total 
				this._updateBillTotal();
			},

			_updateBillTotal: function () {
				var dTotal = 0.0;
				var aData = this.oViewModel.getProperty("/BILLING_ITEMS");
				var dDeliveryCheck = this.oViewModel.getProperty("/BILLING_DELIVERY_CHARGE_CHECK");
				var dDeliveryCharge = this.oViewModel.getProperty("/BILLING_DELIVERY_CHARGE");
				for (var i = 0, iLen = aData.length; i < iLen; i++) {
					dTotal += parseFloat(aData[i].TOTAL_PRICE);
				}
				this.oViewModel.setProperty("/BILLING_TOTAL_PRICE", dTotal);

				// add delivery charges
				if (dTotal <= dDeliveryCheck) {
					dTotal += dDeliveryCharge;
				}

				this.oViewModel.setProperty("/BILLING_TOTAL_PAYABLE", dTotal);
			},

			onBillingCreateOrder: function () {
				// collect input controls
				var that = this._oInstance;
				var oView = this._oView;
				var aInputs = [
					oView.byId("BillingName"),
					oView.byId("BillingStreetNumber"),
					oView.byId("BillingStreet"),
					oView.byId("BillingCity"),
					oView.byId("BillingZipCode")
				];

				var bValidationError = false;

				// check that inputs are not empty
				// this does not happen during data binding as this is only triggered by changes
				jQuery.each(aInputs, function (i, oInput) {
					bValidationError = that._validateInput(oInput) || bValidationError;
				});

				// if range of inputs where selected check for entries
				var aOrderItems = this.oViewModel.getProperty("/BILLING_ITEMS");
				if (aOrderItems.length === 0) {
					MessageToast.show("Minimum one item is required to create order!");
					return;
				}

				// output result
				if (bValidationError) {
					MessageBox.error("A validation error has occurred. Complete your input first");
					return;
				}

				// setting auto fill values to model
				this.oViewModel.setProperty("/BILLING_NAME", oView.byId("BillingName").getValue());
				this.oViewModel.setProperty("/BILLING_STREET_NO", oView.byId("BillingStreetNumber").getValue());
				this.oViewModel.setProperty("/BILLING_CITY", oView.byId("BillingCity").getValue());
				this.oViewModel.setProperty("/BILLING_ZIPCODE", oView.byId("BillingZipCode").getValue());
				this.oViewModel.setProperty("/BILLING_PHONE_NO", oView.byId("BillingPhoneNo").getValue());
				this.oViewModel.setProperty("/BILLING_EMAIL", oView.byId("BillingEmail").getValue());

				var fnWarningMessage = function () {
					var deferred = $.Deferred();
					var bCompact = !!this._oView.$().closest(".sapUiSizeCompact").length;
					MessageBox.warning(
						"Confirm to place order", {
							actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
							styleClass: bCompact ? "sapUiSizeCompact" : "",
							onClose: function (sAction) {
								if (sAction === "OK") {
									deferred.resolve("create");
								}
							}
						}
					);
					return deferred.promise();
				}.bind(this);

				$.when(fnWarningMessage()).done(function (value) {
					com.digiArtitus.StartGlobalBusyIndicator();

					// billing items set currency value to two decimal
					var aBillingItems = this.oViewModel.getProperty("/BILLING_ITEMS");
					for (var i = 0, iLen = aBillingItems.length; i < iLen; i++) {
						aBillingItems[i].NET_PRICE = parseFloat(aBillingItems[i].NET_PRICE).toFixed(2);
						aBillingItems[i].SALE_PRICE = parseFloat(aBillingItems[i].SALE_PRICE).toFixed(2);
						aBillingItems[i].TOTAL_PRICE = parseFloat(aBillingItems[i].TOTAL_PRICE).toFixed(2);
					}

					// add the new entry to firestore db
					var docData = {
						"USER_ID": com.digiArtitus.userId,
						"USER_COMPANY_CODE": com.digiArtitus.companyCode,
						"TIME_STAMP": firebase.firestore.Timestamp.fromDate(new Date()),
						"ORDER_ID": "ORD" + new Date().getTime(),
						"ORDER_TYPE": "POS",
						"ORDER_STATUS": "RECEIVED",
						"TOTAL_PRICE": parseFloat(this.oViewModel.getProperty("/BILLING_TOTAL_PRICE")).toFixed(2),
						"TOTAL_PAYABLE": parseFloat(this.oViewModel.getProperty("/BILLING_TOTAL_PAYABLE")),
						"DELIVERY_CHARGE": this.oViewModel.getProperty("/BILLING_TOTAL_PRICE") <= this.oViewModel.getProperty(
							"/BILLING_DELIVERY_CHARGE_CHECK") ? parseFloat(this.oViewModel.getProperty("/BILLING_DELIVERY_CHARGE")).toFixed(2) : "0.00",
						"ITEMS": aBillingItems,
						"CUSTOMER": {
							"NAME": this.oViewModel.getProperty("/BILLING_NAME"),
							"ADDRESS": this.oViewModel.getProperty("/BILLING_STREET_NO") + ", " + this.oViewModel.getProperty("/BILLING_STREET"),
							"CITY": this.oViewModel.getProperty("/BILLING_CITY"),
							"STATE": this.oViewModel.getProperty("/BILLING_ZIPCODE"),
							"COUNTRY": this.oViewModel.getProperty("/BILLING_COUNTRY"),
							"PHONE_NO": this.oViewModel.getProperty("/BILLING_PHONE_NO"),
							"EMAIL_ID": this.oViewModel.getProperty("/BILLING_EMAIL")
						}
					};

					com.digiArtitus
						.FirestoreInstance()
						.collection("DATABASE")
						.doc(com.digiArtitus.companyCode)
						.collection("ORDERS")
						.add(docData)
						.then(
							function () {
								// nav to dashboard
								this._oInstance._setSelectedNavBar("Dashboard");

								// reset 
								this.oViewModel.setProperty("/BILLING_TOTAL_PAYABLE", 0);
								this.oViewModel.setProperty("/BILLING_TOTAL_PRICE", 0);
								this.oViewModel.setProperty("/BILLING_ITEMS", []);

								//  customer fields
								this.oViewModel.setProperty("/BILLING_NAME", "");
								this.oViewModel.setProperty("/BILLING_STREET_NO", com.digiArtitus.billingStreetNo);
								this.oViewModel.setProperty("/BILLING_STREET", com.digiArtitus.billingStreet);
								this.oViewModel.setProperty("/BILLING_CITY", com.digiArtitus.billingCity);
								this.oViewModel.setProperty("/BILLING_ZIPCODE", com.digiArtitus.billingZipcode);
								this.oViewModel.setProperty("/BILLING_PHONE_NO", "");
								this.oViewModel.setProperty("/BILLING_EMAIL", "");

								com.digiArtitus.EndGlobalBusyIndicator();
							}.bind(this));
				}.bind(this));
			}

		});
	});