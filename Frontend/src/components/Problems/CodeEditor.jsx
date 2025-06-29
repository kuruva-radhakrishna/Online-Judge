import React from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-python';
import 'prismjs/themes/prism.css';

function highlight(code, language) {
  let grammar = Prism.languages[language] || Prism.languages.cpp;
  return Prism.highlight(code, grammar, language);
}

function CodeEditor({ value, onChange, language = 'cpp', placeholder = 'Write your code here...' }) {
  return (
    <div style={{ width: '100%' }}>
      <label style={{
        display: 'block',
        marginBottom: 6,
        fontWeight: 500,
        color: '#888',
        fontSize: '1rem'
      }}>{language.toUpperCase()} Code</label>
      <Editor
        value={value}
        onValueChange={onChange}
        highlight={code => highlight(code, language)}
        padding={16}
        placeholder={placeholder}
        style={{
          fontFamily: 'Fira Mono, Consolas, monospace',
          fontSize: '1rem',
          background: '#f5f7fa',
          borderRadius: 8,
          minHeight: 220,
          maxHeight: 400,
          outline: 'none',
          border: '1px solid #e0e0e0',
          width: '100%',
          boxSizing: 'border-box',
          marginBottom: 0,
          color: '#222',
          resize: 'vertical',
          overflow: 'auto',
        }}
      />
    </div>
  );
}

export default CodeEditor; 