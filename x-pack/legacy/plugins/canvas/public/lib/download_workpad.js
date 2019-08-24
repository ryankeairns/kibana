/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import fileSaver from 'file-saver';
import resolvePathname from 'resolve-pathname';
import { API_ROUTE_SNAPSHOT_RUNTIME_DOWNLOAD } from '../../common/lib/constants';
import { notify } from './notify';
import * as workpadService from './workpad_service';

export const downloadWorkpad = async workpadId => {
  try {
    const workpad = await workpadService.get(workpadId);
    const jsonBlob = new Blob([JSON.stringify(workpad)], { type: 'application/json' });
    fileSaver.saveAs(jsonBlob, `canvas-workpad-${workpad.name}-${workpad.id}.json`);
  } catch (err) {
    notify.error(err, { title: `Couldn't download workpad` });
  }
};

export const downloadRenderedWorkpad = async renderedWorkpad => {
  try {
    const jsonBlob = new Blob([JSON.stringify(renderedWorkpad)], { type: 'application/json' });
    fileSaver.saveAs(
      jsonBlob,
      `canvas-embed-workpad-${renderedWorkpad.name}-${renderedWorkpad.id}.json`
    );
  } catch (err) {
    notify.error(err, { title: `Couldn't download rendered workpad` });
  }
};

export const downloadEmbedRuntime = async () => {
  try {
    const base = resolvePathname('..', window.location.pathname);
    const path = resolvePathname(API_ROUTE_SNAPSHOT_RUNTIME_DOWNLOAD.substring(1), base);
    window.open(path);
    return;
  } catch (err) {
    notify.error(err, { title: `Couldn't download embed runtime` });
  }
};
