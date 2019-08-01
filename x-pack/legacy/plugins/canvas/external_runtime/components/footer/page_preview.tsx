/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import { useExternalEmbedState } from '../../context';
import { Page } from '../page';
import { setPage } from '../../context/actions';
import { CanvasPage } from '../../types';

// @ts-ignore CSS Module
import css from './page_preview.module';

interface Props {
  number: number;
  height: number;
  page: CanvasPage;
}

export const PagePreview = ({ number, page, height }: Props) => {
  const [{ workpad }, dispatch] = useExternalEmbedState();
  if (!workpad) {
    return null;
  }

  const { height: workpadHeight, width: workpadWidth } = workpad;
  const scale = height / workpadHeight;

  const onClick = (index: number) => dispatch(setPage(index));
  const style = {
    transform: `scale3d(${scale}, ${scale}, 1)`,
    height: workpadHeight * scale,
    width: workpadWidth * scale,
  };

  return (
    <div
      className={css.root}
      onClick={() => onClick(number)}
      onKeyPress={() => onClick(number)}
      style={style}
    >
      <Page page={page} />
    </div>
  );
};
