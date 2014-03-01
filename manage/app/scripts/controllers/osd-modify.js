/* global define */
(function() {
    'use strict';
    define(['lodash', 'helpers/modal-helpers'], function(_, modalHelpers) {

        var OSDModifyController = function($log, $scope, ClusterService, OSDService, $location, $routeParams, $window, $modal) {
            if (ClusterService.clusterId === null) {
                $location.path('/first');
                return;
            }
            var makeOSDPatchFn = function(prefix, operation) {
                return function(id) {
                    var modal = $modal({
                        template: 'views/osd-cmd-modal.html',
                        title: 'Sending ' + prefix + ' Request to OSD ' + id,
                        html: true,
                        content: '<i class="fa fa-spinner fa-spin fa-lg"></i> Waiting...',
                        background: 'static'
                    });
                    modal.$scope.closeDisabled = true;
                    if (_.isFunction(operation)) {
                        operation = operation.call(undefined);
                    }
                    OSDService.patch(id, operation).then(function( /*resp*/ ) {
                        modal.$scope.title = prefix + ' Request Sent Successfully to OSD ' + id;
                        modal.$scope.content = 'Complete.';
                        modal.$scope.disableClose = true;
                        modal.$scope._hide = function() {
                            modal.$scope.$hide();
                            $window.history.back();
                        };
                    }, modalHelpers.makeOnError(modal));
                };
            };
            $scope.cancelFn = function() {
                $window.history.back();
            };
            $scope.down = makeOSDPatchFn('Down', {
                'up': false
            });
            $scope.out = makeOSDPatchFn('Out', {
                'in': false
            });
            $scope['in'] = makeOSDPatchFn('In', {
                'in': true
            });
            $scope.updateFn = makeOSDPatchFn('Update', function() {
                return {
                    'reweight': $scope.osd.reweight
                };
            });
            $scope.resetFn = function() {
                $scope.osd.reweight = $scope.defaults.reweight;
                $scope.osdForm.$setPristine(true);
            };
            $scope.tooltip = {
                title: 'Use Advanced Operations to change this'
            };
            $scope.clusterName = ClusterService.clusterModel.name;
            $scope.gotoServer = function(fqdn) {
                $location.path('/osd/server/' + fqdn);
            };
            OSDService.get($routeParams.id).then(function(osd) {
                $scope.defaults = angular.copy(osd);
                $scope.osd = osd;
                $scope.keys = ['uuid', 'up', 'in', 'reweight', 'server', 'pools'];
                $scope.up = true;
            });
        };
        return ['$log', '$scope', 'ClusterService', 'OSDService', '$location', '$routeParams', '$window', '$modal', OSDModifyController];
    });
})();