import { useState, useEffect, useMemo, useCallback } from 'react';
import { html } from 'htm/react';
import AppBar from './AppBar';
import Tooltip from '@material-ui/core/Tooltip';
import Snackbar from '@material-ui/core/Snackbar';
import DataTable from './DataTable';
import { TableFilter } from './Filters';
import { ApolloClient, InMemoryCache, useQuery, useLazyQuery, useMutation, ApolloProvider } from '@apollo/client';
import config from './config';
import { GET_SLIDES_BY_STATUS, BATCH_GET_SLIDES, UPDATE_SLIDEID, UPDATE_CASEID, Statuses } from './graphql/queries';
import '../css/style.css';
import EditableField from './EditableField';

const client = new ApolloClient({
  uri: config.graphqlUri,
  cache: new InMemoryCache({
    typePolicies: {
      Slide: {
        keyFields: ["ImageID"]
      }
    }
  }),
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
      const imgSrc = `${config.images_path}/${value}/label.jpg`
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
      const imgSrc = `${config.images_path}/${value}/thumbnail.jpg`
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
    Cell: EditableField
  },
  {
    Header: 'Case ID',
    accessor: 'CaseID',
    id: 'caseid',
    Cell: EditableField
  },
  { Header: 'Scan Date', accessor: row => {
      if (row.ScanDate) return html`<div>${row.ScanDate.substring(0,10)}<br/>${row.ScanDate.substring(11,19)}</div>`;
    }
  },
  { Header: 'Mag', accessor: 'AppMag', Cell: ({value}) => `${value}X` },
];

function DataView() {
  const [statusFilter, setStatusFilter] = useState(Statuses[0]);
  const [casesFilter, setCasesFilter] = useState([]);
  const QueryByStatus = useQuery(GET_SLIDES_BY_STATUS, {client, variables: { statusFilter }});
  const [getCaseData, QueryByCase] = useLazyQuery(BATCH_GET_SLIDES, {client, variables: { imageIds: casesFilter }});
  const [updateSlideID] = useMutation(UPDATE_SLIDEID, {client});
  const [updateCaseID] = useMutation(UPDATE_CASEID, {client});
  const [currentQuery, setCurrentQuery] = useState({loading: false, error: null, data: [], refetch: null});
  const [selectedImages, setSelectedImages] = useState([]);
  const byStatus = casesFilter.length == 0;
  const [editMessage, setEditMessage] = useState(null);

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

  const updateField = (row, columnId, value) => {
    let fieldName, imageId = row.values["ImageID"];
    switch(columnId) {
      case 'slideid':
        updateSlideID({ variables: { imageid: row.values["ImageID"], slideid: value } });
        fieldName = "Slide ID";
        break;
      case 'caseid':
        updateCaseID({ variables: { imageid: row.values["ImageID"], caseid: value } });
        fieldName = "Case ID";
        break;
    }
    setEditMessage(`${fieldName} for image ${imageId} set to "${value}".`);
  }

  const closeEditFeedback = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setEditMessage(null);
  };

  return html`
    <${ApolloProvider} client=${client}>
      <div>
        <${AppBar} title=${config.appTitle} selectedImages=${selectedImages} statusFilter=${statusFilter} refetch=${currentQuery.refetch} />
        <${TableFilter}
          statusFilter=${statusFilter}
          setCasesFilter=${setCasesFilter}
          onFilterClick=${(statusFilter) => setStatusFilter(statusFilter)}
        />
        ${currentQuery.error && html`<p>Error :( ${currentQuery.error.message}</p>`}
        <${DataTable} 
          columns=${columns} 
          data=${currentQuery.data} 
          loading=${currentQuery.loading}
          selectionChanged=${selectionChanged}
          updateField=${updateField}
        />
        <${Snackbar}
          anchorOrigin=${{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          open=${Boolean(editMessage)}
          autoHideDuration=${3000}
          onClose=${closeEditFeedback}
          message=${editMessage}
        />
      </div>
    </${ApolloProvider}>
  `
}

export default DataView;
