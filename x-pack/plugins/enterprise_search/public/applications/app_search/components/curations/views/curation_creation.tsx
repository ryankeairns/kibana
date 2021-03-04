/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';

import { useActions } from 'kea';

import { EuiPageHeader, EuiPageContent, EuiTitle, EuiText, EuiSpacer } from '@elastic/eui';
import { i18n } from '@kbn/i18n';

import { FlashMessages } from '../../../../shared/flash_messages';

import { CurationQueries } from '../components';
import { CREATE_NEW_CURATION_TITLE } from '../constants';
import { CurationsLogic } from '../index';

export const CurationCreation: React.FC = () => {
  const { createCuration } = useActions(CurationsLogic);

  return (
    <>
      <EuiPageHeader pageTitle={CREATE_NEW_CURATION_TITLE} />
      <FlashMessages />
      <EuiPageContent>
        <EuiTitle>
          <h2>
            {i18n.translate(
              'xpack.enterpriseSearch.appSearch.engine.curations.create.curationQueriesTitle',
              { defaultMessage: 'Curation queries' }
            )}
          </h2>
        </EuiTitle>
        <EuiText color="subdued">
          <p>
            {i18n.translate(
              'xpack.enterpriseSearch.appSearch.engine.curations.create.curationQueriesDescription',
              {
                defaultMessage:
                  'Add one or multiple queries to curate. You will be able add or remove more queries later.',
              }
            )}
          </p>
        </EuiText>
        <EuiSpacer />
        <CurationQueries queries={['']} onSubmit={(queries) => createCuration(queries)} />
      </EuiPageContent>
    </>
  );
};
