sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function (JSONModel, Device) {
	"use strict";

	return {
		
		createDeviceModel: function () {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},
		
		createNavModel: function () {
			var oModel = new JSONModel([{
				title: "Dashboard",
				icon: "sap-icon://business-objects-experience",
				key: "Dashboard",
				items: []
			}, {
				title: "Orders",
				icon: "sap-icon://customer-order-entry",
				key: "Orders",
				items: []
			}, {
				title: "Banners",
				icon: "sap-icon://background",
				key: "Banners",
				items: []
			}, {
				title: "DataBase",
				icon: "sap-icon://database",
				key: "DataManage",
				items: []
			}, {
				title: "Billing",
				icon: "sap-icon://sales-order-item",
				key: "Billing",
				items: []
			}]);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},
		
		createFixedNavModel: function () {
			var oModel = new JSONModel([{
				title: "Logout",
				icon: "sap-icon://log",
				key: "Logout"
			}, {
				title: "Settings",
				icon: "sap-icon://key-user-settings",
				key: "Settings"
			}]);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},
		
		createViewModel: function() {
			var oModel = new JSONModel({
				// LOGGED_USER_PIC: oData.USER_PIC,
				// LOGGED_USER_NAME: oData.USER_NAME,

				MAX_FILE_ATTACHMENT_SIZE: 3000000, // 3 MB

				selectedKey: "Dashboard",
				selectedTileBackground: "Light",
				tileBackground: [{
					key: "Accent",
					value: "Accent"
				}, {
					key: "Dashboard",
					value: "Dashboard"
				}, {
					key: "Default",
					value: "Default"
				}, {
					key: "Light",
					value: "Light"
				}, {
					key: "Mixed",
					value: "Mixed"
				}],

				// dashboard
				TODAY_TOTAL_PRICE: 0,
				CURRENCY: "INR",
				PERCENTAGE_DIFFERENCE: 0,

				// billing
				BILLING_TOTAL_PAYABLE: 0,
				BILLING_TOTAL_PRICE: 0,
				POS_BILLING: true,
				BILLING_ITEMS: [],
				// BILLING_DELIVERY_CHARGE: oData.BILLING_DELIVERY_CHARGE,
				// BILLING_DELIVERY_CHARGE_CHECK: oData.BILLING_DELIVERY_CHECK,

				// orders
				bOrdersAll: false,
				bOrdersToday: true,

				// COLLECTION
				COLLECTION_NAME: "",
				SELECTED_COLL_NAME: "",

				// MENU
				MENU_NAME: "",
				MENU_PREVIEW_VISIBLE: false,
				MENU_PREVIEW_UPLOADER_FILE: "",

				// ITEM
				ITEM_NAME: "",
				ITEM_CODE: "",
				ITEM_DESC: "",
				ITEM_TAX: "",
				ITEM_NET_PRICE: "",
				ITEM_SALE_PRICE: "",
				ITEM_RANGE_OF_PROD: false,
				ITEM_RANGE_OF_PROD_ITEMS: [],
				ITEM_ACTIVE: true,
				ITEM_PREVIEW_VISIBLE: false,
				ITEM_PREVIEW_UPLOADER_FILE: "",
				ITEM_EDIT_FLAG: false,

				// BANNER COLLECTION
				BANNER_COLLECTION_NAME: "",

				// BANNER ITEMS
				BANNER_ITEM_NAME: "",
				BANNER_ITEM_PREVIEW_VISIBLE: false,
				BANNER_ITEM_PREVIEW_UPLOADER_FILE: ""
			});
			return oModel;
		}

	};
});