sap.ui.define(["sap/ui/core/mvc/Controller","com/digiArtitus/controller/User","com/digiArtitus/controller/Banner","com/digiArtitus/controller/Notification","com/digiArtitus/controller/Database","com/digiArtitus/controller/Orders","com/digiArtitus/controller/Settings","com/digiArtitus/controller/Billing","sap/ui/model/json/JSONModel","com/digiArtitus/model/formatter","sap/ui/model/Filter","sap/m/MessageBox","sap/m/MessageToast"],function(e,t,i,n,s,o,r,a,l,d,c,u,g){"use strict";return e.extend("com.digiArtitus.controller.Main",{formatter:d,model:new l,onInit:function(){com.digiArtitus.StartGlobalBusyIndicator();this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());this.user=new t(this);this.user.checkForLogin().then(function(){this._loadPageControls()}.bind(this)).catch(function(){com.digiArtitus.EndGlobalBusyIndicator()})},_loadPageControls:function(){com.digiArtitus.StartGlobalBusyIndicator();this.banner=new i(this);this.notification=new n(this);this.database=new s(this);this.orders=new o(this);this.settings=new r(this);this.billing=new a(this);this.user.loadUserData().then(function(){this.notification.liveNotificationUpdates();this.banner.liveBannerCollectionUpdates();this.banner.liveBannerItemsUpdates();this.database.liveDatabaseCollectionUpdates();this.database.liveDatabaseMenuUpdates();this.database.liveDatabaseItemUpdates();this.orders.liveOrders();this.billing.loadBillingModel();jQuery.sap.delayedCall(2e3,this,function(){com.digiArtitus.EndGlobalBusyIndicator()});this._setSelectedNavBar("Dashboard")}.bind(this))},onToogleNavButtonPress:function(){var e=function(e){var t=this.byId("sideNavigationToggleButton");if(e){t.setTooltip("Expand")}else{t.setTooltip("Collapse")}}.bind(this);var t=this.getView().getId();var i=sap.ui.getCore().byId(t+"--toolPage");var n=i.getSideExpanded();e(n);i.setSideExpanded(!i.getSideExpanded())},handleNotificationPress:function(e){this.notification.onNotificationPress(e)},handleSettingsPress:function(){this._setSelectedNavBar("Settings")},onSideNavItemSelect:function(e){if(e.getParameter("item").getProperty("text")==="Logout"){this._logout()}if(e.getParameter("item").getProperty("text")==="Billing"){this.billing._billingPageDefaults()}if(e.getParameter("item").getProperty("text")==="Settings"){this.settings._settingsPageDefaults()}var t=e.getParameter("item");var i=this.getView().getId();sap.ui.getCore().byId(i+"--pageContainer").to(i+"--"+t.getKey())},onListUpdateFinished:function(e){var t=e.getParameter("total"),i=e.getSource();if(t===0){var n=this.getView().getModel("oViewModel"),s=n.getData();if(i.getId().search("banner-item-list-id")!==-1){s.BANNER_ITEM_PREVIEW=""}n.refresh();return}var o=i.getItems();i.setSelectedItem(o[0],true);i.fireItemPress({listItem:o[0],srcControl:i})},onBannerCollectionListPress:function(e){var t=e.getParameter("listItem").getBindingContext("oViewModel").getObject();this.getView().getModel("oViewModel").setProperty("/BANNER_COLLECTION_NAME",t.NAME);this._listItemFilter("banner-item-list-id","BANNER_COLLECTION",t.NAME)},onBannerItemListPress:function(e){var t=this.getView().getModel("oViewModel"),i=t.getData(),n=e.getParameter("listItem"),s="";if(n){s=n.getBindingContext("oViewModel").getObject().IMAGE_URL}i.BANNER_ITEM_PREVIEW=s;t.refresh()},_listItemFilter:function(e,t,i){var n=this.getView().byId(e),s=n.getBinding("items"),o;o=new c("BANNER_COLLECTION","EQ",i);s.filter([o])},_validateInput:function(e){var t=e.getBinding("value"),i="None",n=false;try{t.getType().validateValue(e.getValue())}catch(t){i="Error";n=true;e.focus()}e.setValueState(i);return n},onBannerCollectionDialogAddPress:function(){this.banner._bannerCollectionDialog().open()},onBannerCollectionListEditPress:function(e){this.banner.bannerCollectionEdit(e)},onBannerCollectionListDeletePress:function(e){this._deleteEntry(e,false)},onBannerItemAddPress:function(){this.banner._bannerItemDialog().open()},onBannerItemListDeletePress:function(e){this._deleteEntry(e,true)},onBannerItemListEditPress:function(e){this.banner.bannerItemEdit(e)},onCollectionDialogAddPress:function(){this.database._collectionDialog().open()},onCollectionListPress:function(e){this.database.onCollectionListPress(e)},onCollectionListEditPress:function(e){this.database.onCollectionListEditPress(e)},onCollectionListDeletePress:function(e){this._deleteEntry(e,false)},onMenuListPress:function(e){this.database.onMenuListPress(e)},onMenuListEditPress:function(e){this.database.onMenuListEditPress(e)},onMenuDialogAddPress:function(){this.database._menuDialog().open()},onMenuListDeletePress:function(e){this._deleteEntry(e,true)},onItemDialogAddPress:function(){this.database._itemDialog().open()},onItemListPress:function(e){this.database.onItemListPress(e)},onItemListDeletePress:function(e){this._deleteEntry(e,true)},onItemListEditPress:function(e){this.database.onItemListEditPress(e)},onOrderTypePress:function(e){this.orders.onOrderTypePress(e)},onOrderStatusPress:function(e){this.orders.onOrderStatusPress(e)},onStatusChanged:function(e){this.orders.onStatusChanged(e)},onOrderItemsPress:function(e){this.orders.onOrderItemsPress(e)},onOrderReceiptPress:function(e){this.orders.onOrderReceiptPress(e)},onOrdersToggleBtn:function(e){this.orders.toggleOrders(e)},onDataExport:function(e){this.orders.ordersExport()},handleSettingsEditPress:function(){this.settings.handleSettingsEditPress()},handleSettingsSavePress:function(){this.settings.handleSettingsSavePress()},handleSettingsCancelPress:function(){this.settings.handleSettingsCancelPress()},onBillingCreateOrder:function(){this.billing.onBillingCreateOrder()},onBillingQuantityLiveChange:function(e){this.billing.onBillingQuantityLiveChange(e)},onInputValueChange:function(e){var t=e.getSource();var i=t.getBinding("value");var n="None";var s=false;try{i.getType().validateValue(t.getValue())}catch(e){n="Error";s=true;t.focus()}t.setValueState(n);return s},_setSelectedNavBar:function(e){var t=this.getView().byId("admin-dashboard-id");var i=t.getItem().getItems();var n=t.getFixedItem().getItems();var s=i.concat(n);var o=null;for(var r=0,a=s.length;r<a;r++){if(s[r].getKey()===e){o=s[r];break}}if(o===null){return}t.setSelectedItem(o);t.fireItemSelect({item:o})},_deleteEntry:function(e,t){var i=e.getSource();var n=i.getBindingContext("oViewModel").getObject();var s=function(){var e=$.Deferred();var t=!!this.getView().$().closest(".sapUiSizeCompact").length;u.warning("Confirm to delete",{actions:[sap.m.MessageBox.Action.OK,sap.m.MessageBox.Action.CANCEL],styleClass:t?"sapUiSizeCompact":"",onClose:function(t){if(t==="OK"){e.resolve("create")}}});return e.promise()}.bind(this);$.when(s()).done(function(e){com.digiArtitus.StartGlobalBusyIndicator();var i=function(){n.DOC_REF.delete().then(function(){com.digiArtitus.EndGlobalBusyIndicator()}).catch(function(e){g.show("Error in posting data");com.digiArtitus.EndGlobalBusyIndicator()})};if(t){var s=firebase.storage().ref();var o=s.child(n.IMAGE_REF_PATH);o.delete().then(i).catch(function(e){com.digiArtitus.EndGlobalBusyIndicator()})}else{i()}})},_fileUploaderUnLoad:function(e,t,i,n,s){var o=this.getView().byId(e),r=this.getView().getModel("oViewModel"),a=r.getData();o.setValue("");a[t]=null;a[i]=false;a[n]="";a[s]=false;r.refresh()},_fileUploaderLoad:function(e,t,i,n,s,o){var r=this.getView().byId(e),a=this.getView().getModel("oViewModel"),l=a.getData();if(!r.getValue()){g.show("Choose a file first");return}var d=jQuery.sap.domById(r.getId()+"-fu").files[0];var c=function(e,t){if(e===0){return"0 Bytes"}var i=1024,n=t||2,s=["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"],o=Math.floor(Math.log(e)/Math.log(i));return parseFloat((e/Math.pow(i,o)).toFixed(n))+" "+s[o]};var u=l.MAX_FILE_ATTACHMENT_SIZE;if(d.size>u){g.show("File size "+c(d.size)+" exceeding "+c(u));com.digiArtitus.EndGlobalBusyIndicator();return}var h;if(d){l[t]=d;h=new FileReader;h.onload=function(){if(l[i]){l[n]=true}l[s]=h.result;l[o]=true;r.setValue("");a.refresh()};h.readAsDataURL(d)}},_listFilter:function(e,t,i){var n=this.getView().byId(e);var s=new c(t,sap.ui.model.FilterOperator.EQ,i);var o=n.getBinding("items");if(i==="ALL"){o.filter([])}else{o.filter([s])}},_logout:function(){var e=function(){var e=$.Deferred();var t=!!this.getView().$().closest(".sapUiSizeCompact").length;u.warning("Are you sure you want to log out? Confirm and log out.",{actions:[sap.m.MessageBox.Action.OK,sap.m.MessageBox.Action.CANCEL],styleClass:t?"sapUiSizeCompact":"",onClose:function(t){if(t==="OK"){e.resolve("logout")}}});return e.promise()}.bind(this);$.when(e()).done(function(e){firebase.auth().signOut().then(function(){this.banner.destroy();this.notification.destroy();this.database.destroy();this.orders.destroy();this.settings.destroy();this.billing.destroy();com.digiArtitus.LoggedIn=false;com.digiArtitus.LoggedOff=true;this.notificationsUnsubscribe();this.bannerCollectionUnsubscribe();this.bannerItemUnsubscribe();this.databaseCollectionUnsubscribe();this.databaseMenuUnsubscribe();this.databaseItemUnsubscribe();this.orderUnsubscribe();this.billingUnsubscribe()}.bind(this))}.bind(this))}})});