/*global firebase*/

sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"com/digiArtitus/model/models"
], function (UIComponent, Device, models) {
	"use strict";

	return UIComponent.extend("com.digiArtitus.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// enable routing
			this.getRouter().initialize();

			// set the device model
			this.setModel(models.createDeviceModel(), "device");

			// set the nav model
			this.setModel(models.createNavModel(), "oNavigation");

			// set the fixed nav model
			this.setModel(models.createFixedNavModel(), "oFixedNavigation");

			// set the view model
			this.setModel(models.createViewModel(), "oViewModel");

			// global functions
			this._loadGlobalNamspaceFunctions();

			// prtotype functions
			this._loadPrototypeMethods();

			// initialize firebase
			this._firebaseIntialize();
		},

		/**
		 * The component is destroyed by UI5 automatically.
		 * In this method, the ErrorHandler is destroyed.
		 * @public
		 * @override
		 */
		destroy: function () {
			// call the base component's destroy function
			UIComponent.prototype.destroy.apply(this, arguments);
		},

		/**
		 * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy
		 * design mode class should be set, which influences the size appearance of some controls.
		 * @public
		 * @return {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy' - or an empty string if no css class should be set
		 */
		getContentDensityClass: function () {
			if (this._sContentDensityClass === undefined) {
				// check whether FLP has already set the content density class; do nothing in this case
				// eslint-disable-next-line sap-no-proprietary-browser-api
				if (document.body.classList.contains("sapUiSizeCozy") || document.body.classList.contains("sapUiSizeCompact")) {
					this._sContentDensityClass = "";
				} else if (!Device.support.touch) { // apply "compact" mode if touch is not supported
					this._sContentDensityClass = "sapUiSizeCompact";
				} else {
					// "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
					this._sContentDensityClass = "sapUiSizeCozy";
				}
			}
			return this._sContentDensityClass;
		},

		// create firebase interface
		_firebaseIntialize: function () {
			var oResourceModel = this.getModel("i18n").getResourceBundle();

			var config = {
				apiKey: oResourceModel.getText("API_KEY"),
				authDomain: oResourceModel.getText("AUTH_DOMAIN"),
				databaseURL: oResourceModel.getText("DATABASE_URL"),
				projectId: oResourceModel.getText("PROJECT_ID"),
				storageBucket: oResourceModel.getText("STORAGE_BUCKET"),
				messagingSenderId: oResourceModel.getText("MESSAGING_SENDER_ID"),
				appId: oResourceModel.getText("APP_ID")
			};
			firebase.initializeApp(config);
		},

		_loadPrototypeMethods: function () {
		},

		_loadGlobalNamspaceFunctions: function () {
			var startGloabalBusyIndicator = function () {
				return sap.ui.core.BusyIndicator.show(0);
			};

			var endGloabalBusyIndicator = function () {
				return sap.ui.core.BusyIndicator.hide();
			};

			var getFirestoreInstance = function () {
				return firebase.firestore();
			};

			var getFormattedCurrency = function (iValue) {
				var oLocale = new sap.ui.core.Locale("en-US");
				var oFormatOptions = {
					style: "short",
					decimals: 1,
					shortDecimals: 2
				};

				var oFloatFormat = sap.ui.core.format.NumberFormat.getFloatInstance(oFormatOptions, oLocale);
				return oFloatFormat.format(iValue);
			};
			
			com.digiArtitus.StartGlobalBusyIndicator = startGloabalBusyIndicator;
			com.digiArtitus.EndGlobalBusyIndicator = endGloabalBusyIndicator;
			com.digiArtitus.FirestoreInstance = getFirestoreInstance;
			com.digiArtitus.FormattedCurrency = getFormattedCurrency;
			
			// variables
			com.digiArtitus.LoggedIn = false;
			com.digiArtitus.LoggedOff = false;
		}
	});
});