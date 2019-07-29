/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';

import MonacoEditor, { EditorDidMount, EditorWillMount } from 'react-monaco-editor';
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';
import 'monaco-editor/esm/vs/editor/contrib/suggest/suggestController.js';
import 'monaco-editor/esm/vs/editor/contrib/parameterHints/parameterHints.js';

interface Props {
  /**
   * Width of editor. Defaults to 100%.
   */
  width?: string | number;

  /**
   * Height of editor. Defaults to 500.
   */
  height?: string | number;

  languageId: string;
  languageDef:
    | monacoEditor.languages.IMonarchLanguage
    | PromiseLike<monacoEditor.languages.IMonarchLanguage>;

  value: string;
  onChange: (value: string) => void;

  options?: monacoEditor.editor.IEditorConstructionOptions;

  // TODO: implement
  suggestionProvider?: monaco.languages.CompletionItemProvider;
  // TODO: implement
  signatureProvider?: monaco.languages.SignatureHelpProvider;
  // TODO: implement
  hoverProvider?: monaco.languages.HoverProvider;

  editorWillMount?: EditorWillMount;
  overrideEditorWillMount?: EditorWillMount;

  editorDidMount: EditorDidMount;
}

class Editor extends React.Component<Props, {}> {
  editor: monacoEditor.editor.IStandaloneCodeEditor | null;

  editorWillMount(monaco: typeof monacoEditor) {
    if (this.props.overrideEditorWillMount) {
      this.props.overrideEditorWillMount(monaco);
      return;
    }

    // Setup on language handler here which registers all our code providers for the language
    // https://microsoft.github.io/monaco-editor/api/modules/monaco.languages.html#onlanguage

    monaco.languages.register({ id: this.props.languageId });
    monaco.languages.setMonarchTokensProvider(this.props.languageId, this.props.languageDef);

    monaco.languages.onLanguage(this.props.languageId, () => {
      if (this.props.suggestionProvider) {
        monaco.languages.registerCompletionItemProvider(
          this.props.languageId,
          this.props.suggestionProvider
        );
      }

      if (this.props.signatureProvider) {
        monaco.languages.registerSignatureHelpProvider(
          this.props.languageId,
          this.props.signatureProvider
        );
      }

      if (this.props.hoverProvider) {
        monaco.languages.registerHoverProvider(this.props.languageId, this.props.hoverProvider);
      }
    });

    if (this.props.editorWillMount) {
      this.props.editorWillMount(monaco);
    }
  }

  editorDidMount = (
    editor: monacoEditor.editor.IStandaloneCodeEditor,
    monaco: typeof monacoEditor
  ) => {
    this.editor = editor;

    if (this.props.editorDidMount) {
      this.props.editorDidMount(editor, monaco);
    }
  };

  componentDidMount() {
    const width = this.props.width ? '' + this.props.width : null;

    // If width isn't specified OR it's variable, re-layout
    // TODO: Maybe there is a better way to handle this
    if (!width || width[width.length - 1] === '%') {
      window.addEventListener('resize', this.updateDimensions);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateDimensions);
  }

  render() {
    return (
      <MonacoEditor
        theme="euiColors"
        language="mySpecialLanguage"
        value={this.props.value}
        onChange={this.props.onChange}
        editorWillMount={this.editorWillMount}
        editorDidMount={this.props.editorDidMount}
        height={250}
        options={this.props.options}
      />
    );
  }

  updateDimensions = () => {
    if (this.editor) {
      this.editor.layout();
    }
  };
}
