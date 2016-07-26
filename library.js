"use strict";

var async = module.parent.require('async');
var fs = require('fs');
var path = require('path');
var db = module.parent.require('./database');
var plugins = module.parent.require('./plugins');
var user = module.parent.require('./user');
var groups = module.parent.require('./groups');
var meta = module.parent.require('./meta');
var languages = module.parent.require('./languages');
var translator = module.parent.require('../public/src/modules/translator');
var templates = module.parent.require('templates.js');
var app;


var Widget = {
	templates: {}
};

Widget.init = function(params, callback) {
	app = params.app;

	var templatesToLoad = [
		"admin/user-subset-group.tpl", "admin/user-subset-language.tpl"
	];

	function loadTemplate(template, next) {
		fs.readFile(path.resolve(__dirname, './public/templates/' + template), function (err, data) {
			if (err) {
				console.log(err.message);
				return next(err);
			}
			Widget.templates[template] = data.toString();
			next(null);
		});
	}

	async.each(templatesToLoad, loadTemplate);

	callback();
};

Widget.renderUserSubsetGroupWidget = function(widget, callback) {
	var parseAsPost = !!widget.data.parseAsPost,
		text = widget.data.text,
		groupName = widget.data.groupName;

	groups.isMember(widget.uid, groupName, function(err, isMember) {
		if (isMember) {
			if (parseAsPost) {
				plugins.fireHook('filter:parse.raw', text, callback);
			} else {
				callback(null, text.replace(/\r\n/g, "<br />"));
			}
		} else {
			callback(undefined, null);	// purposefully pass back "null", which NodeBB will interpret as "hide widget"
		}
	});
};

Widget.renderUserSubsetLanguageWidget = function(widget, callback) {
	var parseAsPost = !!widget.data.parseAsPost,
		text = widget.data.text,
		languages = widget.data.language;

	if (!Array.isArray(languages)) {
		languages = [languages];
	}
	
	user.getSettings(widget.uid, function(err, settings) {
		var userLang = settings.userLang || meta.config.defaultLang;
		if (languages.indexOf(userLang) !== -1) {
			if (parseAsPost) {
				plugins.fireHook('filter:parse.raw', text, callback);
			} else {
				callback(null, text.replace(/\r\n/g, "<br />"));
			}
		} else {
			callback(undefined, null);	// purposefully pass back "null", which NodeBB will interpret as "hide widget"
		}
	});
};

Widget.defineWidgets = function(widgets, callback) {
	// widgets = widgets.concat([
	// 	{
	// 		widget: "user-subset-group",
	// 		name: "Text (by user group)",
	// 		description: "Text, optionally parsed as a post, shown only to members of a specific user group",
	// 		content: Widget.templates['admin/user-subset-group.tpl']
	// 	}
	// ]);

	async.parallel([
		function(next) {
			async.waterfall([
				async.apply(db.getSortedSetRevRange, 'groups:visible:createtime', 0, - 1),
				async.apply(groups.getGroupsData),
				function(groupsData, next) {
					groupsData = groupsData.filter(Boolean);

					templates.parse(Widget.templates['admin/user-subset-group.tpl'], { groups: groupsData }, function(html) {
						widgets.push({
							widget: "user-subset-group",
							name: "Text (by user group)",
							description: "Text, optionally parsed as a post, shown only to members of a specific user group",
							content: html
						});

						next();
					});
				}
			], next);
		},
		function(next) {
			languages.list(function(err, languages) {
				templates.parse(Widget.templates['admin/user-subset-language.tpl'], { languages: languages }, function(html) {
					widgets.push({
						widget: "user-subset-language",
						name: "Text (by user language)",
						description: "Text, optionally parsed as a post, shown only to members who have localised their interface to a subset of languages",
						content: html
					});

					next();
				});
			});
		}
	], function() {
		callback(null, widgets);
	});
};

module.exports = Widget;
