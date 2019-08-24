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

			liveBannerCollectionUpdates: function () {
				var fnSuccess = function (querySnapshot) {
					var oViewData = this.oViewModel.getData();
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
					oViewData.BANNER_COLLECTION = aData;

					// update model data
					this.oViewModel.refresh();
				}.bind(this);

				this._oInstance.bannerCollectionUnsubscribe = 
					com.digiArtitus
						.FirestoreInstance()
						.collection("DATABASE")
						.doc(com.digiArtitus.companyCode)
						.collection("BANNER_COLLECTION")
						.onSnapshot(fnSuccess);
			},

			liveBannerItemsUpdates: function () {
				var fnSuccess = function (querySnapshot) {
					var oViewData = this.oViewModel.getData();
					var aData = [];
					querySnapshot.forEach(function (doc) {
						aData.push({
							"DOC_REF": doc.ref,
							"USER_ID": doc.data().USER_ID,
							"NAME": doc.data().NAME,
							"INITIALS": doc.data().NAME.substr(0, 1),
							"TIME_STAMP": moment(doc.data().TIME_STAMP).format("Do MMM YYYY"),
							"BANNER_COLLECTION": doc.data().BANNER_COLLECTION,
							"IMAGE_NAME": doc.data().IMAGE_NAME,
							"IMAGE_URL": doc.data().IMAGE_URL,
							"IMAGE_REF_PATH": doc.data().IMAGE_REF_PATH
						});
					});

					// update banner data
					oViewData.BANNER_ITEMS = aData;

					// update model data
					this.oViewModel.refresh();
				}.bind(this);

				this._oInstance.bannerItemUnsubscribe = 
					com.digiArtitus
						.FirestoreInstance()
						.collection("DATABASE")
						.doc(com.digiArtitus.companyCode)
						.collection("BANNER_ITEMS")
						.onSnapshot(fnSuccess);
			},

			onBannerCollectionSave: function () {
				var oViewData = this.oViewModel.getData();
				var oView = this._oView;
				var aInputs = [
					oView.byId("banner-collection-name-id")
				];
				var bValidationError = false;

				// check that inputs are not empty
				// this does not happen during data binding as this is only triggered by changes
				jQuery.each(aInputs, function (i, oInput) {
					bValidationError = this._validateInput(oInput) || bValidationError;
				}.bind(this._oInstance));

				if (bValidationError) {
					MessageToast.show("A validation error has occurred. Complete your input first");
					return;
				}

				com.digiArtitus.StartGlobalBusyIndicator();

				var docData = {
					"NAME": oViewData.BANNER_COLLECTION_NAME,
					"TIME_STAMP": firebase.firestore.Timestamp.fromDate(new Date())
				};

				if (this.BANNER_COLLECTION_EDIT_FLAG) {
					this.BANNER_COLLECTION_EDIT_DATA.DOC_REF.update(docData).then(function () {
						this._bannerCollectionDialog().close();
						this.BANNER_COLLECTION_EDIT_FLAG = false;
						oViewData.BANNER_COLLECTION_NAME = "";

						this.oViewModel.refresh();

						com.digiArtitus.EndGlobalBusyIndicator();
					}.bind(this)).catch(function (e) {
						MessageToast.show("Error in posting data");

						com.digiArtitus.EndGlobalBusyIndicator();
					});
				} else {
					docData.USER_ID = com.digiArtitus.userId;
					com.digiArtitus.FirestoreInstance().collection("DATABASE").doc(com.digiArtitus.companyCode).collection("BANNER_COLLECTION").add(
						docData).then(
						function () {
							oViewData.BANNER_COLLECTION_NAME = "";
							this.oViewModel.refresh();
							this._bannerCollectionDialog().close();
							com.digiArtitus.EndGlobalBusyIndicator();
						}.bind(this)).catch(function (e) {
						MessageToast.show("Error in posting data");
					});
				}
			},

			onBannerItemSave: function () {
				// collect input controls
				var oViewData = this.oViewModel.getData(),
					oView = this._oView,
					aInputs = [oView.byId("banner-item-name-id")],
					bValidationError = false,
					docData,
					// Create a storage root reference
					storageRef = firebase.storage().ref();

				// check this inputs are not empty
				// this does not happen during data binding as this is only triggered by changes
				jQuery.each(aInputs, function (i, oInput) {
					bValidationError = this._validateInput(oInput) || bValidationError;
				}.bind(this._oInstance));

				// check for image
				if (oViewData.ANNER_ITEM_PREVIEW_UPLOADER_FILE === "") {
					MessageToast.show("Add an image to create record!");
					return;
				}

				if (bValidationError) {
					MessageToast.show("A validation error has occurred. Complete your input first");
					return;
				}

				com.digiArtitus.StartGlobalBusyIndicator();

				var fnSuccess = function () {
					this._bannerItemDialog().close();

					// clear all property
					this.onBannerItemRemoveImagePress();

					oViewData.BANNER_ITEM_UPLOADER_EDIT_CHANGE_FLAG = false;
					oViewData.BANNER_ITEM_NAME = "";

					// update model data
					this.oViewModel.refresh();

					com.digiArtitus.EndGlobalBusyIndicator();
				}.bind(this);

				if (oViewData.BANNER_ITEM_UPLOADER_EDIT_FLAG) {

					// add the new entry to firestore db
					docData = {
						"TIME_STAMP": firebase.firestore.Timestamp.fromDate(new Date()),
						"NAME": oViewData.BANNER_ITEM_NAME
					};

					if (oViewData.BANNER_ITEM_UPLOADER_EDIT_CHANGE_FLAG) {
						// Create a reference to the file to delete
						var imageRef = storageRef.child(this.BANNER_ITEM_EDIT_DATA.IMAGE_REF_PATH);

						// Delete the file
						imageRef.delete().then(() => {
							var oFile = oViewData.BANNER_ITEM_UPLOADER_FILE;

							docData.IMAGE_NAME = oFile.name;

							// Create a reference to '{company_code}/BANNER/{timestamp}_{file_name}'
							docData.IMAGE_REF_PATH = com.digiArtitus.companyCode + "/BANNER/" + new Date().getTime() + "_" + oFile.name;

							var oImagesRef = storageRef.child(docData.IMAGE_REF_PATH);

							oImagesRef.put(oFile).then((snapshot) => {
								snapshot.ref.getDownloadURL().then((url) => {
									// add the new entry to firestore db
									docData.IMAGE_URL = url;
									this.BANNER_ITEM_EDIT_DATA.DOC_REF.update(docData).then(fnSuccess);
								});
							});
						});
					} else {
						this.BANNER_ITEM_EDIT_DATA.DOC_REF.update(docData).then(function () {
							fnSuccess();
						}).catch(function (e) {
							MessageToast.show("Error in posting data");
							com.digiArtitus.EndGlobalBusyIndicator();
						});
					}

				} else {
					var oFile = oViewData.BANNER_ITEM_UPLOADER_FILE;

					docData = {
						"USER_ID": com.digiArtitus.userId,
						"USER_COMPANY_CODE": com.digiArtitus.companyCode,
						"IMAGE_NAME": oFile.name,
						"TIME_STAMP": firebase.firestore.Timestamp.fromDate(new Date()),
						"BANNER_COLLECTION": oViewData.SELECTED_BANNER_COLL_NAME,
						"NAME": oViewData.BANNER_ITEM_NAME
					};

					// Create a reference to '{company_code}/BANNER/{timestamp}_{file_name}'
					docData.IMAGE_REF_PATH = com.digiArtitus.companyCode + "/BANNER/" + new Date().getTime() + "_" + oFile.name;

					var oImagesRef = storageRef.child(docData.IMAGE_REF_PATH);
					oImagesRef.put(oFile).then((snapshot) => {
						snapshot.ref.getDownloadURL().then((url) => {
							docData.IMAGE_URL = url;
							com.digiArtitus.FirestoreInstance().collection("DATABASE").doc(com.digiArtitus.companyCode).collection("BANNER_ITEMS").add(
									docData)
								.then(fnSuccess).catch(function (e) {
									MessageToast.show("Error in posting data");
									com.digiArtitus.EndGlobalBusyIndicator();
								});
						});
					});
				}
			},

			_bannerItemDialog: function () {
				if (!this.bannerItemDialog) {
					var oView = this._oView;
					this.bannerItemDialog = sap.ui.xmlfragment(oView.getId(), "com.digiArtitus.fragment.banner-item",
						this);
					oView.addDependent(this.bannerItemDialog);
					// sync compact style
					jQuery.sap.syncStyleClass("sapUiSizeCompact", oView, this.bannerItemDialog);
				}
				return this.bannerItemDialog;
			},

			_bannerCollectionDialog: function () {
				if (!this.bannerCollectionDialog) {
					var oView = this._oView;
					this.bannerCollectionDialog = sap.ui.xmlfragment(oView.getId(),
						"com.digiArtitus.fragment.banner-collection", this);
					oView.addDependent(this.bannerCollectionDialog);
					// sync compact style
					jQuery.sap.syncStyleClass("sapUiSizeCompact", oView, this.bannerCollectionDialog);
				}
				return this.bannerCollectionDialog;
			},

			onBannerCollectionDialogClose: function () {
				this._bannerCollectionDialog().close();
			},

			bannerCollectionEdit: function (oEvent) {
				var oSource = oEvent.getSource(),
					oData = oSource.getBindingContext("oViewModel").getObject(),
					oViewData = this.oViewModel.getData();

				this.BANNER_COLLECTION_EDIT_FLAG = true;
				this.BANNER_COLLECTION_EDIT_DATA = oData;

				oViewData.BANNER_COLLECTION_NAME = oData.NAME;
				this._bannerCollectionDialog().open();

				// update model data
				this.oViewModel.refresh();
			},

			bannerItemEdit: function (oEvent) {
				var oSource = oEvent.getSource(),
					oData = oSource.getBindingContext("oViewModel").getObject(),
					oViewData = this.oViewModel.getData();

				this.BANNER_ITEM_EDIT_DATA = oData;
				oViewData.BANNER_ITEM_UPLOADER_EDIT_FLAG = true;
				oViewData.BANNER_ITEM_UPLOADER_EDIT_CHANGE_FLAG = false;
				oViewData.BANNER_ITEM_NAME = oData.NAME;
				oViewData.BANNER_ITEM_PREVIEW_VISIBLE = true;
				oViewData.BANNER_ITEM_PREVIEW_UPLOADER_FILE = oData.IMAGE_URL;
				this._bannerItemDialog().open();

				// update model data
				this.oViewModel.refresh();
			},

			onBannerItemLoadImagePress: function () {
				this._oInstance._fileUploaderLoad("banner-item-file-uploader-id", "BANNER_ITEM_UPLOADER_FILE", "BANNER_ITEM_UPLOADER_EDIT_FLAG",
					"BANNER_ITEM_UPLOADER_EDIT_CHANGE_FLAG", "BANNER_ITEM_PREVIEW_UPLOADER_FILE", "BANNER_ITEM_PREVIEW_VISIBLE");
			},

			onBannerItemRemoveImagePress: function () {
				this._oInstance._fileUploaderUnLoad("banner-item-file-uploader-id", "BANNER_ITEM_UPLOADER_FILE",
					"BANNER_ITEM_UPLOADER_EDIT_CHANGE_FLAG",
					"BANNER_ITEM_PREVIEW_UPLOADER_FILE", "BANNER_ITEM_PREVIEW_VISIBLE");
			},

			onBannerItemDialogClose: function () {
				this._bannerItemDialog().close();
			}

		});

	});