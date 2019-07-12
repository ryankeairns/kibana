/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { EuiFormRow, EuiTitle } from '@elastic/eui';
import { debounce, startCase } from 'lodash';
import MonacoEditor from 'react-monaco-editor';
import lightTheme from '@elastic/eui/dist/eui_theme_light.json';
import {
  // getAutocompleteSuggestions,
  getFnArgDefAtPosition,
} from '../../../common/lib/autocomplete';
import { FunctionReference } from './function_reference';
import { ArgumentReference } from './argument_reference';

const themeName = lightTheme;

const syntaxTheme = {
  keyword: themeName.euiColorAccent,
  comment: themeName.euiColorDarkShade,
  delimiter: themeName.euiColorSecondary,
  string: themeName.euiColorPrimary,
  number: themeName.euiColorWarning,
  regexp: themeName.euiColorPrimary,
  types: themeName.euiColorVis9,
  annotation: themeName.euiColorLightShade,
  tag: themeName.euiColorAccent,
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

/* eslint-disable */
const language = {
  keywords: ['essql', 'mapColumn', 'ply', 'staticColumn'],

  symbols: /[=|]/,
  digits: /\d+(_+\d+)*/,

  tokenizer: {
		root: [ [/[{}]/, 'delimiter.bracket'], { include: 'common' } ],

    common: [
			// identifiers and keywords
			[/[a-z_$][\w$]*/, {
				cases: {
					'@keywords': 'keyword',
					'@default': 'identifier'
				}
      }],
      
      [/"([^"\\]|\\.)*$/, 'string.invalid'],  // non-teminated string
			[/'([^'\\]|\\.)*$/, 'string.invalid'],  // non-teminated string
			[/"/, 'string'],
			[/'/, 'string'],

      [/@symbols/, 'delimiter']
    ],
  },
};
/* eslint-enable */

export class ExpressionInput extends React.Component {
  constructor({ value }) {
    super();

    this.undoHistory = [];
    this.redoHistory = [];

    this.state = {
      selection: {
        start: value.length,
        end: value.length,
      },
      suggestions: [],
    };
  }

  componentDidUpdate() {
    if (!this.ref) {
      return;
    }
    const { selection } = this.state;
    const { start, end } = selection;
    this.ref.setSelectionRange(start, end);
  }

  undo() {
    if (!this.undoHistory.length) {
      return;
    }
    const value = this.undoHistory.pop();
    this.redoHistory.push(this.props.value);
    this.props.onChange(value);
  }

  redo() {
    if (!this.redoHistory.length) {
      return;
    }
    const value = this.redoHistory.pop();
    this.undoHistory.push(this.props.value);
    this.props.onChange(value);
  }

  getSelection() {
    if (!this.ref) {
      return null;
    }
    const start = this.ref.selectionStart;
    const finish = this.ref.selectionEnd;
    return this.ref.value.substring(start, finish);
  }

  stash = debounce(
    value => {
      this.undoHistory.push(value);
      this.redoHistory = [];
    },
    500,
    { leading: true, trailing: false }
  );

  onKeyDown = e => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          this.redo();
        } else {
          this.undo();
        }
      }
      if (e.key === 'y') {
        e.preventDefault();
        this.redo();
      }
    }
  };

  onSuggestionSelect = item => {
    const { text, start, end } = item;
    const value = this.props.value.substr(0, start) + text + this.props.value.substr(end);
    const selection = { start: start + text.length, end: start + text.length };
    this.updateState({ value, selection });

    // This is needed for when the suggestion was selected by clicking on it
    this.ref.focus();
  };

  onChange = value => {
    console.log(value);

    // const { target } = e;
    // const { selectionStart, selectionEnd } = target;
    // const selection = {
    //   start: selectionStart,
    //   end: selectionEnd,
    // };

    this.updateState({ value });
  };

  updateState = ({ value }) => {
    this.stash(this.props.value);
    // const suggestions = getAutocompleteSuggestions(
    //   this.props.functionDefinitions,
    //   value,
    //   selection.start
    // );
    this.props.onChange(value);
    // this.setState({ selection, suggestions });
  };

  getHeader = () => {
    const { suggestions } = this.state;
    if (!suggestions.length) {
      return '';
    }
    return (
      <EuiTitle className="autocompleteType" size="xs">
        <h3>{startCase(suggestions[0].type)}</h3>
      </EuiTitle>
    );
  };

  getReference = selectedItem => {
    const { fnDef, argDef } = selectedItem || {};
    if (argDef) {
      return <ArgumentReference argDef={argDef} />;
    }
    if (fnDef) {
      return <FunctionReference fnDef={fnDef} />;
    }

    const { fnDef: fnDefAtPosition, argDef: argDefAtPosition } = getFnArgDefAtPosition(
      this.props.functionDefinitions,
      this.props.value,
      this.state.selection.start
    );

    if (argDefAtPosition) {
      return <ArgumentReference argDef={argDefAtPosition} />;
    }
    if (fnDefAtPosition) {
      return <FunctionReference fnDef={fnDefAtPosition} />;
    }

    return '';
  };

  editorWillMount = monaco => {
    // Register a new language
    monaco.languages.register({ id: 'mySpecialLanguage' });

    // Register a tokens provider for the language
    monaco.languages.setMonarchTokensProvider('mySpecialLanguage', language);

    monaco.editor.defineTheme('euiColors', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: syntaxTheme.keyword, fontStyle: 'bold' },
        { token: 'comment', foreground: syntaxTheme.comment },
        { token: 'delimiter', foreground: syntaxTheme.delimiter },
        { token: 'string', foreground: syntaxTheme.string },
        { token: 'number', foreground: syntaxTheme.number },
        { token: 'regexp', foreground: syntaxTheme.regexp },
        { token: 'type', foreground: syntaxTheme.types },
        { token: 'annotation', foreground: syntaxTheme.annotation },
        { token: 'tag', foreground: syntaxTheme.tag },
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
    });
    monaco.editor.setTheme('euiColors');
  };

  editorDidMount = (editor, monaco) => {
    console.log('editorDidMount', editor);
    monaco.editor.defineTheme('euiColors', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: syntaxTheme.keyword, fontStyle: 'bold' },
        { token: 'comment', foreground: syntaxTheme.comment },
        { token: 'delimiter', foreground: syntaxTheme.delimiter },
        { token: 'string', foreground: syntaxTheme.string },
        { token: 'number', foreground: syntaxTheme.number },
        { token: 'regexp', foreground: syntaxTheme.regexp },
        { token: 'type', foreground: syntaxTheme.types },
        { token: 'annotation', foreground: syntaxTheme.annotation },
        { token: 'tag', foreground: syntaxTheme.tag },
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
    });
    monaco.editor.setTheme('euiColors');
    monaco.editor.language = 'mySpecialLanguage';

    editor.focus();
  };

  render() {
    const { value, error, fontSize } = this.props;
    // const { suggestions } = this.state;

    const helpText = error
      ? null
      : 'This is the coded expression that backs this element. You better know what you are doing here.';
    return (
      <div className="expressionInput">
        <EuiFormRow
          className="expressionInput--inner"
          fullWidth
          isInvalid={Boolean(error)}
          error={error}
          helpText={helpText}
        >
          <MonacoEditor
            theme="euiColors"
            language="mySpecialLanguage"
            value={value}
            onChange={this.onChange}
            // editorWillMount={this.editorWillMount}
            editorDidMount={this.editorDidMount}
            height={250}
            options={{
              fontSize,
              minimap: {
                enabled: false,
              },
            }}
          />
          {/* {isAutocompleteEnabled ? (
            <Autocomplete
              header={this.getHeader()}
              items={suggestions}
              onSelect={this.onSuggestionSelect}
              reference={this.getReference}
            >
              <EuiTextArea
                onKeyDown={this.onKeyDown}
                className="canvasTextArea--code"
                value={value}
                onChange={this.onChange}
                inputRef={ref => (this.ref = ref)}
                spellCheck="false"
                style={{ fontSize: `${fontSize}px` }}
                resize="none"
              />
            </Autocomplete>
          ) : (
            <EuiTextArea
              onKeyDown={this.onKeyDown}
              className="canvasTextArea--code"
              value={value}
              onChange={this.onChange}
              inputRef={ref => (this.ref = ref)}
              spellCheck="false"
              style={{ fontSize: `${fontSize}px` }}
              resize="none"
            />
          )} */}
        </EuiFormRow>
      </div>
    );
  }
}

ExpressionInput.propTypes = {
  functionDefinitions: PropTypes.array,
  value: PropTypes.string,
  onChange: PropTypes.func,
  error: PropTypes.string,
  isAutocompleteEnabled: PropTypes.bool,
};
