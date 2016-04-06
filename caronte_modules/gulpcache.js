/**
 * @license Javascript Memory Cache
 * (c) 2015-2016 Caronte, Inc. http://caronte.co
 * License: MIT
 * Author: Daniele Tomasi (MorrisDa);
 */ 

(function() {
	"use strict";
	var fs = require('fs');

	module.exports = function(options) {
		if (!options) options = {};
		var o = {
			cache: options.name || './_jscache.json',
			defualt_cache_key: options.default_row || 'd',
		}
		//add json suffix is not present;
		if (o.cache.indexOf('.json') == -1) o.cache = o.cache + '.json';
		
		//utils for accessing files;
		var u = {
			//return given file giving path n;
			get_file: function(n) {
				if (!n) return false;
				else {
					//write new obhect if not existing;
					if (!fs.existsSync(n)) fs.writeFileSync(n, JSON.stringify({}));
					var file = fs.readFileSync(o.cache);
					return JSON.parse(file.toString());
				}
			},
			//write file to path 'path' with content 'content'; return the file itself
			write_file: function(path, content) {
				if (!fs.existsSync(o.cache)) fs.writeFileSync(o.cache, JSON.stringify({}));
				if (path && content) {
						fs.writeFileSync(path, content);
						return content;
				}
				else return false;
			}
		}
		
		return {
			getDefault: function(namespace) {
				return this.get(namespace, o.defualt_cache_key);
			},
			//get configuration of task 'namaspace' with key 'n';
			get: function(namespace, n) {
				if (!(namespace && n)) return false;
				var config = u.get_file(o.cache);
				if (!config[namespace]) return null;
				else if (!config[namespace][n]) return null;
				else return config[namespace][n];
			},
			//save object 'data' in configuration file giving task name 'namespace' and key 'n'
			save: function(namespace, n, data, options) {
				var descriptor = this._set(namespace, n, data, options);
				var a = u.write_file(o.cache, JSON.stringify(descriptor));
				if (a) return descriptor[namespace][n];
				else return false;
			},
			//delete a given cache, program to status 0;
			deleteCache: function(cache) {
				if (fs.existsSync((cache.indexOf('.json') == -1 ? String(cache + '.json') : cache)))
					return fs.unlinkSync((cache.indexOf('.json') == -1 ? String(cache + '.json') : cache));
				else return true;
			},
			_merge: function(a, b) {

				//check if type of a is the same as type of b;
	      function isConforme(a, b) {
	        if ( typeof b == typeof a)
	          return true;
	        else
	          return false;
	      }

	      function unmistake(a,b) {
	            // switch (typeof a) {
	            //   case 'number': 
	            //   var d = parseInt(Math.abs(b));
	            //   return d
	            //   break;
	            //   case 'string':
	            //   return b;
	            //   break;
	            //   case 'boolean':
	            //   return (b === "true" || b == true) ? true : false;
	            //   break;
	            //   case 'object':
	            //   return {};
	            //   break;
	              
	            // }
	            return b;
	      }
					/*
	      *  {{a}} object || the model object
	      *  {{b}} object || the object that should be compliant to the model object a
	      *  return b complian to a (fields are of the same type in each inner object)
	      */
	      //check if object b is compliant to model a, if not replace uncompliant fields.
	      function conformize(a, b) {
		      var c = b;
		      for (var key in a) {
		        var odKey = key;
		        if (b.hasOwnProperty(key) || b.hasOwnProperty(key.toLowerCase())) {
		          var key = key.toLowerCase();
		          if ( typeof a[odKey] == 'object') 
		            {c[odKey] = conformize(a[odKey], b[key] || b[odKey]); }
		          else if (!isConforme(a[odKey], b[key] || b[odKey]) && !isConforme(a[odKey], unmistake(a[odKey], b[key] || b[odKey])))
		            {c[odKey] = a[odKey];}
		          else if (isConforme(a[odKey], unmistake(a[odKey], b[key] || b[odKey])))
		           { 
		            var d = unmistake(a[odKey], b[key] || b[odKey]);
		            c[odKey] = d; 
		          }
		         else {c[odKey] = a[odKey];}
		        } else
		          c[odKey] = a[odKey];
		      }    
		        return c;
		    }

		    //call script
		    return conformize(a, b);
			},
			//set new object in memory, return it;
			_set: function(namespace, n, data, options, r) {
				var config = r || u.get_file(o.cache), options = options || {}, self = this;
				if (!config[namespace]) {
					config[namespace] = {}; 
					return this._set(namespace, n, data, options, config)
				}
				else {
					if (options.merge) config[namespace][n] = self._merge(config[namespace][n], data)
					else config[namespace][n] = data;
					return config;
				}
			},
			//get a row 'n' n in namaspace 'namespace' or set body ('data' || {})
			getOrSet: function(namespace, n, data) {
				if (!(namespace && n)) return false;
				var data = (typeof data == 'object' && !Array.isArray(data)) ? data : {}  || {}, z = this.get(namespace, n);
				if (!z) 
							return this.save(namespace, n, data);
				else 	return z;
			}
		}
	}
})()