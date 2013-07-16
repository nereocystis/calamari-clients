/*global define*/

define(['jquery', 'underscore', 'backbone', 'models/usage-model', 'models/health-model','marionette'], function($, _, Backbone, UsageModel, HealthModel) {
    'use strict';
    return Backbone.Marionette.ItemView.extend({
        healthTimer: null,
        usageTimer: null,
        usageModel: null,
        healthModel: null,
        delay: 20000,
        initialize: function() {
            this.healthModel = new HealthModel();
            this.usageModel = new UsageModel();
            this.App = Backbone.Marionette.getOption(this, 'App');
            _.bindAll(this, 'fetchHealth', 'stop');
        },
        fetchHealth: function() {
            var self = this;
            this.healthTimer = setTimeout(function() {
                self.healthModel.fetch({
                    success: function(model /*, response, options*/ ) {
                        self.App.vent.trigger('health:update', model);
                        self.healthTimer = self.fetchHealth();
                    },
                    error: function(model, response) {
                        console.log(response);
                        self.healthTimer = self.fetchHealth();
                    }
                });
            }, self.delay);
            return this.healthTimer;
        },
        fetchUsage: function() {
            var self = this;
            this.usageTimer = setTimeout(function() {
                self.usageModel.fetch({
                    success: function(model /*, response, options*/ ) {
                        self.App.vent.trigger('usage:update', model);
                        self.usageTimer = self.fetchUsage();
                    },
                    error: function(model, response) {
                        console.log(response);
                        self.usageTimer = self.fetchUsage();
                    }
                });
            }, self.delay);
            return this.healthTimer;
        },
        stop: function() {
            clearTimeout(this.healthTimer);
            this.healthTimer = null;
            clearTimeout(this.usageTimer);
            this.usageTimer = null;
        }
    });
});