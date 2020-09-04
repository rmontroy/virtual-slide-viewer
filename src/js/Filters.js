import { useState, useEffect, useRef } from 'react';
import { html } from 'htm/react';
import { makeStyles } from '@material-ui/core/styles'
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField'
import FilterListIcon from '@material-ui/icons/FilterList'
import SearchIcon from '@material-ui/icons/Search'
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';
import Zoom from '@material-ui/core/Zoom'
import Chip from '@material-ui/core/Chip'

const useStyles = makeStyles((theme) => ({
  filterRoot: {
    position: 'relative',
    '& .MuiTextField-root': {
      margin: theme.spacing(0, 2),
    },
  },
  filterChips: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    '& > *': {
      margin: theme.spacing(1.25, 2),
    },
  },
  caseSearch: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    marginLeft: 'auto',
    marginRight: 'auto',
    width: 400,
    '& input': {
      transition: theme.transitions.create('width'),
      width: 100,
      '&:focus': {
        width: 220,
      },
    },
  },
  searchIcon: {
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

export function CaseFilter({inputRef, onBlur, value, onChangeValue}) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const loading = open && options.length === 0;

  useEffect(() => {
    let active = true;

    if (!loading) {
      return undefined;
    }

    (async () => {
      const response = await fetch('https://country.register.gov.uk/records.json?page-size=5000');
      const countries = await response.json();

      if (active) {
        setOptions(Object.keys(countries).map((key) => countries[key].item[0]));
      }
    })();

    return () => {
      active = false;
    };
  }, [loading]);

  useEffect(() => {
    if (!open) {
      setOptions([]);
    }
  }, [open]);

  return html`
    <${Autocomplete}
      multiple
      limitTags=${2}
      filterSelectedOptions
      id="case-filter"
      value=${value}
      onChange=${onChangeValue}
      style=${{ width: 350 }}
      open=${open}
      onOpen=${() => {
        setOpen(true);
      }}
      onClose=${() => {
        setOpen(false);
      }}
      getOptionSelected=${(option, value) => option.name === value.name}
      getOptionLabel=${(option) => option.name}
      options=${options}
      loading=${loading}
      renderInput=${(params) => html`
        <${TextField} ...${params} label="Case IDs" variant="outlined" margin="normal"
          inputRef=${inputRef} onBlur=${onBlur}
        />
      `}
      renderOption=${(option, { inputValue }) => {
        const matches = match(option.name, inputValue);
        const parts = parse(option.name, matches);

        return html`
          <div>
            ${parts.map((part, index) => html`
              <span key=${index} style=${{ fontWeight: part.highlight ? 700 : 400 }}>
                ${part.text}
              </span>
            `)}
          </div>
        `;
      }}
    />
  `;
}


const Filters = Object.freeze({
  QC:   Symbol('QC Inspection'),
  PATH:  Symbol('Pathology Review'),
});

export function TableFilter() {
  const classes = useStyles();
  const [filter, setFilter] = useState(Filters.QC);
  const [searching, setSearching] = useState(false);
  const [caseIDs, setCaseIDs] = useState([]);
  const searchInputRef = useRef();

  const handleSearching = () => {
    setSearching((prev) => !prev || caseIDs.length > 0);
  };

  useEffect(() => {
    if (searching) searchInputRef.current.focus();
  }, [searching])

  return html`
    <div className=${classes.filterRoot}>
      <${Zoom} in=${!searching} style=${{ transitionDelay: searching ? '0ms' : '100ms' }} appear=${false}>
        <div className=${classes.filterChips}>
          <${Chip} 
            color=${filter === Filters.QC ? 'primary' : 'default'} 
            variant=${filter === Filters.QC ? 'default' : 'outlined'} 
            label='QC Inspection'
            icon=${html`<${FilterListIcon} />`}
            clickable 
            onClick=${() => setFilter(Filters.QC)}
          />
          <${Chip} 
            color=${filter === Filters.PATH ? 'primary' : 'default'}
            variant=${filter === Filters.PATH ? 'default' : 'outlined'} 
            label='Pathology Review'
            icon=${html`<${FilterListIcon} />`}
            clickable
            onClick=${() => setFilter(Filters.PATH)}
          />
          <${Chip}
            variant='outlined'
            label='Case Search'
            icon=${html`<${SearchIcon} />`}
            clickable
            onClick=${handleSearching} />
        </div>
      </${Zoom}>
      <${Zoom} in=${searching} style=${{ transitionDelay: searching ? '100ms' : '0ms' }}>
        <div className=${classes.caseSearch}>
          <${CaseFilter}
            value=${caseIDs}
            onChangeValue=${(event, newValue) => {
              setCaseIDs([...newValue]);
              if (newValue.length == 0) searchInputRef.current.focus();
            }}
            inputRef=${searchInputRef}
            onBlur=${handleSearching}
          />
        </div>
      </${Zoom}>
    </div>
  `;
}
