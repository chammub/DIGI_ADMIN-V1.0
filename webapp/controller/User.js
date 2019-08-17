/*eslint-env es6*/
/*global firebase*/

sap.ui.define(["sap/ui/base/Object", "sap/m/MessageBox", "sap/m/MessageToast"], function (UI5Object, MessageBox, MessageToast) {
	"use strict";

	return UI5Object.extend("com.digiArtitus.controller.User", {

		constructor: function (oInstance) {
			this._oInstance = oInstance;
			this._oView = oInstance.getView();
		},

		checkForLogin: function () {
			return new Promise(function (resolve, reject) {
				firebase.auth().onAuthStateChanged(function (user) {
					var bFlag = false;

					if (user) {
						// save user id globally
						com.digiArtitus.userId = user.uid;
					} else {
						bFlag = !bFlag;
						if (this._oView.byId("html")) {
							// load html content
							$.get("view/login.html", function (data) {
								this._oView.byId("html").setContent(data);
							}.bind(this)).then(this._loadEventListners.bind(this));
						}
					}
					this._oView.byId("login-page").setVisible(bFlag);
					this._oView.byId("admin-page").setVisible(!bFlag);
					resolve();
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
					.collection("users")
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
				$("#admin-btn-id").click(function () {
					$("#admin-btn-id").addClass("btn-selected");
					$("#manager-btn-id").removeClass("btn-selected");
					// global login
					this.ADMIN_LOGIN = !this.ADMIN_LOGIN;
				}.bind(this));

				// tenant button css 
				$("#manager-btn-id").click(function () {
					$("#manager-btn-id").addClass("btn-selected");
					$("#admin-btn-id").removeClass("btn-selected");
					this.ADMIN_LOGIN = !this.ADMIN_LOGIN;
				}.bind(this));

				// email input css 
				$("#email").click(function () {
					$("#email").addClass("input-border-active");
					$("#password").removeClass("input-border-active");
				}.bind(this));

				// focus
				$("#email").focus();

				// password input css 
				$("#password").click(function () {
					$("#password").addClass("input-border-active");
					$("#email").removeClass("input-border-active");
				}.bind(this));

				// reset button click function 
				$("#reset").click(function () {
					$("#email").val("");
					$("#password").val("");
					$("#email").click();
					$("#email").focus();
				}.bind(this));

				// submit button click function 
				$("#submit").click(function () {
					this.USER_NAME = $("#email").val().trim();
					if (this.USER_NAME === "" || this.USER_NAME === null) {
						MessageToast.show("Enter valid phone number or email id");
						return;
					}
					this.PASSWORD = $("#password").val().trim();
					if (this.PASSWORD === "" || this.PASSWORD === null) {
						MessageToast.show("Enter valid password");
						return;
					}

					// navigation
					var that = this;
					firebase.auth().signInWithEmailAndPassword(this.USER_NAME, this.PASSWORD).catch(function (error) {
						// Handle Errors here.
						// var errorCode = error.code;
						var errorMessage = error.message;
						var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;
						MessageBox.error(
							errorMessage, {
								styleClass: bCompact ? "sapUiSizeCompact" : ""
							}
						);
					});
				}.bind(this));

				// forget password
				$(".forget-password").click(function () {
					MessageToast.show("Forget password");
				});
			});

		}

	});

});