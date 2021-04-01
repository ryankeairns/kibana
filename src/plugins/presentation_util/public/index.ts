/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { PresentationUtilPlugin } from './plugin';
import { pluginServices } from './services';

export { PresentationUtilPluginSetup, PresentationUtilPluginStart } from './types';

export {
  DashboardPicker,
  ExperimentsButton,
  ExperimentsFlyout,
  SavedObjectSaveModalDashboard,
  SaveModalDashboardProps,
} from './components';

export function plugin() {
  return new PresentationUtilPlugin();
}

export const useExperimentsService = () => {
  const {} = pluginServices.getHooks().experiments.useService();
};
