/* global firebase */

sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"com/digiArtitus/controller/User",
	"com/digiArtitus/controller/Banner",
	"com/digiArtitus/controller/Chart",
	"com/digiArtitus/controller/Database",
	"com/digiArtitus/controller/Orders",
	"sap/ui/model/json/JSONModel",
	"com/digiArtitus/model/formatter",
	"sap/ui/model/Filter",
	"sap/m/MessageBox",
	"sap/m/MessageToast"
], function (Controller, User, Banner, Chart, Database, Orders, JSONModel, formatter, Filter, MessageBox, MessageToast) {
	"use strict";

	return Controller.extend("com.digiArtitus.controller.Main", {

		formatter: formatter,

		model: new JSONModel(),

		onInit: function () {
			// apply content density mode to root view
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());

			// load user object
			this.user = new User(this);

			// load banner object
			this.banner = new Banner(this);

			// load chart object
			this.chart = new Chart(this);

			// load chart object
			this.database = new Database(this);

			// load orders object
			this.orders = new Orders(this);

			// load user data
			this.user.checkForLogin().then(function () {
				this.user.loadUserData().then(function () {
					this.banner.liveBannerCollectionUpdates();
					this.banner.liveBannerItemsUpdates();
					this.database.liveDatabaseCollectionUpdates();
					this.database.liveDatabaseMenuUpdates();
					this.database.liveDatabaseItemUpdates();
					this.orders.liveOrders();
				}.bind(this));
			}.bind(this));

		},

		onToogleNavButtonPress: function () {
			var _setToggleButtonTooltip = function (bLarge) {
				var toggleButton = this.byId("sideNavigationToggleButton");
				if (bLarge) {
					toggleButton.setTooltip("Expand");
				} else {
					toggleButton.setTooltip("Collapse");
				}
			}.bind(this);

			var viewId = this.getView().getId();
			var toolPage = sap.ui.getCore().byId(viewId + "--toolPage");
			var sideExpanded = toolPage.getSideExpanded();

			_setToggleButtonTooltip(sideExpanded);

			toolPage.setSideExpanded(!toolPage.getSideExpanded());
		},

		onSideNavItemSelect: function (oEvent) {
			// logout
			if (oEvent.getParameter("item").getProperty("text") === "Logout") {
				this._logout();
			}

			// billing page set defaults
			if (oEvent.getParameter("item").getProperty("text") === "Billing") {
				this._billingPageDefaults();
			}

			// settings
			if (oEvent.getParameter("item").getProperty("text") === "Settings") {
				this._settingsPageDefaults();
			}

			var item = oEvent.getParameter("item");
			var viewId = this.getView().getId();
			sap.ui.getCore().byId(viewId + "--pageContainer").to(viewId + "--" + item.getKey());
		},

		onListUpdateFinished: function (oEvent) {
			// fire select first item if present
			var iTotal = oEvent.getParameter("total"),
				oSource = oEvent.getSource();

			if (iTotal === 0) {
				var oViewModel = this.getView().getModel("oViewModel"),
					oViewData = oViewModel.getData();

				if (oSource.getId().search("banner-item-list-id") !== -1) {
					oViewData.BANNER_ITEM_PREVIEW = "";
				}

				// update bindings
				oViewModel.refresh();

				return;
			}

			var aItems = oSource.getItems();

			// set selected first item
			oSource.setSelectedItem(aItems[0], true);
			// aItems[0].firePress();
			oSource.fireItemPress({
				listItem: aItems[0],
				srcControl: oSource
			});
		},

		onBannerCollectionListPress: function (oEvent) {
			var oData = oEvent.getParameter("listItem").getBindingContext("oViewModel").getObject();
			this._listItemFilter("banner-item-list-id", "BANNER_COLLECTION", oData.NAME);
		},

		onBannerItemListPress: function (oEvent) {
			var oViewModel = this.getView().getModel("oViewModel"),
				oViewData = oViewModel.getData(),
				oListItem = oEvent.getParameter("listItem"),
				sImageURL = "";

			if (oListItem) {
				sImageURL = oListItem.getBindingContext("oViewModel").getObject().IMAGE_URL;
			}

			oViewData.BANNER_ITEM_PREVIEW = sImageURL;

			// update bindings
			oViewModel.refresh();
		},

		_listItemFilter: function (sListId, sFieldName, sFieldValue) {
			var oList = this.getView().byId(sListId),
				oBinding = oList.getBinding("items"),
				oFilter;

			oFilter = new Filter("BANNER_COLLECTION", "EQ", sFieldValue);
			oBinding.filter([oFilter]);
		},

		_validateInput: function (oInput) {
			var oBinding = oInput.getBinding("value"),
				sValueState = "None",
				bValidationError = false;

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

		onBannerCollectionDialogAddPress: function () {
			this.banner._bannerCollectionDialog().open();
		},

		onBannerCollectionListEditPress: function (oEvent) {
			this.banner.bannerCollectionEdit(oEvent);
		},

		onBannerCollectionListDeletePress: function (oEvent) {
			this._deleteEntry(oEvent, false);
		},

		onBannerItemAddPress: function () {
			this.banner._bannerItemDialog().open();
		},

		// onBannerItemDialogClose: function () {
		// 	this.banner._bannerItemDialog().close();
		// },

		onBannerItemListDeletePress: function (oEvent) {
			this._deleteEntry(oEvent, true);
		},

		onBannerItemListEditPress: function (oEvent) {
			this.banner.bannerItemEdit(oEvent);
		},

		onCollectionDialogAddPress: function () {
			this.database._collectionDialog().open();
		},

		onCollectionListPress: function (oEvent) {
			this.database.onCollectionListPress(oEvent);
		},

		onCollectionListEditPress: function (oEvent) {
			this.database.onCollectionListEditPress(oEvent);
		},

		onCollectionListDeletePress: function (oEvent) {
			this._deleteEntry(oEvent, false);
		},

		onMenuListPress: function (oEvent) {
			this.database.onMenuListPress(oEvent);
		},

		onMenuListEditPress: function (oEvent) {
			this.database.onMenuListEditPress(oEvent);
		},

		onMenuDialogAddPress: function () {
			this.database._menuDialog().open();
		},

		onMenuListDeletePress: function (oEvent) {
			this._deleteEntry(oEvent, true);
		},

		onItemDialogAddPress: function () {
			this.database._itemDialog().open();
		},
		
		onItemListPress: function (oEvent) {
			this.database.onItemListPress(oEvent);
		},

		onItemListDeletePress: function (oEvent) {
			this._deleteEntry(oEvent, true);
		},
		
		onItemListEditPress: function (oEvent) {
			this.database.onItemListEditPress(oEvent);
		},

		onOrdersToggleBtn: function (oEvent) {
			this.orders.toggleOrders(oEvent);
		},

		onDataExport: function (oEvent) {
			this.orders.ordersExport();
		},

		_deleteEntry: function (oEvent, bRemoveImage) {
			var oSource = oEvent.getSource();
			var oData = oSource.getBindingContext("oViewModel").getObject();

			var fnWarningMessage = function () {
				var deferred = $.Deferred();
				var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
				MessageBox.warning(
					"Confirm to delete", {
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

			$.when(fnWarningMessage()).done(function (_) {
				com.digiArtitus.StartGlobalBusyIndicator();

				var fnRemoveData = function () {
					// File deleted successfully
					oData.DOC_REF.delete().then(function () {
						com.digiArtitus.EndGlobalBusyIndicator();
					}).catch(function (e) {
						MessageToast.show("Error in posting data");
						com.digiArtitus.EndGlobalBusyIndicator();
					});
				};

				if (bRemoveImage) {
					// Create a storage root reference
					var storageRef = firebase.storage().ref();
					// Create a reference to the file to delete
					var imageRef = storageRef.child(oData.IMAGE_REF_PATH);
					// Delete the file
					imageRef.delete().then(fnRemoveData).catch(function (error) {
						// Uh-oh, an error occurred!
						com.digiArtitus.EndGlobalBusyIndicator();
					});
				} else {
					fnRemoveData();
				}

			});
		},

		_fileUploaderUnLoad: function (sFileUploaderId, sFileProperty, bFileChangedFlag, sPreviewFile, bPreviewFlag) {
			var oFileUploader = this.getView().byId(sFileUploaderId),
				oViewModel = this.getView().getModel("oViewModel"),
				oViewData = oViewModel.getData();

			oFileUploader.setValue("");
			oViewData[sFileProperty] = null;
			oViewData[bFileChangedFlag] = false;
			oViewData[sPreviewFile] = "";
			oViewData[bPreviewFlag] = false;

			// update model data
			oViewModel.refresh();
		},

		_fileUploaderLoad: function (sFileUploaderId, sFileProperty, bEditFlag, bFileChangedFlag, sPreviewFile, bPreviewFlag) {
			var oFileUploader = this.getView().byId(sFileUploaderId),
				oViewModel = this.getView().getModel("oViewModel"),
				oViewData = oViewModel.getData();

			if (!oFileUploader.getValue()) {
				MessageToast.show("Choose a file first");
				return;
			}
			//save the file in browser temp and save at the time of submission
			var oFile = jQuery.sap.domById(oFileUploader.getId() + "-fu").files[0];
			//format to file size
			var fnFormatBytes = function (a, b) {
				if (a === 0) {
					return "0 Bytes";
				}
				var c = 1024,
					d = b || 2,
					e = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
					f = Math.floor(Math.log(a) / Math.log(c));
				return parseFloat((a / Math.pow(c, f)).toFixed(d)) + " " + e[f];
			};
			var iMaxFileSize = oViewData.MAX_FILE_ATTACHMENT_SIZE; //3 MB
			//check file size
			if (oFile.size > iMaxFileSize) {
				MessageToast.show(
					"File size " +
					fnFormatBytes(oFile.size) +
					" exceeding " +
					fnFormatBytes(iMaxFileSize)
				);
				// end global busy indicator
				com.digiArtitus.EndGlobalBusyIndicator();
				return;
			}
			var oReader;
			if (oFile) {

				oViewData[sFileProperty] = oFile;

				// reader to read file content
				oReader = new FileReader();

				//fileLoad promise
				oReader.onload = function () {
					// check for edit flag
					if (oViewData[bEditFlag]) {
						oViewData[bFileChangedFlag] = true;
					}

					oViewData[sPreviewFile] = oReader.result;
					oViewData[bPreviewFlag] = true;

					//clear file uploder values
					oFileUploader.setValue("");

					// update model data
					oViewModel.refresh();
				};
				//read as base64 format
				oReader.readAsDataURL(oFile);
			}
		},

		_listFilter: function (sId, sField, sValue) {
			var oList = this.getView().byId(sId);
			var oFilter = new Filter(sField, sap.ui.model.FilterOperator.EQ, sValue);
			var oBinding = oList.getBinding("items");
			oBinding.filter([oFilter]);
		}

	});
});