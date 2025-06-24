import TextField from '@mui/material/TextField';

function CodeEditor({ value, onChange, language = 'cpp', placeholder = 'Write your code here...' }) {
  return (
    <TextField
      className="code-editor"
      label={language.toUpperCase() + ' Code'}
      multiline
      minRows={10}
      maxRows={20}
      fullWidth
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      variant="outlined"
      InputProps={{
        style: {
          fontFamily: 'Fira Mono, Consolas, monospace',
          fontSize: '1rem',
          background: '#f5f7fa',
          borderRadius: 8,
        }
      }}
    />
  );
}

export default CodeEditor; 