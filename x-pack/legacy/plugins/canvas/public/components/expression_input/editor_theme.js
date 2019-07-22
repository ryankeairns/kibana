/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import darkTheme from '@elastic/eui/dist/eui_theme_dark.json';
import lightTheme from '@elastic/eui/dist/eui_theme_light.json';

import chrome from 'ui/chrome';

const IS_DARK_THEME = chrome.getUiSettingsClient().get('theme:darkMode');

const themeName = IS_DARK_THEME ? darkTheme : lightTheme;

const syntaxTheme = {
  keyword: themeName.euiColorAccent,
  delimiter: themeName.euiColorSecondary,
  string: themeName.euiColorPrimary,
  number: themeName.euiColorWarning,
  symbol: themeName.euiColorDanger,

  foreground: themeName.euiColorDarkestShade,
  editorBackground: themeName.euiColorEmptyShade,
  lineNumbers: themeName.euiColorDarkShade,
  editorIndentGuide: themeName.euiColorLightShade,
  selectionBackground: '#E3E4ED',
  editorWidgetBackground: themeName.euiColorLightestShade,
  editorWidgetBorder: themeName.euiColorLightShade,
  findMatchBackground: themeName.euiColorWarning,
  findMatchHighlightBackground: themeName.euiColorWarning,
};

export const theme = {
  base: 'vs',
  inherit: true,
  rules: [
    { token: 'keyword', foreground: syntaxTheme.keyword, fontStyle: 'bold' },
    { token: 'comment', foreground: syntaxTheme.comment },
    { token: 'delimiter', foreground: syntaxTheme.delimiter },
    { token: 'string', foreground: syntaxTheme.string },
    { token: 'number', foreground: syntaxTheme.number },
    { token: 'boolean', foreground: syntaxTheme.symbol },
    { token: 'symbol', foreground: syntaxTheme.symbol },
    // We provide an empty string fallback
    { token: '', foreground: syntaxTheme.foreground },
  ],
  colors: {
    'editor.foreground': syntaxTheme.foreground,
    'editor.background': syntaxTheme.editorBackground,
    'editorLineNumber.foreground': syntaxTheme.lineNumbers,
    'editorLineNumber.activeForeground': syntaxTheme.lineNumbers,
    'editorIndentGuide.background': syntaxTheme.editorIndentGuide,
    'editor.selectionBackground': syntaxTheme.selectionBackground,
    'editorWidget.border': syntaxTheme.editorWidgetBorder,
    'editorWidget.background': syntaxTheme.editorWidgetBackground,
  },
};