/*eslint-env es6*/

sap.ui.define(["sap/ui/base/Object", "sap/m/MessageBox", "sap/m/MessageToast"],
	function (UI5Object, MessageBox, MessageToast) {
		"use strict";

		return UI5Object.extend("com.digiArtitus.controller.Settings", {

			_formFragments: {},

			constructor: function (oInstance) {
				this._oInstance = oInstance;
				this._oView = oInstance.getView();
				this.oViewModel = this._oView.getModel("oViewModel");
			},

			_loadFormValues: function (querySnapshot) {
				var fnSuccess = function (oData) {
					this._oView.setModel(new sap.ui.model.json.JSONModel(oData), "oSettingsModel");
				};

				var fnError = function () {
					MessageToast.show("Unable to load user settings, please try again later.");
				};

				this._getUserSettingInfo().then($.proxy(fnSuccess, this)).catch(fnError);
			},

			_showFormFragment: function (sFragmentName) {
				var oPage = this._oView.byId("settings-page-content");

				oPage.removeAllItems();
				oPage.insertItem(this._getFormFragment(sFragmentName));
			},

			_getFormFragment: function (sFragmentName) {
				var oFormFragment = this._formFragments[sFragmentName];

				if (oFormFragment) {
					return oFormFragment;
				}

				oFormFragment = sap.ui.xmlfragment(this._oView.getId(), "com.digiArtitus.fragment." + sFragmentName);

				this._formFragments[sFragmentName] = oFormFragment;
				return this._formFragments[sFragmentName];
			},

			_settingsPageDefaults: function () {
				// Set the initial form to be the display one
				this._showFormFragment("settings-display");
				this._loadFormValues();
			},

			_getUserSettingInfo: function () {
				return new Promise((resolve, reject) => {
					var fnSuccess = function (querySnapshot) {
						var oData = querySnapshot.data();
						var oFormData = {
							// office details
							"GST_NO": oData.GST_NO,
							"USER_NAME": oData.USER_NAME,
							"BILLING_STREET_NO": oData.BILLING_STREET_NO,
							"BILLING_STREET": oData.BILLING_STREET,
							"BILLING_ZIPCODE": oData.BILLING_ZIPCODE,
							"BILLING_CITY": oData.BILLING_CITY,
							"BILLING_COUNTRY": oData.BILLING_COUNTRY,

							// other
							"USER_PIC": oData.USER_PIC,
							"USER_ROLE": oData.USER_ROLE,
							"USER_COMPANY_CODE": oData.USER_COMPANY_CODE,

							// Online
							"WEB_SITE": oData.WEB_SITE,
							"FACEBOOK": oData.FACEBOOK,
							"YOUTUBE": oData.YOUTUBE,
							"INSTAGRAM": oData.INSTAGRAM,

							// Delivery details
							"BILLING_DELIVERY_CHARGE": oData.BILLING_DELIVERY_CHARGE,
							"BILLING_DELIVERY_CHECK": oData.BILLING_DELIVERY_CHECK,

							// sms notification
							"SMS_NOTIFICATION": oData.SMS_NOTIFICATION,

							// contact data
							"EMAIL": oData.EMAIL,
							"TEL": oData.TEL,
							"SMS": oData.SMS
						};
						com.digiArtitus.EndGlobalBusyIndicator();
						resolve(oFormData);
					};

					var fnError = function () {
						com.digiArtitus.EndGlobalBusyIndicator();
						reject();
					};
					
					com.digiArtitus.StartGlobalBusyIndicator();

					com.digiArtitus.FirestoreInstance()
						.collection("users")
						.doc(com.digiArtitus.userId)
						.get()
						.then(fnSuccess)
						.catch(fnError);
				});
			},

			_updateFormValues: function () {
				return Promise.all([this._getUserSettingInfo()]).then(function (aResults) {
					var oOriginalData = aResults[0];
					var oData = this._oView.getModel("oSettingsModel").getData();

					if (JSON.stringify(oOriginalData) === JSON.stringify(oData)) {
						MessageToast.show("No changes found to save");
						return;
					}

					return new Promise((resolve, reject) => {
						// start global busy indicator
						com.digiArtitus.StartGlobalBusyIndicator();

						var fnSuccess = function () {
							// end global busy indicator
							com.digiArtitus.EndGlobalBusyIndicator();
							resolve();
						};

						var fnError = function () {
							MessageToast.show("Unable to save changes, please try again later.");
							// end global busy indicator
							com.digiArtitus.EndGlobalBusyIndicator();
							reject();
						};

						com.digiArtitus.FirestoreInstance()
							.collection("users")
							.doc(com.digiArtitus.userId)
							.set(oData)
							.then(fnSuccess)
							.catch(fnError);
					});

				}.bind(this));
			},

			handleSettingsEditPress: function () {
				this._toggleButtonsAndView(true);
			},

			handleSettingsSavePress: function () {
				var handleSuccess = function () {
					this._toggleButtonsAndView(false);
				}.bind(this);

				this._updateFormValues().then(handleSuccess);
			},

			handleSettingsCancelPress: function () {
				this._toggleButtonsAndView(false);
			},

			_toggleButtonsAndView: function (bEdit) {
				var oView = this._oView;

				// Show the appropriate action buttons
				oView.byId("settings-edit-id").setVisible(!bEdit);
				oView.byId("settings-save-id").setVisible(bEdit);
				oView.byId("settings-cancel-id").setVisible(bEdit);

				// Set the right form type
				this._showFormFragment(bEdit ? "settings-change" : "settings-display");
			}

		});
	});