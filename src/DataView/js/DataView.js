import { useState, useEffect, useMemo, useCallback } from 'react';
import { html } from 'htm/react';
import AppBar from './AppBar';
import Tooltip from '@material-ui/core/Tooltip';
import Snackbar from '@material-ui/core/Snackbar';
import DataTable from './DataTable';
import { TableFilter } from './Filters';
import { ApolloClient, InMemoryCache, useQuery, useLazyQuery, useMutation, ApolloProvider } from '@apollo/client';
import config from './config';
import { GET_SLIDES_BY_STATUS, GET_SLIDES, UPDATE_SLIDEID, UPDATE_CASEID, DELETE_SLIDE, Statuses } from './graphql/queries';
import '../css/style.css';
import EditableField from './EditableField';
import GovernmentSystemBanner from './GovernmentSystemBanner';
import ResearchOnlyBanner from './ResearchOnlyBanner';

const client = new ApolloClient({
  uri: config.graphqlUri,
  cache: new InMemoryCache({
    typePolicies: {
      Slide: {
        keyFields: ["ImageID"]
      },
      Query: {
        fields: {
          querySlidesByStatus: {
            keyArgs: ["Status"],
            merge(existing = { }, incoming) {
              let mergedItems = [...existing.items || [], ...incoming.items];
              return {...incoming, items: mergedItems};
            },
          }
        }
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
      const imgSrc = `${config.imageUrlTemplate(value)}/label.jpeg`
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
      const imgSrc = `${config.imageUrlTemplate(value)}/thumbnail.jpeg`
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
    Cell: EditableField
  },
  {
    Header: 'Case ID',
    accessor: 'CaseID',
    Cell: EditableField
  },
  {
    Header: 'Scan Date',
    accessor: row => {
      if (row.ScanDate) return html`<div>${row.ScanDate.substring(0,10)}<br/>${row.ScanDate.substring(11,19)}</div>`;
    }
  },
  {
    Header: 'Mag',
    accessor: 'AppMag',
    Cell: ({value}) => `${value}X`
  },
];

function DataView() {
  const [statusFilter, setStatusFilter] = useState(Statuses[0]);
  const [casesFilter, setCasesFilter] = useState([]);
  const QueryByStatus = useQuery(GET_SLIDES_BY_STATUS, {client, variables: { statusFilter, limit: 20 }});
  const [getCaseData, QueryByCase] = useLazyQuery(GET_SLIDES, {client, variables: { ImageIDs: casesFilter }});
  const [updateSlideID] = useMutation(UPDATE_SLIDEID, {client});
  const [updateCaseID] = useMutation(UPDATE_CASEID, {client});
  const [deleteSlideMetadata] = useMutation(DELETE_SLIDE, {
    client,
    update(cache, { data: { updateSlide } }) {
      let key = `Slide:{"ImageID":"${updateSlide.ImageID}"}`;
      cache.evict(key)
    }
  });
  const [currentQuery, setCurrentQuery] = useState({loading: false, error: null, data: [], refetch: null});
  const [selectedImages, setSelectedImages] = useState([]);
  const byStatus = casesFilter.length == 0;
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    let currentQuery = byStatus ? {...QueryByStatus} : {...QueryByCase};
    currentQuery.data = currentQuery.data ? (byStatus ? QueryByStatus.data.Slides.items : QueryByCase.data.Slides) : [];
    currentQuery.moreData = byStatus && QueryByStatus.data && QueryByStatus.data.Slides.nextToken;
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
      case 'SlideID':
        updateSlideID({ variables: { ImageID: imageId, SlideID: value } });
        fieldName = "Slide ID";
        break;
      case 'CaseID':
        updateCaseID({ variables: { ImageID: imageId, CaseID: value } });
        fieldName = "Case ID";
        break;
    }
    setToastMessage(`${fieldName} for image ${imageId} set to "${value}".`);
  }

  const closeEditFeedback = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setToastMessage(null);
  };

  const deleteSlide = (imageId) => {
    deleteSlideMetadata({ variables: { ImageID: imageId } })
    .then(response => {
      setToastMessage(response.ok ? `Slide ${imageId} deleted.` : response.text);
    });
  }

  const fetchMore = () => QueryByStatus.fetchMore({
    variables: {
      nextToken: QueryByStatus.data.Slides.nextToken,
    },
  })

  return html`
    <${ApolloProvider} client=${client}>
      <div>
        <${AppBar}
          title=${config.appTitle}
          selectedImages=${selectedImages}
          refetch=${currentQuery.refetch}
          deleteSlide=${deleteSlide}
        />
        <${GovernmentSystemBanner} />
        <${ResearchOnlyBanner} />
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
          fetchMore=${currentQuery.moreData ? fetchMore : false}
        />
        <${Snackbar}
          anchorOrigin=${{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          open=${Boolean(toastMessage)}
          autoHideDuration=${3000}
          onClose=${closeEditFeedback}
          message=${toastMessage}
        />
      </div>
    </${ApolloProvider}>
  `
}

export default DataView;
