/* globals crypto: false */
/* globals Uint8Array: false */
/* globals console: false */
/* globals exports: false */
/* globals base64js: false */
/* globals TextEncoder: false */
/* globals TextDecoder: false */


(function(exports){
	"use strict";
	
	var textEncoder = new TextEncoder('utf-8');
	var textDecoder = new TextDecoder('utf-8');
	
	var UnsupportedEnvironmentError = function(message) {
		this.message = message;
		this.name = 'UnsupportedEnvironmentError';
	};
	
	var OTPError = function(message) {
		this.message = message;
		this.name = 'OTPError';
	};
	
	/** 
	 * Generate a random byte array of the given length. Used to generate
	 * secure keys.
	 * Should support both browser and node.js.
	 * @param {number} length - The number of bytes to generate.
	 * @return {Uint8Array} Array of cryptographically-secure random byte 
	 * 		values. 
	 */
	exports.randomByteArray = function(length) {
		var bytes;

		var cryptoObj = window.crypto || window.msCrypto;

		if (cryptoObj.getRandomValues) {
			bytes = new Uint8Array(length);
			cryptoObj.getRandomValues(bytes);
			return bytes;
		}

		console.error("xor-otp: Unable to find supported random byte library.");
		throw new UnsupportedEnvironmentError(
			'xor-otp: Unable to find a supported random byte library');
	};
	
	/**
	 * Generates a random key and encodes it as Base64.
	 */
	exports.generateBase64Key = function(lengthInBytes) {
		return exports.bytesToBase64(exports.randomByteArray(lengthInBytes));
	}
	
	/** Test whether the given object is a byte array. */
	var isByteArray = function(unknownObject) {
		return unknownObject.constructor === Uint8Array;
	};
	
	/**
	 * Performs bitwise XOR on two byte arrays.
	 * @param {Uint8Array} x1
	 * @param {Uint8Array} x2
	 * @return {Uint8Array} x1 ^ x2
	 */
	exports.xorByteArrays = function(x1, x2) {
		if (!isByteArray(x1)) {
			console.error('xorByteArray\'s first argument is not a byte ',
				'array of type Uint8Array. Got', x1.constructor.name);
		}
		
		if (!isByteArray(x2)) {
			console.error('xorByteArray\'s second argument is not a byte ',
				'array of type Uint8Array. Got', x2.constructor.name);
		}
		
		if (x1.length !== x2.length) {
			console.error('xorByteArray received arguments of mixed length.',
				'Result will be the length of first argument');
		}
		
		var xorResult = new Uint8Array(x1.length);
		
		for (var i = 0; i < xorResult.length; i++) {
			// suppress jshint warning about bitwise operators
			/*jshint -W016 */
			xorResult[i] = x1[i] ^ x2[i];
			/*jshint +W016 */
		}
		
		return xorResult;
	};
	
	/** 
	 * Encodes a byte array to a string in base64 format.
	 * @param {Uint8Array} bytes
	 * @return {string}
	 */
	exports.bytesToBase64 = function(bytes) {
		if (!isByteArray(bytes)) {
			console.error('bytesToBase64 expects a Uint8Array but got',
				bytes.constructor.name, 'instead');
		}
		
		return base64js.fromByteArray(bytes);
	};
	
	/** 
	 * Decodes a base64 string to a byte array. 
	 * @param {string} base64String
	 * @return {Uint8Array}
	 * */
	exports.base64ToBytes = function(base64String) {
		if (typeof base64String !== 'string') {
			console.error('base64ToBytes expects a string but got',
				base64String.constructor.name, 'instead');
		}
		
		return base64js.toByteArray(base64String);
	};
	
	/**
	 * Convert a UTF-8 string to a byte array.
	 * @param {string} utf8Str
	 * @return {Uint8Array}
	 */
	exports.utf8ToBytes = function(utf8Str) {
		if (typeof utf8Str !== 'string') {
			console.error('utf8ToBytes expects a string but got',
				utf8Str.constructor.name, 'instead');
		}
		
		return textEncoder.encode(utf8Str);
	};
	
	/**
	 * Convert a byte array to a UTF-8 string.
	 * @param {Uint8Array} bytes
	 * @return {string}
	 */
	exports.bytesToUtf8 = function(bytes) {
		if (!isByteArray(bytes)) {
			console.error('bytesToUtf8 expects a Uint8Array but got',
				bytes.constructor.name, 'instead');
		}
		
		return textDecoder.decode(bytes);
	};
	
	/**
	 * Nice wrapper for XOR encryption, with error handling.
	 * @param {string} base64KeyString Base64 encoded key.
	 * @param {string} utf8Plaintext UTF-8 plaintext string.
	 * @return {string} Base64 encoded ciphertext.
	 */
	exports.encrypt = function(base64KeyString, utf8Plaintext) {
		var key = exports.base64ToBytes(base64KeyString);
		var plaintext = exports.utf8ToBytes(utf8Plaintext); 
		
		if (key.length !== plaintext.length) {
			throw new OTPError("The key and plaintext must be the same \
								length in bytes, but they are not.");
		}
		
		var ciphertext = exports.xorByteArrays(key, plaintext);
		
		return exports.bytesToBase64(ciphertext);
	};
	
	exports.decrypt = function(base64KeyString, base64Ciphertext) {
		var key = exports.base64ToBytes(base64KeyString);
		var ciphertext = exports.base64ToBytes(base64Ciphertext);
		
		if (key.length !== ciphertext.length) {
			throw new OTPError("The key and ciphertext must be the same \
								length in bytes, but they are not.");
		}
		
		var plaintext = exports.xorByteArrays(key, ciphertext);
		return exports.bytesToUtf8(plaintext);
	};
	
})(typeof exports === 'undefined' ? this.xorotp = {} : exports);
