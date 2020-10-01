/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import { i18n } from '@kbn/i18n';
import { find } from 'lodash';
import { uiRoutes } from '../../../angular/helpers/routes';
import { routeInitProvider } from '../../../lib/route_init';
import template from './index.html';
import { MonitoringViewBaseController } from '../../base_controller';
import { ApmOverview } from '../../../components/apm/overview';
import {
  CODE_PATH_APM,
  ALERT_MISSING_MONITORING_DATA,
  APM_SYSTEM_ID,
} from '../../../../common/constants';

uiRoutes.when('/apm', {
  template,
  resolve: {
    clusters: function (Private) {
      const routeInit = Private(routeInitProvider);
      return routeInit({ codePaths: [CODE_PATH_APM] });
    },
  },
  controller: class extends MonitoringViewBaseController {
    constructor($injector, $scope) {
      const $route = $injector.get('$route');
      const globalState = $injector.get('globalState');
      $scope.cluster = find($route.current.locals.clusters, {
        cluster_uuid: globalState.cluster_uuid,
      });

      super({
        title: i18n.translate('xpack.monitoring.apm.overview.routeTitle', {
          defaultMessage: 'APM server',
        }),
        pageTitle: i18n.translate('xpack.monitoring.apm.overview.pageTitle', {
          defaultMessage: 'APM server overview',
        }),
        api: `../api/monitoring/v1/clusters/${globalState.cluster_uuid}/apm`,
        defaultData: {},
        reactNodeId: 'apmOverviewReact',
        $scope,
        $injector,
        alerts: {
          shouldFetch: true,
          options: {
            alertTypeIds: [ALERT_MISSING_MONITORING_DATA],
            filters: [
              {
                stackProduct: APM_SYSTEM_ID,
              },
            ],
          },
        },
      });

      $scope.$watch(
        () => this.data,
        (data) => {
          this.renderReact(
            <ApmOverview
              alerts={this.alerts}
              {...data}
              onBrush={this.onBrush}
              zoomInfo={this.zoomInfo}
            />
          );
        }
      );
    }
  },
});
