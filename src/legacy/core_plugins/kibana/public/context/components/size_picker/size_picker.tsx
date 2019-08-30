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
import { EuiFieldText } from '@elastic/eui';

export function SizePicker({
  count,
  isDisabled,
  onChangeCount,
  type,
}: {
  count: number;
  isDisabled: boolean;
  onChangeCount: (count: number) => void;
  type: string;
}) {
  return (
    <EuiFieldText
      aria-label={`Max number of ${type} records to display`}
      className="cxtSizePicker"
      data-test-subj={type === 'successor' ? 'successorCountPicker' : 'predecessorCountPicker'}
      disabled={isDisabled}
      onChange={ev => onChangeCount(Number(ev.target.value))}
      type="number"
      value={count}
    />
  );
}
