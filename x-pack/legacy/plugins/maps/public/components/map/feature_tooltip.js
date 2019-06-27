/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { Fragment } from 'react';
import {
  EuiButtonIcon,
  EuiText,
  EuiTextAlign,
  EuiPagination,
  EuiSuperSelect
} from '@elastic/eui';
import _ from 'lodash';
import { i18n } from '@kbn/i18n';
import { FeatureProperties } from './feature_properties';


const ALL_LAYERS = '_ALL_LAYERS_';
const DEFAULT_PAGE_NUMBER = 0;

export class FeatureTooltip extends React.Component {

  state = {
    uniqueLayers: [],
    pageNumber: DEFAULT_PAGE_NUMBER,
    layerIdFilter: ALL_LAYERS
  };

  componentDidMount() {
    this._isMounted = true;
  }

  componentDidUpdate() {
    this._loadUniqueLayers();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  _onLayerChange = (layerId) => {

    if (this.state.layerIdFilter === layerId) {
      return;
    }

    this.setState({
      pageNumber: DEFAULT_PAGE_NUMBER,
      layerIdFilter: layerId
    });
  };

  _onCloseTooltip = () => {
    this.setState({
      layerIdFilter: ALL_LAYERS,
      pageNumber: DEFAULT_PAGE_NUMBER
    }, () => {
      this.props.closeTooltip();
    });
  };

  _loadUniqueLayers = async () => {

    const uniqueLayerIds = [];
    for (let i = 0; i < this.props.tooltipState.features.length; i++) {
      let index = uniqueLayerIds.findIndex(({ layerId }) => {
        return layerId === this.props.tooltipState.features[i].layerId;
      });
      if (index < 0) {
        uniqueLayerIds.push({
          layerId: this.props.tooltipState.features[i].layerId,
          count: 0
        });
        index = uniqueLayerIds.length - 1;
      }
      uniqueLayerIds[index].count++;
    }

    const layers = uniqueLayerIds.map(({ layerId }) => {
      return this.props.findLayerById(layerId);
    });

    const layerNamePromises = layers.map(layer => {
      return layer.getDisplayName();
    });

    const layerNames = await Promise.all(layerNamePromises);
    const options = layers.map((layer, index) => {
      return {
        displayName: layerNames[index],
        id: layer.getId(),
        count: uniqueLayerIds[index].count
      };
    });

    if (this._isMounted) {
      if (!_.isEqual(this.state.uniqueLayers, options)) {
        this.setState({
          uniqueLayers: options,
          layerIdFilter: ALL_LAYERS,
          pageNumber: DEFAULT_PAGE_NUMBER
        });
      }
    }
  };


  _renderProperties(features) {
    const feature = features[this.state.pageNumber];
    if (!feature) {
      return null;
    }
    return (
      <FeatureProperties
        featureId={feature.id}
        layerId={feature.layerId}
        loadFeatureProperties={this.props.loadFeatureProperties}
        showFilterButtons={this.props.showFilterButtons}
      />
    );
  }

  _renderLayerFilterBox() {

    if (!this.props.showFeatureList) {
      return null;
    }

    if (!this.state.uniqueLayers || this.state.uniqueLayers.length < 2) {
      return null;
    }

    const layerOptions = this.state.uniqueLayers.map(({ id, displayName, count }) => {
      return {
        value: id,
        inputDisplay: (<EuiText>({count}) {displayName}</EuiText>)
      };
    });

    const options = [
      {
        value: ALL_LAYERS,
        inputDisplay: (<EuiText>All layers</EuiText>)
      },
      ...layerOptions
    ];

    return (
      <EuiSuperSelect
        options={options}
        onChange={this._onLayerChange}
        valueOfSelected={this.state.layerIdFilter}
      />
    );

  }

  _renderCloseButton() {
    if (!this.props.showCloseButton) {
      return null;
    }
    return (
      <EuiTextAlign textAlign="center">
        <EuiButtonIcon
          onClick={this._onCloseTooltip}
          iconType="cross"
          aria-label={i18n.translate('xpack.maps.tooltip.closeAriaLabel', {
            defaultMessage: 'Close tooltip'
          })}
          data-test-subj="mapTooltipCloseButton"
        />
      </EuiTextAlign>
    );
  }

  _onPageChange = (pageNumber) => {
    this.prevLayerId = null;
    this.prevFeatureId = null;
    this.setState({
      pageNumber: pageNumber,
    });
  };

  _filterFeatures() {
    if (this.state.layerIdFilter === ALL_LAYERS) {
      return this.props.tooltipState.features;
    }

    return this.props.tooltipState.features.filter((feature) => {
      return feature.layerId === this.state.layerIdFilter;
    });
  }

  _renderPagination(filteredFeatures) {

    if (filteredFeatures.length === 1) {
      return null;
    }

    if (!this.props.showFeatureList) {
      return (
        <EuiTextAlign textAlign="center">
          <EuiText>1 of {filteredFeatures.length}</EuiText>
        </EuiTextAlign>
      );
    }

    return (
      <EuiPagination
        pageCount={filteredFeatures.length}
        activePage={this.state.pageNumber}
        onPageClick={this._onPageChange}
      />
    );
  }

  render() {
    const filteredFeatures = this._filterFeatures();
    return (
      <Fragment>
        {this._renderCloseButton()}
        {this._renderProperties(filteredFeatures)}
        {this._renderPagination(filteredFeatures)}
        {this._renderLayerFilterBox()}
      </Fragment>
    );
  }
}

