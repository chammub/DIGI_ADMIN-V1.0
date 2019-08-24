/*eslint-env es6*/
/*global firebase, moment*/

sap.ui.define(["sap/ui/base/Object", "sap/m/MessageBox", "sap/m/MessageToast"],
	function (UI5Object, MessageBox, MessageToast) {
		"use strict";

		return UI5Object.extend("com.digiArtitus.controller.Banner", {

			constructor: function (oInstance) {
				this._oInstance = oInstance;
				this._oView = oInstance.getView();
				this.oViewModel = this._oView.getModel("oViewModel");
			},

			liveDatabaseCollectionUpdates: function () {
				var fnSuccess = function (querySnapshot) {
					var oViewModel = this._oView.getModel("oViewModel");
					var oViewData = oViewModel.getData();

					var aData = [];
					querySnapshot.forEach(function (doc) {
						aData.push({
							"DOC_REF": doc.ref,
							"USER_ID": doc.data().USER_ID,
							"NAME": doc.data().NAME,
							"INITIALS": doc.data().NAME.substr(0, 1),
							"TIME_STAMP": moment(doc.data().TIME_STAMP).format("Do MMM YYYY")
						});
					});

					// update banner data
					oViewData.COLLECTIONS = aData;

					// update model data
					oViewModel.refresh();
				}.bind(this);

				this._oInstance.databaseCollectionUnsubscribe = com.digiArtitus.FirestoreInstance()
																	.collection("DATABASE")
																	.doc(com.digiArtitus.companyCode)
																	.collection("COLLECTION")
																	.onSnapshot(fnSuccess);
			},

			liveDatabaseMenuUpdates: function () {
				var fnSuccess = function (querySnapshot) {
					var oViewModel = this._oView.getModel("oViewModel");
					var oViewData = oViewModel.getData();

					var aData = [];
					querySnapshot.forEach(function (doc) {
						aData.push({
							"DOC_REF": doc.ref,
							"USER_ID": doc.data().USER_ID,
							"NAME": doc.data().NAME,
							"COLLECTION": doc.data().COLLECTION,
							"IMAGE_NAME": doc.data().IMAGE_NAME,
							"IMAGE_URL": doc.data().IMAGE_URL,
							"IMAGE_REF_PATH": doc.data().IMAGE_REF_PATH,
							"USER_COMPANY_CODE": doc.data().USER_COMPANY_CODE,
							"TIME_STAMP": moment(doc.data().TIME_STAMP).format("Do MMM YYYY")
						});
					});

					// update banner data
					oViewData.MENU = aData;

					// update model data
					oViewModel.refresh();
				}.bind(this);

				this._oInstance.databaseMenuUnsubscribe = com.digiArtitus.FirestoreInstance()
															.collection("DATABASE")
															.doc(com.digiArtitus.companyCode)
															.collection("MENU")
															.onSnapshot(fnSuccess);
			},

			liveDatabaseItemUpdates: function () {
				var fnSuccess = function (querySnapshot) {
					var oViewModel = this._oView.getModel("oViewModel");
					var oViewData = oViewModel.getData();

					var aData = [];
					querySnapshot.forEach(function (doc) {
						aData.push({
							"DOC_REF": doc.ref,
							"USER_ID": doc.data().USER_ID,
							"COLLECTION": doc.data().COLLECTION,
							"MENU": doc.data().MENU,
							"IMAGE_NAME": doc.data().IMAGE_NAME,
							"IMAGE_URL": doc.data().IMAGE_URL,
							"IMAGE_REF_PATH": doc.data().IMAGE_REF_PATH,
							"USER_COMPANY_CODE": doc.data().USER_COMPANY_CODE,
							"TIME_STAMP": moment(doc.data().TIME_STAMP).format("Do MMM YYYY"),
							"ITEM_CODE": doc.data().ITEM_CODE,
							"NAME": doc.data().NAME,
							"DESCRIPTION": doc.data().DESCRIPTION,
							"TAX": doc.data().TAX,
							"NET_PRICE": doc.data().NET_PRICE,
							"SALE_PRICE": doc.data().SALE_PRICE,
							"RANGE_OF_PRODUCTS": doc.data().RANGE_OF_PRODUCTS,
							"RANGE_OF_PRODUCTS_ITEMS": doc.data().RANGE_OF_PRODUCTS_ITEMS,
							"ACTIVE": doc.data().ACTIVE
						});
					});

					// update banner data
					oViewData.ITEMS = aData;

					// update model data
					oViewModel.refresh();
				}.bind(this);

				this._oInstance.databaseItemUnsubscribe = com.digiArtitus.FirestoreInstance()
																	.collection("DATABASE")
																	.doc(com.digiArtitus.companyCode)
																	.collection("ITEMS")
																	.onSnapshot(fnSuccess);
			},

			/* =========================================================== */
			/* collection event handlers - start                           */
			/* =========================================================== */

			_collectionDialog: function () {
				if (!this.collectionDialog) {
					var oView = this._oView;
					this.collectionDialog = sap.ui.xmlfragment(oView.getId(), "com.digiArtitus.fragment.database-collection",
						this);
					oView.addDependent(this.collectionDialog);
					// sync compact style
					jQuery.sap.syncStyleClass("sapUiSizeCompact", oView, this.collectionDialog);
				}
				return this.collectionDialog;
			},

			onCollectionListEdit: function () {
				// onCollectionListPress
			},

			onCollectionDialogAddPress: function () {
				this._collectionDialog().open();
			},

			onCollectionListEditPress: function (oEvent) {
				var oSource = oEvent.getSource();
				var oData = oSource.getBindingContext("oViewModel").getObject();
				this.COLLECTION_EDIT_FLAG = true;
				this.COLLECTION_EDIT_DATA = oData;

				this.oViewModel.setProperty("/COLLECTION_NAME", oData.NAME);

				this._collectionDialog().open();
			},

			onCollectionListPress: function (oEvent) {
				var oData = oEvent.getParameter("listItem").getBindingContext("oViewModel").getObject();
				this.oViewModel.setProperty("/SELECTED_COLL_NAME", oData.NAME);
				this._oInstance._listFilter("menu-list-id", "COLLECTION", oData.NAME);
			},

			onCollectionSave: function () {
				// collect input controls
				var that = this._oInstance;

				// var oCore = sap.ui.getCore();
				var oView = this._oView;
				var aInputs = [
					oView.byId("collection-name-id")
				];
				var bValidationError = false;

				// check that inputs are not empty
				// this does not happen during data binding as this is only triggered by changes
				jQuery.each(aInputs, function (i, oInput) {
					bValidationError = that._validateInput(oInput) || bValidationError;
				});

				if (bValidationError) {
					MessageToast.show("A validation error has occurred. Complete your input first");
					return;
				}

				com.digiArtitus.StartGlobalBusyIndicator();

				var docData = {
					"NAME": this.oViewModel.getProperty("/COLLECTION_NAME"),
					"TIME_STAMP": firebase.firestore.Timestamp.fromDate(new Date())
				};

				if (this.COLLECTION_EDIT_FLAG) {
					this.COLLECTION_EDIT_DATA.DOC_REF.update(docData).then(function () {
						this._collectionDialog().close();
						this.COLLECTION_EDIT_FLAG = false;
						this.oViewModel.setProperty("/COLLECTION_NAME", "");
						com.digiArtitus.EndGlobalBusyIndicator();
					}.bind(this)).catch(function (e) {
						MessageToast.show("Error in posting data");
						com.digiArtitus.EndGlobalBusyIndicator();
					});
				} else {
					docData.USER_ID = com.digiArtitus.userId;
					com.digiArtitus.FirestoreInstance().collection("DATABASE").doc(com.digiArtitus.companyCode).collection("COLLECTION").add(docData).then(
						function () {
							this._collectionDialog().close();
							this.oViewModel.setProperty("/COLLECTION_NAME", "");
							com.digiArtitus.EndGlobalBusyIndicator();
						}.bind(this)).catch(function (e) {
						MessageToast.show("Error in posting data");
						com.digiArtitus.EndGlobalBusyIndicator();
					});
				}
			},

			onCollectionDialogClose: function () {
				this.oViewModel.setProperty("/COLLECTION_NAME", "");
				this._collectionDialog().close();
			},

			/* =========================================================== */
			/* collection event handlers - end                             */
			/* =========================================================== */

			/* =========================================================== */
			/* menu event handlers - start                                 */
			/* =========================================================== */

			_menuDialog: function () {
				if (!this.menuDialog) {
					var oView = this._oView;
					this.menuDialog = sap.ui.xmlfragment(oView.getId(), "com.digiArtitus.fragment.database-menu", this);
					oView.addDependent(this.menuDialog);
					// sync compact style
					jQuery.sap.syncStyleClass("sapUiSizeCompact", oView, this.menuDialog);
				}
				return this.menuDialog;
			},

			onMenuListPress: function (oEvent) {
				var oData = oEvent.getParameter("listItem").getBindingContext("oViewModel").getObject();
				this.oViewModel.setProperty("/SELECTED_MENU_NAME", oData.NAME);
				this._oInstance._listFilter("items-list-id", "MENU", oData.NAME);
			},

			onMenuLoadImagePress: function () {
				this._oInstance._fileUploaderLoad("menu-file-uploader-id", "MENU_UPLOADER_FILE", "MENU_UPLOADER_EDIT_FLAG",
					"MENU_UPLOADER_EDIT_CHANGE_FLAG", "MENU_PREVIEW_UPLOADER_FILE", "MENU_PREVIEW_VISIBLE");
			},

			onMenuRemoveImagePress: function () {
				this._oInstance._fileUploaderUnLoad("menu-file-uploader-id", "MENU_UPLOADER_FILE", "MENU_UPLOADER_EDIT_CHANGE_FLAG",
					"MENU_PREVIEW_UPLOADER_FILE", "MENU_PREVIEW_VISIBLE");
			},

			onMenuDialogClose: function () {
				// clear all property
				this.onMenuRemoveImagePress();
				this.oViewModel.setProperty("/MENU_NAME", "");
				this._menuDialog().close();
			},

			onMenuListEditPress: function (oEvent) {
				var oSource = oEvent.getSource();
				var oData = oSource.getBindingContext("oViewModel").getObject();
				this.oViewModel.setProperty("/MENU_UPLOADER_EDIT_FLAG", true);
				this.MENU_EDIT_DATA = oData;
				this.oViewModel.setProperty("/MENU_NAME", oData.NAME);
				this.oViewModel.setProperty("/MENU_PREVIEW_VISIBLE", true);
				this.oViewModel.setProperty("/MENU_PREVIEW_UPLOADER_FILE", oData.IMAGE_URL);
				this._menuDialog().open();
			},

			onMenuSave: function () {
				// collect input controls
				var that = this._oInstance;
				// var oCore = sap.ui.getCore();
				var oView = this._oView;
				var docData = {};
				var aInputs = [
					oView.byId("menu-name-id")
				];
				var bValidationError = false;
				// Create a storage root reference
				var storageRef = firebase.storage().ref();

				// check that inputs are not empty
				// this does not happen during data binding as this is only triggered by changes
				jQuery.each(aInputs, function (i, oInput) {
					bValidationError = that._validateInput(oInput) || bValidationError;
				});

				// check for image
				if (this.oViewModel.getProperty("/MENU_PREVIEW_UPLOADER_FILE") === "") {
					MessageToast.show("Add an image to create record!");
					return;
				}

				if (bValidationError) {
					MessageToast.show("A validation error has occurred. Complete your input first");
					return;
				}

				com.digiArtitus.StartGlobalBusyIndicator();

				var fnSuccess = function () {
					this._menuDialog().close();
					// clear all property
					this.onMenuRemoveImagePress();
					this.oViewModel.setProperty("/MENU_UPLOADER_EDIT_CHANGE_FLAG", false);
					this.oViewModel.setProperty("/MENU_NAME", "");
					com.digiArtitus.EndGlobalBusyIndicator();
				}.bind(this);

				if (this.oViewModel.getProperty("/MENU_UPLOADER_EDIT_FLAG")) {

					// add the new entry to firestore db
					docData = {
						"TIME_STAMP": firebase.firestore.Timestamp.fromDate(new Date()),
						"NAME": this.oViewModel.getProperty("/MENU_NAME")
					};

					if (this.oViewModel.getProperty("/MENU_UPLOADER_EDIT_CHANGE_FLAG")) {
						// Create a reference to the file to delete
						var imageRef = storageRef.child(this.MENU_EDIT_DATA.IMAGE_REF_PATH);

						// Delete the file
						imageRef.delete().then(() => {
							var oFile = this.oViewModel.getProperty("/MENU_UPLOADER_FILE");

							docData.IMAGE_NAME = oFile.name;

							// Create a reference to '{company_code}/MENU/{timestamp}_{file_name}'
							docData.IMAGE_REF_PATH = com.digiArtitus.companyCode + "/MENU/" + new Date().getTime() + "_" + oFile.name;

							var oImagesRef = storageRef.child(docData.IMAGE_REF_PATH);

							oImagesRef.put(oFile).then((snapshot) => {
								snapshot.ref.getDownloadURL().then((url) => {

									// add the new entry to firestore db
									docData.IMAGE_URL = url;

									this.MENU_EDIT_DATA.DOC_REF.update(docData).then(function () {
										fnSuccess();
									});

									com.digiArtitus.EndGlobalBusyIndicator();
								}).catch((error) => {
									// Handle any errors
									com.digiArtitus.EndGlobalBusyIndicator();
								});
							});
						}).catch(function (error) {
							// Handle any errors
							com.digiArtitus.EndGlobalBusyIndicator();
						});
					} else {
						this.MENU_EDIT_DATA.DOC_REF.update(docData).then(function () {
							fnSuccess();
						}).catch(function (e) {
							MessageToast.show("Error in posting data");
							com.digiArtitus.EndGlobalBusyIndicator();
						});
					}

				} else {
					var oFile = this.oViewModel.getProperty("/MENU_UPLOADER_FILE");

					// Create a reference to '{company_code}/MENU/{timestamp}_{file_name}'
					this.MENU_STORAGE_FILE_REF_PATH = com.digiArtitus.companyCode + "/MENU/" + new Date().getTime() + "_" + oFile.name;

					var oImagesRef = storageRef.child(this.MENU_STORAGE_FILE_REF_PATH);

					oImagesRef.put(oFile).then((snapshot) => {
						snapshot.ref.getDownloadURL().then((url) => {

							// add the new entry to firestore db
							docData = {
								"USER_ID": com.digiArtitus.userId,
								"USER_COMPANY_CODE": com.digiArtitus.companyCode,
								"IMAGE_REF_PATH": this.MENU_STORAGE_FILE_REF_PATH,
								"IMAGE_NAME": oFile.name,
								"IMAGE_URL": url,
								"TIME_STAMP": firebase.firestore.Timestamp.fromDate(new Date()),
								"COLLECTION": this.oViewModel.getProperty("/SELECTED_COLL_NAME"),
								"NAME": this.oViewModel.getProperty("/MENU_NAME")
							};

							com.digiArtitus.FirestoreInstance().collection("DATABASE").doc(com.digiArtitus.companyCode).collection("MENU").add(docData).then(
								function () {
									fnSuccess();
								}).catch(function (e) {
								MessageToast.show("Error in posting data");
								com.digiArtitus.EndGlobalBusyIndicator();
							});
						}).catch((error) => {
							// Handle any errors
							com.digiArtitus.EndGlobalBusyIndicator();
						});
					});
				}
			},

			/* =========================================================== */
			/* menu event handlers - end                                   */
			/* =========================================================== */

			/* =========================================================== */
			/* item event handlers - start                                 */
			/* =========================================================== */

			_itemDialog: function () {
				if (!this.itemDialog) {
					var oView = this._oView;
					this.itemDialog = sap.ui.xmlfragment(oView.getId(), "com.digiArtitus.fragment.database-item", this);
					oView.addDependent(this.itemDialog);
					// sync compact style
					jQuery.sap.syncStyleClass("sapUiSizeCompact", oView, this.itemDialog);
				}
				return this.itemDialog;
			},

			_itemDisplayDialog: function () {
				if (!this.itemDisplayDialog) {
					var oView = this._oView;
					this.itemDisplayDialog = sap.ui.xmlfragment(oView.getId(), "com.digiArtitus.fragment.database-display-item", this);
					oView.addDependent(this.itemDisplayDialog);
					// sync compact style
					jQuery.sap.syncStyleClass("sapUiSizeCompact", oView, this.itemDisplayDialog);
				}
				return this.itemDisplayDialog;
			},

			onItemListPress: function (oEvent) {
				var oData = oEvent.getParameter("listItem").getBindingContext("oViewModel").getObject();
				this._loadItemInViewModel(oData);
				this._itemDisplayDialog().open();
			},

			onDisplayItemDialogClose: function () {
				this._clearItemInViewModel();
				this._itemDisplayDialog().close();
			},

			onItemDialogClose: function () {
				this._clearItemInViewModel();
				this._itemDialog().close();
			},

			onItemListEditPress: function (oEvent) {
				var oSource = oEvent.getSource();
				var oData = oSource.getBindingContext("oViewModel").getObject();
				this.oViewModel.setProperty("/ITEM_EDIT_FLAG", true);
				this.ITEM_EDIT_DATA = oData;
				this._loadItemInViewModel(oData);
				this._itemDialog().open();
			},

			_loadItemInViewModel: function (oData) {
				this.oViewModel.setProperty("/ITEM_CODE", oData.ITEM_CODE);
				this.oViewModel.setProperty("/ITEM_NAME", oData.NAME);
				this.oViewModel.setProperty("/ITEM_DESC", oData.DESCRIPTION);
				this.oViewModel.setProperty("/ITEM_TAX", oData.TAX);
				this.oViewModel.setProperty("/ITEM_NET_PRICE", oData.NET_PRICE);
				this.oViewModel.setProperty("/ITEM_SALE_PRICE", oData.SALE_PRICE);
				this.oViewModel.setProperty("/ITEM_RANGE_OF_PROD", oData.RANGE_OF_PRODUCTS);
				this.oViewModel.setProperty("/ITEM_RANGE_OF_PROD_ITEMS", oData.RANGE_OF_PRODUCTS_ITEMS);
				this.oViewModel.setProperty("/ITEM_ACTIVE", oData.ACTIVE);
				this.oViewModel.setProperty("/ITEM_PREVIEW_VISIBLE", true);
				this.oViewModel.setProperty("/ITEM_PREVIEW_UPLOADER_FILE", oData.IMAGE_URL);
			},

			_clearItemInViewModel: function () {
				this.oViewModel.setProperty("/ITEM_CODE", "");
				this.oViewModel.setProperty("/ITEM_NAME", "");
				this.oViewModel.setProperty("/ITEM_DESC", "");
				this.oViewModel.setProperty("/ITEM_TAX", "");
				this.oViewModel.setProperty("/ITEM_NET_PRICE", "");
				this.oViewModel.setProperty("/ITEM_SALE_PRICE", "");
				this.oViewModel.setProperty("/ITEM_RANGE_OF_PROD", false);
				this.oViewModel.setProperty("/ITEM_RANGE_OF_PROD_ITEMS", []);
				this.oViewModel.setProperty("/ITEM_ACTIVE", true);
				this.oViewModel.setProperty("/ITEM_PREVIEW_VISIBLE", false);
				this.oViewModel.setProperty("/ITEM_PREVIEW_UPLOADER_FILE", "");
			},

			onItemSave: function () {

				var bEditFlag = this.oViewModel.getProperty("/ITEM_EDIT_FLAG");

				// on edit check changes
				if (bEditFlag) {
					var oldDocData = {
						"ITEM_CODE": this.ITEM_EDIT_DATA.ITEM_CODE,
						"NAME": this.ITEM_EDIT_DATA.NAME,
						"DESCRIPTION": this.ITEM_EDIT_DATA.DESCRIPTION,
						"TAX": this.ITEM_EDIT_DATA.ITEM_TAX,
						"NET_PRICE": this.ITEM_EDIT_DATA.NET_PRICE,
						"SALE_PRICE": this.ITEM_EDIT_DATA.SALE_PRICE,
						"RANGE_OF_PRODUCTS": this.ITEM_EDIT_DATA.RANGE_OF_PRODUCTS,
						"RANGE_OF_PRODUCTS_ITEMS": this.ITEM_EDIT_DATA.RANGE_OF_PRODUCTS_ITEMS,
						"ACTIVE": this.ITEM_EDIT_DATA.ACTIVE
					};
					var newDocData = {
						"ITEM_CODE": this.oViewModel.getProperty("/ITEM_CODE"),
						"NAME": this.oViewModel.getProperty("/ITEM_NAME"),
						"DESCRIPTION": this.oViewModel.getProperty("/ITEM_DESC"),
						"TAX": this.oViewModel.getProperty("/ITEM_TAX"),
						"NET_PRICE": this.oViewModel.getProperty("/ITEM_NET_PRICE"),
						"SALE_PRICE": this.oViewModel.getProperty("/ITEM_SALE_PRICE"),
						"RANGE_OF_PRODUCTS": this.oViewModel.getProperty("/ITEM_RANGE_OF_PROD"),
						"RANGE_OF_PRODUCTS_ITEMS": this.oViewModel.getProperty("/ITEM_RANGE_OF_PROD_ITEMS"),
						"ACTIVE": this.oViewModel.getProperty("/ITEM_ACTIVE")
					};

					if (JSON.stringify(oldDocData) === JSON.stringify(newDocData)) {
						MessageToast.show("No changes found to save!");
						return;
					}
				}

				// collect input controls
				var that = this;
				// var oCore = sap.ui.getCore();
				var oView = this._oView;
				var aInputs = [
					oView.byId("item-code-id"),
					oView.byId("item-name-id"),
					oView.byId("item-description-id")
				];
				// check not for range of entries
				if (!this.oViewModel.getProperty("/ITEM_RANGE_OF_PROD")) {
					aInputs.push(oView.byId("item-tax-id"));
					aInputs.push(oView.byId("item-net-price-id"));
					aInputs.push(oView.byId("item-sale-price-id"));
				}

				var bValidationError = false;
				var docData;
				// Create a storage root reference
				var storageRef = firebase.storage().ref();

				// check that inputs are not empty
				// this does not happen during data binding as this is only triggered by changes
				jQuery.each(aInputs, function (i, oInput) {
					bValidationError = that._oInstance._validateInput(oInput) || bValidationError;
				});

				// check not for range of entries
				if (this.oViewModel.getProperty("/ITEM_RANGE_OF_PROD")) {
					var aRangeOfProdItems = this.oViewModel.getProperty("/ITEM_RANGE_OF_PROD_ITEMS");
					bValidationError = aRangeOfProdItems.length === 0;
				}

				// check for image
				if (this.oViewModel.getProperty("/ITEM_PREVIEW_UPLOADER_FILE") === "") {
					MessageToast.show("Add an image to create record!");
					return;
				}

				if (bValidationError) {
					MessageToast.show("A validation error has occurred. Complete your input first");
					return;
				}

				com.digiArtitus.StartGlobalBusyIndicator();

				var fnSuccess = function () {
					this._itemDialog().close();
					// clear all property
					this.onItemRemoveImagePress();
					this.oViewModel.setProperty("/ITEM_UPLOADER_EDIT_CHANGE_FLAG", false);
					this._clearItemInViewModel();
					com.digiArtitus.EndGlobalBusyIndicator();
				}.bind(this);

				if (bEditFlag) {

					// add the new entry to firestore db
					docData = {
						"TIME_STAMP": firebase.firestore.Timestamp.fromDate(new Date()),
						"ITEM_CODE": this.oViewModel.getProperty("/ITEM_CODE"),
						"NAME": this.oViewModel.getProperty("/ITEM_NAME"),
						"DESCRIPTION": this.oViewModel.getProperty("/ITEM_DESC"),
						"TAX": this.oViewModel.getProperty("/ITEM_TAX"),
						"NET_PRICE": this.oViewModel.getProperty("/ITEM_NET_PRICE"),
						"SALE_PRICE": this.oViewModel.getProperty("/ITEM_SALE_PRICE"),
						"RANGE_OF_PRODUCTS": this.oViewModel.getProperty("/ITEM_RANGE_OF_PROD"),
						"RANGE_OF_PRODUCTS_ITEMS": this.oViewModel.getProperty("/ITEM_RANGE_OF_PROD_ITEMS"),
						"ACTIVE": this.oViewModel.getProperty("/ITEM_ACTIVE")
					};

					if (this.oViewModel.getProperty("/ITEM_UPLOADER_EDIT_CHANGE_FLAG")) {
						// Create a reference to the file to delete
						var imageRef = storageRef.child(this.ITEM_EDIT_DATA.IMAGE_REF_PATH);

						// Delete the file
						imageRef.delete().then(() => {
							var oFile = this.oViewModel.getProperty("/ITEM_UPLOADER_FILE");
							docData.IMAGE_NAME = oFile.name;
							// Create a reference to '{company_code}/MENU/{timestamp}_{file_name}'
							docData.IMAGE_REF_PATH = com.digiArtitus.companyCode + "/ITEM/" + new Date().getTime() + "_" + oFile.name;
							var oImagesRef = storageRef.child(docData.IMAGE_REF_PATH);
							oImagesRef.put(oFile).then((snapshot) => {
								snapshot.ref.getDownloadURL().then((url) => {
									// add the new entry to firestore db
									docData.IMAGE_URL = url;
									this.ITEM_EDIT_DATA.DOC_REF.update(docData).then(function () {
										fnSuccess();
									});
									com.digiArtitus.EndGlobalBusyIndicator();
								}).catch((error) => {
									// Handle any errors
									com.digiArtitus.EndGlobalBusyIndicator();
								});
							});
						}).catch(function (error) {
							// Handle any errors
							com.digiArtitus.EndGlobalBusyIndicator();
						});
					} else {
						this.ITEM_EDIT_DATA.DOC_REF.update(docData).then(function () {
							fnSuccess();
						}).catch(function (e) {
							MessageToast.show("Error in posting data");
							com.digiArtitus.EndGlobalBusyIndicator();
						});
					}

				} else {
					var oFile = this.oViewModel.getProperty("/ITEM_UPLOADER_FILE");

					docData = {
						"USER_ID": com.digiArtitus.userId,
						"USER_COMPANY_CODE": com.digiArtitus.companyCode,
						"IMAGE_REF_PATH": com.digiArtitus.companyCode + "/ITEM/" + new Date().getTime() + "_" + oFile.name,
						"IMAGE_NAME": oFile.name,
						"TIME_STAMP": firebase.firestore.Timestamp.fromDate(new Date()),
						"COLLECTION": this.oViewModel.getProperty("/SELECTED_COLL_NAME"),
						"MENU": this.oViewModel.getProperty("/SELECTED_MENU_NAME"),
						"ITEM_CODE": this.oViewModel.getProperty("/ITEM_CODE"),
						"NAME": this.oViewModel.getProperty("/ITEM_NAME"),
						"DESCRIPTION": this.oViewModel.getProperty("/ITEM_DESC"),
						"TAX": this.oViewModel.getProperty("/ITEM_TAX"),
						"NET_PRICE": this.oViewModel.getProperty("/ITEM_NET_PRICE"),
						"SALE_PRICE": this.oViewModel.getProperty("/ITEM_SALE_PRICE"),
						"RANGE_OF_PRODUCTS": this.oViewModel.getProperty("/ITEM_RANGE_OF_PROD"),
						"RANGE_OF_PRODUCTS_ITEMS": this.oViewModel.getProperty("/ITEM_RANGE_OF_PROD_ITEMS"),
						"ACTIVE": this.oViewModel.getProperty("/ITEM_ACTIVE")
					};

					var oImagesRef = storageRef.child(docData.IMAGE_REF_PATH);

					oImagesRef.put(oFile).then((snapshot) => {
						snapshot.ref.getDownloadURL().then((url) => {
							// add the url to data object
							docData.IMAGE_URL = url;

							com.digiArtitus.FirestoreInstance().collection("DATABASE").doc(com.digiArtitus.companyCode).collection("ITEMS").add(docData).then(
								function () {
									fnSuccess();
								}).catch(function (e) {
								MessageToast.show("Error in posting data");
								com.digiArtitus.EndGlobalBusyIndicator();
							});
						}).catch((error) => {
							// Handle any errors
							com.digiArtitus.EndGlobalBusyIndicator();
						});
					});
				}
			},

			onItemLoadImagePress: function () {
				this._oInstance._fileUploaderLoad("item-file-uploader-id", "ITEM_UPLOADER_FILE", "ITEM_EDIT_FLAG", "ITEM_UPLOADER_EDIT_CHANGE_FLAG",
					"ITEM_PREVIEW_UPLOADER_FILE", "ITEM_PREVIEW_VISIBLE");
			},

			onItemRemoveImagePress: function () {
				this._oInstance._fileUploaderUnLoad("item-file-uploader-id", "ITEM_UPLOADER_FILE", "ITEM_UPLOADER_EDIT_CHANGE_FLAG",
					"ITEM_PREVIEW_UPLOADER_FILE", "ITEM_PREVIEW_VISIBLE");
			},

			/* =========================================================== */
			/* item event handlers - end                                   */
			/* =========================================================== */

			/* =========================================================== */
			/* range event handlers - start                                */
			/* =========================================================== */

			_rangeItemDialog: function () {
				if (!this.rangeItemDialog) {
					var oView = this._oView;
					this.rangeItemDialog = sap.ui.xmlfragment(oView.getId(), "com.digiArtitus.fragment.database-range", this);
					oView.addDependent(this.rangeItemDialog);
					// sync compact style
					jQuery.sap.syncStyleClass("sapUiSizeCompact", oView, this.rangeItemDialog);
				}
				return this.rangeItemDialog;
			},

			onRangeItemAddPress: function (oEvent) {
				this._clearRangeInputs();
				this._rangeItemDialog().open();
			},

			onRangeItemClosePress: function (oEvent) {
				this._clearRangeInputs();
				this._rangeItemDialog().close();
			},

			onRangeItemEditPress: function (oEvent) {
				var oBindingContext = oEvent.getSource().getBindingContext("oViewModel");
				var oData = oBindingContext.getObject();
				this._setRangeInputs(oData);
				this.RANGE_ITEM_EDIT_BINDING_CONTEXT = oBindingContext;
				this.RANGE_ITEM_EDIT_PRESS = true;
				this._rangeItemDialog().open();
			},

			onRangeItemDeletePress: function (oEvent) {
				var oSource = oEvent.getSource();
				var sPath = oSource.getBindingContext("oViewModel").getPath();
				var iIndex = sPath.substr(sPath.lastIndexOf("/") + 1);
				// delete selected item
				var aRangeOfItems = this.oViewModel.getProperty("/ITEM_RANGE_OF_PROD_ITEMS");
				aRangeOfItems.splice(iIndex, 1);
				this.oViewModel.setProperty("/ITEM_RANGE_OF_PROD_ITEMS", aRangeOfItems);
			},

			_setRangeInputs: function (oData) {
				this.oViewModel.setProperty("/RANGE_ITEM_DESC", oData.DESCRIPTION);
				this.oViewModel.setProperty("/RANGE_ITEM_TAX", oData.TAX);
				this.oViewModel.setProperty("/RANGE_ITEM_NET_PRICE", oData.NET_PRICE);
				this.oViewModel.setProperty("/RANGE_ITEM_SALE_PRICE", oData.SALE_PRICE);
			},

			_clearRangeInputs: function () {
				this.oViewModel.setProperty("/RANGE_ITEM_DESC", "");
				this.oViewModel.setProperty("/RANGE_ITEM_TAX", "");
				this.oViewModel.setProperty("/RANGE_ITEM_NET_PRICE", "");
				this.oViewModel.setProperty("/RANGE_ITEM_SALE_PRICE", "");
			},

			onRangeItemSavePress: function () {
				// collect input controls
				var that = this;
				var oView = this._oView;
				var aInputs = [
					oView.byId("item-range-description-id"),
					oView.byId("item-range-tax-id"),
					oView.byId("item-range-net-price-id"),
					oView.byId("item-range-sale-price-id")
				];

				var bValidationError = false;

				// check that inputs are not empty
				// this does not happen during data binding as this is only triggered by changes
				jQuery.each(aInputs, function (i, oInput) {
					bValidationError = that._oInstance._validateInput(oInput) || bValidationError;
				});

				if (bValidationError) {
					MessageToast.show("A validation error has occurred. Complete your input first");
					return;
				}

				var oData = {
					"DESCRIPTION": aInputs[0].getValue(),
					"TAX": aInputs[1].getValue(),
					"NET_PRICE": aInputs[2].getValue(),
					"SALE_PRICE": aInputs[3].getValue()
				};

				if (this.RANGE_ITEM_EDIT_PRESS) {
					if (JSON.stringify(this.RANGE_ITEM_EDIT_BINDING_CONTEXT.getObject()) === JSON.stringify(oData)) {
						MessageToast.show("No changes found.");
						return;
					}
					var sPath = this.RANGE_ITEM_EDIT_BINDING_CONTEXT.getPath();
					this.oViewModel.setProperty(sPath + "/DESCRIPTION", aInputs[0].getValue());
					this.oViewModel.setProperty(sPath + "/TAX", aInputs[1].getValue());
					this.oViewModel.setProperty(sPath + "/NET_PRICE", aInputs[2].getValue());
					this.oViewModel.setProperty(sPath + "/SALE_PRICE", aInputs[3].getValue());
				} else {
					var aData = this.oViewModel.getProperty("/ITEM_RANGE_OF_PROD_ITEMS");
					aData.push(oData);
					this.oViewModel.setProperty("/ITEM_RANGE_OF_PROD_ITEMS", aData);
				}

				this._rangeItemDialog().close();
			}

			/* =========================================================== */
			/* range event handlers - end                                  */
			/* =========================================================== */

		});

	});