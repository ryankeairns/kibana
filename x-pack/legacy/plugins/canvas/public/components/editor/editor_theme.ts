/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';

import darkTheme from '@elastic/eui/dist/eui_theme_dark.json';
import lightTheme from '@elastic/eui/dist/eui_theme_light.json';

import chrome from 'ui/chrome';

const IS_DARK_THEME = chrome.getUiSettingsClient().get('theme:darkMode');

const themeName = IS_DARK_THEME ? darkTheme : lightTheme;

const themeColors = {
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

export const theme: monacoEditor.editor.IStandaloneThemeData = {
  base: 'vs',
  inherit: true,
  rules: [
    { token: 'keyword', foreground: themeColors.keyword, fontStyle: 'bold' },
    { token: 'delimiter', foreground: themeColors.delimiter },
    { token: 'string', foreground: themeColors.string },
    { token: 'number', foreground: themeColors.number },
    { token: 'boolean', foreground: themeColors.symbol },
    { token: 'symbol', foreground: themeColors.symbol },
    // We provide an empty string fallback
    { token: '', foreground: themeColors.foreground },
  ],
  colors: {
    'editor.foreground': themeColors.foreground,
    'editor.background': themeColors.editorBackground,
    'editorLineNumber.foreground': themeColors.lineNumbers,
    'editorLineNumber.activeForeground': themeColors.lineNumbers,
    'editorIndentGuide.background': themeColors.editorIndentGuide,
    'editor.selectionBackground': themeColors.selectionBackground,
    'editorWidget.border': themeColors.editorWidgetBorder,
    'editorWidget.background': themeColors.editorWidgetBackground,
  },
};
