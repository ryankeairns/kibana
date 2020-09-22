/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React from 'react';

import { i18n } from '@kbn/i18n';

import { SelectOption, SwitchOption } from '../../../../../../charts/public';

import { ChartType } from '../../../../../common/types';
import { VisParams } from '../../../../types';
import { ValidationVisOptionsProps } from '../../common';

export function ElasticChartsOptions(props: ValidationVisOptionsProps<VisParams>) {
  const { stateParams, setValue, vis } = props;

  return (
    <>
      <SwitchOption
        data-test-subj="detailedTooltip"
        label={i18n.translate('visTypeXy.editors.elasticChartsOptions.detailedTooltip', {
          defaultMessage: 'Show detailed tooltip',
        })}
        paramName="detailedTooltip"
        value={stateParams.detailedTooltip}
        setValue={setValue}
      />

      {[ChartType.Line, ChartType.Area].includes(vis.type.name as any) && (
        <SelectOption
          data-test-subj="fittingFunction"
          label={i18n.translate('visTypeXy.editors.elasticChartsOptions.missingValuesLabel', {
            defaultMessage: 'Fill missing values',
          })}
          options={vis.type.editorConfig.collections.fittingFunctions}
          paramName="fittingFunction"
          value={stateParams.fittingFunction}
          setValue={setValue}
        />
      )}
    </>
  );
}
