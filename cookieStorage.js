/*
 * This file contains the implementation of a wrapper for the localStorage.
 * When the localStorage object is not available (i.e. IE7), the behaviour falls back
 * to cookies storage, where a partial interface of the localStorage is implemented
 *
 * */

/**
 *
 * */
var StorageUtil = function() {};

/**
 * CookiesStorage is the localStorage based on cookies
 * It partially implements the storage api.
 * Persistent data is stored into cookies, whereas an in-memory view of them is
 * kept into the _storageList object
 */
StorageUtil.CookiesStorage = {

	/**
	 * initialize the _storageList from cookies, and the length property
	 */
	init: function () {
		var allCookies = document.cookie.split('; ');

		this._storageList = {};

		/**
		 * storage.length
		 */
		this.length = 0;

		for (var i=0;i<allCookies.length;i++) {

			if(allCookies[i].indexOf("_cookieStorage_") >= 0) {
				this._addCookie(allCookies[i]);
			}
		}

	},

	/**
	 * add cookie to the _storageList
	 */
	_addCookie : function (cookieStr, appendToDom) {
		var cookiePair = cookieStr.split('=');

		if(!this._storageList[cookiePair[0]]) {
			this.length++;
		}

		if(appendToDom)
			document.cookie = cookieStr;
		this._storageList[cookiePair[0]] = cookiePair[1];

	},

	/**
	 * remove cookie from the _storageList and the document
	 */
	_removeCookie : function(name) {
		if(this._storageList[name]) {
			this.length--;
		}

		document.cookie = this._create(name.replace("_cookieStorage_",""),'',-1);

		this._storageList[name] = undefined;
	},

	/**
	 * create a cookie string
	 * @return the cookie string
	 */
	_create: function (name,value,days) {

		name = "_cookieStorage_" + name;

		var expireStr = "";
		if (days) {
			var date = new Date();
			date.setTime(date.getTime()+(days*24*60*60*1000));
			expireStr = date.toGMTString();
		}

		var expires = "; expires="+expireStr;

		var cookieStr = name+"="+value+expires+"; path=/"

		return cookieStr;

	},

    /**
     * storage.removeItem, remove item from the storage
     */
	removeItem: function (key) {
		this._removeCookie(key);
	},

	/**
	 * storage.getItem, get the item from the storage
	 * @param name : key of the item to be returned
	 * @return the property value
	 */
	getItem : function(key) {
		return this._storageList["_cookieStorage_"+key];

	},

	/**
	 * storage.setItem, set a cookie with 20 years expiration date
	 * @param key
	 * @param value
	 */
	setItem : function(key, value) {
		var exp = 360*20;
		this._addCookie(this._create(key,value, exp), true);
	},

	/**
	 * storage.clear, clear all cookies and storage
	 */
	clear : function() {
		for(var key in this._storageList) {
			if(key.indexOf("_cookieStorage_") >= 0)
				this._removeCookie(key);
		}
	}

};

/**
 * Init the storageUtil by selecting the Cookies or native localStorage according to the availability
 * of the latter
 */
StorageUtil.init = function() {

	if(!window.localStorage) {
		StorageUtil.CookiesStorage.init();
		this._storage = StorageUtil.CookiesStorage;
	} else {
		this._storage = window.localStorage;
	}
};

/**
 * Get the storage
 */
StorageUtil.storage = function() {
	return this._storage;
};

StorageUtil.init();


