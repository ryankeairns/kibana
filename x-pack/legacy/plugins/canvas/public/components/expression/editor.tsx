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

  language: string;

  value: string;
  onChange: (value: string) => void;

  options?: monacoEditor.editor.IEditorConstructionOptions;

  // TODO: implement
  suggestionProvider: () => void;
  // TODO: implement
  signatureProvider: () => void;
  // TODO: implement
  hoverProvider: () => void;

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
