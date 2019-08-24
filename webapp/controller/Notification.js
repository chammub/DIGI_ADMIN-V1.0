/*global moment*/

sap.ui.define(["sap/ui/base/Object", "sap/m/MessageBox", "sap/m/MessageToast"],
	function (UI5Object, MessageBox, MessageToast) {
		"use strict";

		return UI5Object.extend("com.digiArtitus.controller.Notification", {

			constructor: function (oInstance) {
				this._oInstance = oInstance;
				this._oView = oInstance.getView();
				this.oViewModel = this._oView.getModel("oViewModel");
			},
			
			liveNotificationUpdates: function () {
				var fnSuccess = function (querySnapshot) {
					var oViewData = this.oViewModel.getData();
					var aData = [];
					querySnapshot.forEach(function (doc) {
						aData.push({
							"DOC_REF": doc.ref,
							"TEXT": doc.data().TEXT,
							"TIME_STAMP": moment(doc.data().TIME_STAMP).format("Do MMM YYYY")
						});
					});

					// update notifications data
					oViewData.NOTIFICATIONS = aData;

					// update model data
					this.oViewModel.refresh();
				}.bind(this);

				this._oInstance.notificationsUnsubscribe = 
				com.digiArtitus
					.FirestoreInstance()
					.collection("DATABASE")
					.doc(com.digiArtitus.companyCode)
					.collection("NOTIFICATIONS")
					.onSnapshot(fnSuccess);
			},

			_notificationDialog: function () {
				if (!this.notificationDialog) {
					var oView = this._oView;
					this.notificationDialog = sap.ui.xmlfragment(oView.getId(), "com.digiArtitus.fragment.notification-popover", this);
					oView.addDependent(this.notificationDialog);
					// sync compact style
					jQuery.sap.syncStyleClass("sapUiSizeCompact", oView, this.notificationDialog);
				}
				return this.notificationDialog;
			},
			
			onNotificationPress: function (oEvent) {
				var oSource = oEvent.getSource();
				
				// delay because addDependent will do a async rerendering and the actionSheet will immediately close without it.
				jQuery.sap.delayedCall(0, this, function () {
					this._notificationDialog().openBy(oSource);
				});
			},
			
			handleClosePress: function() {
				this._notificationDialog().close();
			}

		});

	});