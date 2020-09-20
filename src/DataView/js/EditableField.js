import { useState, useEffect } from 'react';
import { html } from 'htm/react';
import TextField from '@material-ui/core/TextField';

// Create an editable cell renderer
const EditableField = ({
    value: initialValue,
    row: row,
    column: { id },
    updateField, // This is a custom function that we supplied to our table instance
  }) => {
    // We need to keep and update the state of the cell normally
    const [value, setValue] = useState(initialValue)
  
    const onChange = e => {
      setValue(e.target.value)
    }
  
    // We'll only update the external data when the input is blurred
    const onBlur = () => {
      updateField(row, id, value)
    }
  
    // If the initialValue is changed external, sync it up with our state
    useEffect(() => {
      setValue(initialValue)
    }, [initialValue])
  
    return html`<${TextField} value=${value} onChange=${onChange} onBlur=${onBlur} />`;
  }

  export default EditableField;