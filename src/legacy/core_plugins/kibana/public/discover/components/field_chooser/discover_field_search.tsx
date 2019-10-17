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
import React, { OptionHTMLAttributes, ReactNode, useState } from 'react';
import { i18n } from '@kbn/i18n';
import {
  EuiFacetButton,
  EuiFieldSearch,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiPopover,
  EuiPopoverTitle,
  EuiSelect,
  EuiSwitch,
  EuiSpacer,
  EuiForm,
  EuiFormRow,
} from '@elastic/eui';
import { FormattedMessage } from '@kbn/i18n/react';

export interface State {
  searchable: string;
  aggregatable: string;
  type: string;
  missing: boolean;
  [index: string]: string | boolean;
}

export interface Props {
  /**
   * triggered on input of user into search field
   */
  onChange: (field: string, value: string | boolean | undefined) => void;

  /**
   * the input value of the user
   */
  value?: string;

  /**
   * types for the type filter
   */
  types: string[];
}

/**
 * Component is Discover's side bar to  search of available fields
 * Additionally there's a button displayed that allows the user to show/hide more filter fields
 */
export function DiscoverFieldSearch({ onChange, value, types }: Props) {
  if (typeof value !== 'string') {
    // at initial rendering value is undefined (angular related), this catches the warning
    // should be removed once all is react
    return null;
  }
  const searchPlaceholder = i18n.translate('kbn.discover.fieldChooser.searchPlaceHolder', {
    defaultMessage: 'Search fields',
  });
  const options = [
    { value: 'any', text: 'any' },
    { value: 'true', text: 'yes' },
    { value: 'false', text: 'no' },
  ];
  const typeOptions = types
    ? types.map(type => {
        return { value: type, text: type };
      })
    : [{ value: 'any', text: 'any' }];

  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [isPopoverOpen, setPopoverOpen] = useState(false);
  const [values, setValues] = useState<State>({
    searchable: 'any',
    aggregatable: 'any',
    type: 'any',
    missing: true,
  });

  const filterBtnAriaLabel = isPopoverOpen
    ? i18n.translate('kbn.discover.fieldChooser.toggleFieldFilterButtonHideAriaLabel', {
        defaultMessage: 'Hide field filter settings',
      })
    : i18n.translate('kbn.discover.fieldChooser.toggleFieldFilterButtonShowAriaLabel', {
        defaultMessage: 'Show field filter settings',
      });

  const handleFacetButtonClicked = () => {
    setPopoverOpen(!isPopoverOpen);
  };

  const applyFilterValue = (id: string, filterValue: string | boolean) => {
    switch (filterValue) {
      case 'any':
        console.dir('1');
        onChange(id, undefined);
        break;
      case 'true':
        console.dir('2');
        onChange(id, true);
        break;
      case 'false':
        console.dir('3');
        onChange(id, false);
        break;
      default:
        console.dir('4');
        onChange(id, filterValue);
    }
  };

  const isFilterActive = (name: string, filterValue: string | boolean) => {
    return name !== 'missing' && filterValue !== 'any';
  };

  const handleValueChange = (name: string, filterValue: string | boolean) => {
    const previousValue = values[name];
    updateFilterCount(name, previousValue, filterValue);
    const updatedValues = { ...values };
    updatedValues[name] = filterValue;
    setValues(updatedValues);
    applyFilterValue(name, filterValue);
  };

  const updateFilterCount = (
    name: string,
    previousValue: string | boolean,
    currentValue: string | boolean
  ) => {
    const previouslyFilterActive = isFilterActive(name, previousValue);
    const filterActive = isFilterActive(name, currentValue);
    const diff = Number(filterActive) - Number(previouslyFilterActive);
    setActiveFiltersCount(activeFiltersCount + diff);
  };

  const handleMissingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const missingValue = e.target.checked;
    handleValueChange('missing', missingValue);
  };

  const buttonContent = (
    <EuiFacetButton
      aria-label={filterBtnAriaLabel}
      data-test-subj="toggleFieldFilterButton"
      className="dscToggleFieldFilterButton"
      icon={<EuiIcon type="filter" />}
      isSelected={activeFiltersCount > 0}
      quantity={activeFiltersCount}
      onClick={handleFacetButtonClicked}
    >
      <FormattedMessage
        id="kbn.discover.fieldChooser.fieldFilterFacetButtonLabel"
        defaultMessage="Fields filtered"
      />
    </EuiFacetButton>
  );

  const select = (
    id: string,
    selectOptions: Array<{ text: ReactNode } & OptionHTMLAttributes<HTMLOptionElement>>,
    selectValue: string
  ) => {
    return (
      <EuiSelect
        id={`${id}-select`}
        options={selectOptions}
        value={selectValue}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
          handleValueChange(id, e.target.value)
        }
        aria-label={i18n.translate('kbn.discover.fieldChooser.filter.fieldSelectorLabel', {
          defaultMessage: 'Selection of {id} filter options',
          values: { id },
        })}
        data-test-subj={`${id}Select`}
      />
    );
  };

  const selectionPanel = (
    <div className="dscFieldSearch__formWrapper">
      <EuiForm>
        <EuiFormRow
          fullWidth
          label={i18n.translate('kbn.discover.fieldChooser.filter.aggregatableLabel', {
            defaultMessage: 'Aggregatable',
          })}
        >
          {select('aggregatable', options, values.aggregatable)}
        </EuiFormRow>
        <EuiFormRow
          fullWidth
          label={i18n.translate('kbn.discover.fieldChooser.filter.searchableLabel', {
            defaultMessage: 'Searchable',
          })}
        >
          {select('searchable', options, values.searchable)}
        </EuiFormRow>
        <EuiFormRow
          fullWidth
          label={i18n.translate('kbn.discover.fieldChooser.filter.typeLabel', {
            defaultMessage: 'Type',
          })}
        >
          {select('type', typeOptions, values.type)}
        </EuiFormRow>
        <EuiSpacer size="s" />
        <EuiSwitch
          label={i18n.translate('kbn.discover.fieldChooser.filter.hideMissingFieldsLabel', {
            defaultMessage: 'Hide missing fields',
          })}
          checked={values.missing}
          onChange={handleMissingChange}
          data-test-subj="missingSwitch"
        />
      </EuiForm>
    </div>
  );

  return (
    <React.Fragment>
      <EuiFlexGroup responsive={false} gutterSize={'s'}>
        <EuiFlexItem>
          <EuiFieldSearch
            aria-label={searchPlaceholder}
            data-test-subj="fieldFilterSearchInput"
            compressed
            fullWidth
            onChange={event => onChange('name', event.currentTarget.value)}
            placeholder={searchPlaceholder}
            value={value}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
      <div className="dscFieldSearch__filterWrapper">
        <EuiPopover
          id="dataPanelTypeFilter"
          panelClassName="euiFilterGroup__popoverPanel"
          panelPaddingSize="none"
          anchorPosition="downLeft"
          display="block"
          isOpen={isPopoverOpen}
          closePopover={() => {}}
          button={buttonContent}
        >
          <EuiPopoverTitle>
            {i18n.translate('kbn.discover.fieldChooser.filter.filterByTypeLabel', {
              defaultMessage: 'Filter by type',
            })}
          </EuiPopoverTitle>
          {selectionPanel}
        </EuiPopover>
      </div>
    </React.Fragment>
  );
}
