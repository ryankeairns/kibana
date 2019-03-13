/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { Fragment } from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiButtonIcon } from '@elastic/eui';
import { i18n } from '@kbn/i18n';


export class FeatureTooltip extends React.Component {


  _renderProperties() {
    return Object.keys(this.props.properties).map(propertyName => {
      /*
       * Justification for dangerouslySetInnerHTML:
       * Propery value contains value generated by Field formatter
       * Since these formatters produce raw HTML, this component needs to be able to render them as-is, relying
       * on the field formatter to only produce safe HTML.
       */

      const htmlValue = (<span
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: this.props.properties[propertyName]
        }}
      />);
      return (
        <div key={propertyName}>
          <span><strong>{propertyName}</strong></span>
          <span>{' '}</span>
          {htmlValue}
        </div>
      );
    });
  }

  render() {
    return (
      <Fragment>
        <EuiFlexGroup direction="column" gutterSize="none">
          <EuiFlexItem grow={true}>
            <EuiFlexGroup alignItems="flexEnd" direction="row" justifyContent="spaceBetween">
              <EuiFlexItem>&nbsp;</EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiButtonIcon
                  onClick={this.props.onCloseClick}
                  iconType="cross"
                  aria-label={i18n.translate('xpack.maps.tooltip.closeAreaLabel', {
                    defaultMessage: 'Close tooltip'
                  })}
                />
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
          <EuiFlexItem>
            {this._renderProperties()}
          </EuiFlexItem>
        </EuiFlexGroup>
      </Fragment>
    );
  }
}

