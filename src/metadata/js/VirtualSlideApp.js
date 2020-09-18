import { useState, useEffect, useMemo, useCallback } from 'react';
import { html } from 'htm/react';
import AppBar from './AppBar';
import Tooltip from '@material-ui/core/Tooltip';
import SlideTable from './SlideTable';
import { TableFilter, Statuses } from './Filters';
import { ApolloClient, InMemoryCache, useQuery, useLazyQuery, ApolloProvider } from '@apollo/client';
import config from './app_config';
import { GET_SLIDES_BY_STATUS, BATCH_GET_SLIDES } from './graphql/queries';
import '../css/style.css';
import TextField from '@material-ui/core/TextField';

const client = new ApolloClient({
  uri: config.graphqlUri,
  cache: new InMemoryCache(),
  headers: {
    'x-api-key': config.apiKey
  }
});

const COLUMNS = 
[
  {
    Header: 'Label',
    accessor: 'ImageID',
    id: 'label',
    Cell: ({value}) => {
      const imgSrc = `${config.vsv_bucket}/${value}/label.jpg`
      return html`
        <${Tooltip} title=${html`
          <img
            style=${{ height: 200, "verticalAlign": "middle" }}
            src=${imgSrc} alt="label"
          />
        `}>
          <img
            style=${{ height: 72, "verticalAlign": "middle" }}
            src=${imgSrc} alt="label"
          />
        </${Tooltip}>
      `
    },
  },
  {
    Header: 'Thumbnail',
    accessor: 'ImageID',
    id: 'thumbnail',
    Cell: ({value}) => {
      const imgSrc = `${config.vsv_bucket}/${value}/thumbnail.jpg`
      return html`
        <${Tooltip} title=${html`
          <img
            style=${{ height: 200, "verticalAlign": "middle" }}
            src=${imgSrc} alt="thumbnail"
          />
        `}>
          <img
            style=${{ height: 72, "verticalAlign": "middle" }}
            src=${imgSrc} alt="thumbnail"
          />
        </${Tooltip}>
      `
    },
  },
  { Header: 'Image ID', accessor: 'ImageID' },
  {
    Header: 'Slide ID',
    accessor: 'SlideID',
    id: 'slideid',
    Cell: ({ value }) => html`
      <${TextField}
        defaultValue=${value}
        onClick=${event => event.stopPropagation()}
      />`
  },
  {
    Header: 'Case ID',
    accessor: 'CaseID',
    id: 'caseid',
    Cell: ({ value }) => html`
      <${TextField}
        defaultValue=${value}
        onClick=${event => event.stopPropagation()}
      />`
  },
  { Header: 'Scan Date', accessor: row => html`<div>${row.Date}<br/>${row.Time}</div>` },
  { Header: 'Mag', accessor: 'AppMag', Cell: ({value}) => `${value}X` },
];

function VirtualSlideApp() {
  const [statusFilter, setStatusFilter] = useState(Statuses.QC);
  const [casesFilter, setCasesFilter] = useState([]);
  const QueryByStatus = useQuery(GET_SLIDES_BY_STATUS, {client, variables: { statusFilter }});
  const [getCaseData, QueryByCase] = useLazyQuery(BATCH_GET_SLIDES, {client, variables: { imageIds: casesFilter }});
  const [currentQuery, setCurrentQuery] = useState({loading: false, error: null, data: [], refetch: null});
  const [selectedImages, setSelectedImages] = useState([]);
  const byStatus = casesFilter.length == 0;

  useEffect(() => {
    let currentQuery = byStatus ? {...QueryByStatus} : {...QueryByCase};
    currentQuery.data = currentQuery.data ? (byStatus ? QueryByStatus.data.Slides.items : QueryByCase.data.Slides) : [];
    setCurrentQuery(currentQuery);
  }, [QueryByStatus, QueryByCase, byStatus]);

  useEffect(() => {
    if (casesFilter.length > 0)
      getCaseData();
  }, [casesFilter, getCaseData]);

  const columns = useMemo(() => COLUMNS, []);

  useEffect(() => {
    currentQuery.error && console.error(currentQuery.error);
  }, [currentQuery.error])
  
  const selectionChanged = useCallback(selectedRows => setSelectedImages(selectedRows.map(row => row.values["ImageID"])),
    [setSelectedImages]);

  return html`
    <${ApolloProvider} client=${client}>
      <div>
        <${AppBar} title=${config.appTitle} selectedImages=${selectedImages} refetch=${currentQuery.refetch} />
        <${TableFilter}
          statusFilter=${statusFilter}
          setCasesFilter=${setCasesFilter}
          onFilterClick=${(statusFilter) => setStatusFilter(statusFilter)}
        />
        ${currentQuery.error && html`<p>Error :( ${currentQuery.error.message}</p>`}
        <${SlideTable} 
          columns=${columns} 
          data=${currentQuery.data} 
          loading=${currentQuery.loading}
          selectionChanged=${selectionChanged}
        />
      </div>
    </${ApolloProvider}>
  `
}

export default VirtualSlideApp;
