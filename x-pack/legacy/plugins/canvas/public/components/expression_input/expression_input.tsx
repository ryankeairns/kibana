/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { EuiFormRow, EuiTitle } from '@elastic/eui';
import { debounce, startCase } from 'lodash';
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';

import { Editor } from '../editor';

// @ts-ignore untyped local
// import {
//   // getAutocompleteSuggestions,
//   getFnArgDefAtPosition,
// } from '../../../common/lib/autocomplete'; // @ts-ignore untyped local
// @ts-ignore untyped local
import {
  getAutocompleteSuggestions,
  getFnArgDefAtPosition,
} from '../../../common/lib/autocomplete'; // @ts-ignore untyped local

// @ts-ignore untyped local
import { FunctionReference } from './function_reference';
// @ts-ignore untyped local
import { ArgumentReference } from './argument_reference';

import { language } from './expression_language';

// TODO: update this
interface ArgDef {
  text: string;
  name: string;
}

interface FunctionDef {
  name: string;
  help: string;
  args: {
    [key: string]: ArgDef;
  };
  type: string;
}

interface Props {
  fontSize: number;
  isAutocompleteEnabled: boolean;
  error?: string;
  value: string;
  functionDefinitions: FunctionDef[];
  onChange: (value?: string) => void;
}

interface State {
  selection: {
    start: number;
    end: number;
  };
  suggestions: FunctionDef[];
}

export class ExpressionInput extends React.Component<Props, State> {
  static propTypes = {
    functionDefinitions: PropTypes.array,
    value: PropTypes.string,
    onChange: PropTypes.func,
    error: PropTypes.string,
    isAutocompleteEnabled: PropTypes.bool,
  };

  undoHistory: string[];
  redoHistory: string[];
  editor: monacoEditor.editor.IStandaloneCodeEditor | null;

  constructor(props: Props) {
    super(props);

    this.editor = null;

    this.undoHistory = [];
    this.redoHistory = [];

    const { value } = props;

    this.state = {
      selection: {
        start: value.length,
        end: value.length,
      },
      suggestions: [],
    };
  }

  componentDidUpdate() {
    // if (!this.ref) {
    //   return;
    // }
    // const { selection } = this.state;
    // const { start, end } = selection;
    // this.ref.setSelectionRange(start, end);
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

  // getSelection() {
  //   if (!this.ref) {
  //     return null;
  //   }
  //   const start = this.ref.selectionStart;
  //   const finish = this.ref.selectionEnd;
  //   return this.ref.value.substring(start, finish);
  // }

  stash = debounce(
    (value: string) => {
      this.undoHistory.push(value);
      this.redoHistory = [];
    },
    500,
    { leading: true, trailing: false }
  );

  onKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
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

  // onSuggestionSelect = item => {
  //   const { text, start, end } = item;
  //   const value = this.props.value.substr(0, start) + text + this.props.value.substr(end);
  //   const selection = { start: start + text.length, end: start + text.length };
  //   this.updateState({ value, selection });

  //   // This is needed for when the suggestion was selected by clicking on it
  //   this.ref.focus();
  // };

  onChange = (value: string) => {
    // const { target } = e;
    // const { selectionStart, selectionEnd } = target;
    // const selection = {
    //   start: selectionStart,
    //   end: selectionEnd,
    // };

    this.updateState({ value });
  };

  updateState = ({ value }: { value: string }) => {
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

  // getReference = selectedItem => {
  //   const { fnDef, argDef } = selectedItem || {};
  //   if (argDef) {
  //     return <ArgumentReference argDef={argDef} />;
  //   }
  //   if (fnDef) {
  //     return <FunctionReference fnDef={fnDef} />;
  //   }

  //   const { fnDef: fnDefAtPosition, argDef: argDefAtPosition } = getFnArgDefAtPosition(
  //     this.props.functionDefinitions,
  //     this.props.value,
  //     this.state.selection.start
  //   );

  //   if (argDefAtPosition) {
  //     return <ArgumentReference argDef={argDefAtPosition} />;
  //   }
  //   if (fnDefAtPosition) {
  //     return <FunctionReference fnDef={fnDefAtPosition} />;
  //   }

  //   return '';
  // };

  suggestProvider = () => {
    return {
      signatureHelpTriggerCharacters: [' '],
      provideCompletionItems: (
        model: monacoEditor.editor.ITextModel,
        position: monacoEditor.Position
      ) => {
        // find out if we are completing a property in the 'dependencies' object.
        const text = model.getValue();
        const textRange = model.getFullModelRange();

        const lengthAfterPosition = model.getValueLengthInRange({
          startLineNumber: position.lineNumber,
          startColumn: position.column,
          endLineNumber: textRange.endLineNumber,
          endColumn: textRange.endColumn,
        });

        console.log(text);
        console.log(lengthAfterPosition);
        console.log(text.length - lengthAfterPosition);

        const aSuggestions = getAutocompleteSuggestions(
          this.props.functionDefinitions,
          text,
          text.length - lengthAfterPosition
        );

        console.log('Suggest');
        console.log(aSuggestions);

        const suggestions = aSuggestions.map((s: any) => {
          if (s.type === 'argument') {
            return {
              label: s.argDef.name,
              kind: monacoEditor.languages.CompletionItemKind.Field,
              documentation: { value: s.argDef.help, isTrusted: true },
              insertText: s.text,
              command: {
                id: 'editor.action.triggerSuggest',
              },
            };
          } else if (s.type === 'value') {
            return {
              label: s.text,
              kind: monacoEditor.languages.CompletionItemKind.Value,
              insertText: s.text,
              command: {
                id: 'editor.action.triggerParameterHints',
              },
            };
          } else {
            return {
              label: s.fnDef.name,
              kind: monacoEditor.languages.CompletionItemKind.Function,
              documentation: { value: s.fnDef.help, isTrusted: true },
              insertText: s.text,
              command: {
                id: 'editor.action.triggerParameterHints',
              },
            };
          }
        });

        return {
          suggestions,
        };
      },
    };
  };

  signatureProvider = () => {
    return {

      provideSignatureHelp: (
        model: monacoEditor.editor.ITextModel,
        position: monacoEditor.Position
      ) => {
        const text = model.getValue();
        const textRange = model.getFullModelRange();

        const lengthAfterPosition = model.getValueLengthInRange({
          startLineNumber: position.lineNumber,
          startColumn: position.column,
          endLineNumber: textRange.endLineNumber,
          endColumn: textRange.endColumn,
        });

        const { fnDef, argDef } = getFnArgDefAtPosition(
          this.props.functionDefinitions,
          text,
          text.length - lengthAfterPosition
        );
        console.log('checking');
        if (fnDef) {
          console.log(fnDef.args);
          return {
            signatures: [
              {
                label: `${fnDef.name} ${Object.values((fnDef as FunctionDef).args).map(
                  (arg: ArgDef) => arg.name
                )}=`,
                documentation: fnDef.help,
                parameters: Object.keys(fnDef.args).map(argName => {
                  const arg = fnDef.args[argName];
                  console.log(arg);
                  return {
                    label: arg.name,
                    documentation: arg.help,
                  };
                }),
              },
            ],
            activeSignature: 0,
            activeParameter: 0,
          };
        }

        return {
          signatures: [],
          activeSignature: 0,
          activeParameter: 0,
        };
      },
    };
  };

  render() {
    const { value, error, fontSize, functionDefinitions, isAutocompleteEnabled } = this.props;

    // TODO: I'm not sure we want to do this but waiting till we have function
    // definitions means we can easily get nice syntax highlighting on functions
    if (functionDefinitions.length === 0) {
      return null;
    }

    // TODO: Move this
    language.keywords = this.props.functionDefinitions.map(fn => fn.name);

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
          <Editor
            languageId="expression"
            languageDef={language}
            value={value}
            onChange={this.onChange}
            suggestionProvider={this.suggestProvider()}
            signatureProvider={this.signatureProvider()}
            height={250}
            options={{
              fontSize,
              quickSuggestions: isAutocompleteEnabled,
              minimap: {
                enabled: false,
              },
              wordBasedSuggestions: false,
            }}
          />
        </EuiFormRow>
      </div>
    );
  }
}
