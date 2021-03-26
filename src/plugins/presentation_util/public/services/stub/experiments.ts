/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import {
  experiments,
  experimentIDs,
  ExperimentID,
  ExperimentEnvironment,
  getExperimentIDs,
  Experiment,
} from '../../../common';
import { PluginServiceFactory } from '../create';
import {
  PresentationExperimentsService,
  isEnabledByStorageValue,
  applyExperimentStatus,
} from '../experiments';

export type ExperimentsServiceFactory = PluginServiceFactory<PresentationExperimentsService>;

export const experimentsServiceFactory: ExperimentsServiceFactory = () => {
  const reset = () =>
    experimentIDs.reduce((acc, id) => {
      const experiment = getExperiment(id);
      const defaultValue = experiment.isActive;

      acc[id] = {
        defaultValue,
        session: null,
        browser: null,
        kibana: defaultValue,
      };
      return acc;
    }, {} as { [id in ExperimentID]: { defaultValue: boolean; session: boolean | null; browser: boolean | null; kibana: boolean } });

  let statuses = reset();

  const getExperiments = () =>
    experimentIDs.reduce((acc, id) => {
      acc[id] = getExperiment(id);
      return acc;
    }, {} as { [id in ExperimentID]: Experiment });

  const getExperiment = (id: ExperimentID) => {
    const experiment = experiments[id];
    const value = statuses[id];
    const status = {
      session: isEnabledByStorageValue(experiment, 'session', value.session),
      browser: isEnabledByStorageValue(experiment, 'browser', value.browser),
      kibana: isEnabledByStorageValue(experiment, 'kibana', value.kibana),
    };

    return applyExperimentStatus(experiment, status);
  };

  const setExperimentStatus = (id: ExperimentID, env: ExperimentEnvironment, value: boolean) => {
    statuses[id] = { ...statuses[id], [env]: value };
  };

  return {
    getExperimentIDs,
    getExperiment,
    getExperiments,
    setExperimentStatus,
    reset: () => {
      statuses = reset();
    },
  };
};
