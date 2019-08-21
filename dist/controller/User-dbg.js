/*eslint-env es6*/
/*global firebase*/
/*eslint quotes: ["error", "single"]*/

sap.ui.define(['sap/ui/base/Object', 'sap/m/MessageBox', 'sap/m/MessageToast'], function (UI5Object, MessageBox, MessageToast) {
	'use strict';

	return UI5Object.extend('com.digiArtitus.controller.User', {

		constructor: function (oInstance) {
			this._oInstance = oInstance;
			this._oView = oInstance.getView();
			// load html content
			this._loadLoginHtml();
		},

		_loadLoginHtml: function () {
			var oPageContentHTML = '<!DOCTYPE html>' +
				'<div class="login-page">' +
				'<div class="page">' +
				'<div class="container">' +
				'<div class="left">' +
				'<div class="login">Login</div>' +
				'<div class="eula"><strong>DIGI ADMIN</strong> Tool, A Complete data management and billing system</div>' +
				'<div class="hbox hbox-left-box-margin">' +
				'<input type="submit" id="admin-btn-id" value="ADMIN" class="btn-select btn-select-left-box">' +
				'<input type="submit" id="manager-btn-id" value="MANAGER" class="btn-select btn-selected btn-select-left-box">' +
				'</div>' +
				'</div>' +
				'<div class="right">' +
				'<div class="form">' +
				'<label for="email">Phone or Email</label>' +
				'<input type="email" id="email" class="input-border input-border-active">' +
				'<label for="password">Password</label>' +
				'<input type="password" id="password" class="input-border">' +
				'<div class="hbox hbox-right-box-margin">' +
				'<input type="submit" id="reset" value="Reset" class="btn-select btn-select-right-box">' +
				'<input type="submit" id="submit" value="Submit" class="btn-select btn-selected btn-select-right-box">' +
				'</div>' +
				'<div class="forget-password">' +
				'Forgot Password' +
				'</div>' +
				'</div>' +
				'</div>' +
				'</div>' +
				'</div>' +
				'</div>';

			jQuery.sap.delayedCall(250, this, function () {
				this._loadEventListners();
			});

			return new sap.ui.core.HTML({
				preferDOM: true,
				content: oPageContentHTML
			});
		},

		checkForLogin: function () {
			return new Promise(function (resolve, reject) {
				firebase.auth().onAuthStateChanged(function (user) {
					com.digiArtitus.StartGlobalBusyIndicator();

					var oApp = this._oView.byId('app');
					var aPages = oApp.getPages();
					var iPagesLength = aPages.length;

					if (iPagesLength !== 0) {
						for (var i = 0; i < iPagesLength; i++) {
							aPages[i].destroy();
						}
					}

					var bFlag = false;
					var oPageContent;

					if (user) {
						// save user id globally
						com.digiArtitus.userId = user.uid;
						// main page contents
						oPageContent = sap.ui.xmlfragment(this._oView.getId(), 'com.digiArtitus.fragment.main', this._oInstance);
					} else {
						bFlag = !bFlag;
						// login page contents
						oPageContent = this._loadLoginHtml();
					}

					// add to main page
					oApp.addPage(new sap.m.Page({
						showHeader: false,
						content: oPageContent
					}));

					if (bFlag) {
						reject();
					} else {
						resolve();
					}

				}.bind(this));
			}.bind(this));
		},

		loadUserData: function () {
			return new Promise(function (resolve, reject) {
				var fnSuccess = function (querySnapshot) {
					var oData = querySnapshot.data();
					com.digiArtitus.userName = oData.USER_NAME;
					com.digiArtitus.userPic = oData.USER_PIC;
					com.digiArtitus.role = oData.USER_ROLE;
					com.digiArtitus.companyCode = oData.USER_COMPANY_CODE;
					com.digiArtitus.billingCity = oData.BILLING_CITY;
					com.digiArtitus.billingCountry = oData.BILLING_COUNTRY;
					com.digiArtitus.billingStreet = oData.BILLING_STREET;
					com.digiArtitus.billingStreetNo = oData.BILLING_STREET_NO;
					com.digiArtitus.billingZipcode = oData.BILLING_ZIPCODE;
					com.digiArtitus.billingDeliveryCharge = oData.BILLING_DELIVERY_CHARGE;
					com.digiArtitus.billingDeliveryCheck = oData.BILLING_DELIVERY_CHECK;
					resolve();
				};

				firebase
					.firestore()
					.collection('users')
					.doc(com.digiArtitus.userId)
					.get()
					.then(fnSuccess);
			});
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		_loadEventListners: function () {

			/// delay to load DOM elements
			$.sap.delayedCall(200, this, function () {

				// admin button css 
				$('#admin-btn-id').click(function () {
					$('#admin-btn-id').addClass('btn-selected');
					$('#manager-btn-id').removeClass('btn-selected');
					// global login
					this.ADMIN_LOGIN = !this.ADMIN_LOGIN;
				}.bind(this));

				// tenant button css 
				$('#manager-btn-id').click(function () {
					$('#manager-btn-id').addClass('btn-selected');
					$('#admin-btn-id').removeClass('btn-selected');
					this.ADMIN_LOGIN = !this.ADMIN_LOGIN;
				}.bind(this));

				// email input css 
				$('#email').click(function () {
					$('#email').addClass('input-border-active');
					$('#password').removeClass('input-border-active');
				}.bind(this));

				// focus
				$('#email').focus();

				// password input css 
				$('#password').click(function () {
					$('#password').addClass('input-border-active');
					$('#email').removeClass('input-border-active');
				}.bind(this));

				// reset button click function 
				$('#reset').click(function () {
					$('#email').val('');
					$('#password').val('');
					$('#email').click();
					$('#email').focus();
				}.bind(this));

				// submit button click function 
				$('#submit').click(function () {
					this.USER_NAME = $('#email').val().trim();
					if (this.USER_NAME === '' || this.USER_NAME === null) {
						MessageToast.show('Enter valid phone number or email id');
						return;
					}
					this.PASSWORD = $('#password').val().trim();
					if (this.PASSWORD === '' || this.PASSWORD === null) {
						MessageToast.show('Enter valid password');
						return;
					}

					// navigation
					var that = this;
					firebase.auth().signInWithEmailAndPassword(this.USER_NAME, this.PASSWORD).catch(function (error) {
						// Handle Errors here.
						// var errorCode = error.code;
						var errorMessage = error.message;
						var bCompact = !!that.getView().$().closest('.sapUiSizeCompact').length;
						MessageBox.error(
							errorMessage, {
								styleClass: bCompact ? 'sapUiSizeCompact' : ''
							}
						);
					});
				}.bind(this));

				// forget password
				$('.forget-password').click(function () {
					MessageToast.show('Forget password');
				});
			});

		}

	});

});