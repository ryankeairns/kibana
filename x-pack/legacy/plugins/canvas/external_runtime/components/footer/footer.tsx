/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import { EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import { useExternalEmbedState, setScrubberVisible } from '../../context';
import { Scrubber } from './scrubber';
import { Title } from './title';
import { PageControls } from './page_controls';
import { Settings } from './settings';

// @ts-ignore CSS Module
import css from './footer.module';

export const FOOTER_HEIGHT = 48;

interface Props {
  hidden?: boolean;
}

export const Footer = ({ hidden = false }: Props) => {
  const [{ workpad, settings }] = useExternalEmbedState();
  if (!workpad) {
    return null;
  }

  const { autohide } = settings.toolbar;
  if (autohide && hidden) {
    setScrubberVisible(false);
  }

  return (
    <div className={css.root} style={{ height: FOOTER_HEIGHT }}>
      <Scrubber />
      <div className={css.bar} style={{ bottom: autohide && hidden ? -FOOTER_HEIGHT : 0 }}>
        <EuiFlexGroup>
          <EuiFlexItem>
            <Title />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <PageControls />
          </EuiFlexItem>
          <EuiFlexItem>
            <Settings />
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>
    </div>
  );
};
