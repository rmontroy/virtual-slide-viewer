import { useState, useEffect, useMemo, useReducer } from 'react';
import { html } from 'htm/react';
import AppBar from './AppBar';
import Tooltip from '@material-ui/core/Tooltip';
import Checkbox from '@material-ui/core/Checkbox';
import SlideTable from './SlideTable';
import { TableFilter, Statuses } from './Filters';
import { ApolloClient, InMemoryCache, useQuery, useLazyQuery, ApolloProvider } from '@apollo/client';
import config from './app_config';
import { GET_SLIDES_BY_STATUS, BATCH_GET_SLIDES } from './graphql/queries';
import '../css/style.css';

const client = new ApolloClient({
  uri: config.graphqlUri,
  cache: new InMemoryCache(),
  headers: {
    'x-api-key': config.apiKey
  }
});

function makeColumns(renderCheckbox) {
  return [
    // A column for selection
    {
      id: 'selection',
      Cell: renderCheckbox
    },
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
    { Header: 'Image ID', accessor: 'ImageID' },
    { Header: 'Slide ID', accessor: 'SlideID' },
    { Header: 'Case ID', accessor: 'CaseID' },
    { Header: 'Scan Date', accessor: row => html`<div>${row.Date}<br/>${row.Time}</div>` },
    { Header: 'Mag', accessor: 'AppMag', Cell: ({value}) => `${value}X` },
  ]
}

function selectedImagesReducer(selectedImages, action) {
  const index = selectedImages.indexOf(action.imageID)
  if (index >= 0)
    return [...selectedImages.slice(0, index), ...selectedImages.slice(index+1)];
  else
    return [...selectedImages, action.imageID];
}

function VirtualSlideApp() {
  const [statusFilter, setStatusFilter] = useState(Statuses.QC);
  const [casesFilter, setCasesFilter] = useState([]);
  const QueryByStatus = useQuery(GET_SLIDES_BY_STATUS, {client, variables: { statusFilter }});
  const [getCaseData, QueryByCase] = useLazyQuery(BATCH_GET_SLIDES, {client, variables: { imageIds: casesFilter }});
  const [currentQuery, setCurrentQuery] = useState({loading: false, error: null, data: [], refetch: null});
  const [selectedImages, toggleImageSelected] = useReducer(selectedImagesReducer, []);
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

  // This is a dumb/expensive way to render row/item selection (since we're calling makeColumns()
  // whenever selectedImages changes), but it'll have to do until react-table v8 is released, since
  // the useRowSelect hook is seriously broken in react-table v7.
  // https://github.com/tannerlinsley/react-table/issues/2171#issuecomment-668123434
  // https://github.com/tannerlinsley/react-table/issues/2170#issuecomment-668120478
  // https://github.com/tannerlinsley/react-table/issues/2170#issuecomment-678419781
  const columns = useMemo(() => {
    const renderCheckbox = ({ row }) => html`
        <${Checkbox}
          checked=${selectedImages.includes(row.values["ImageID"])}
          onClick=${event => event.stopPropagation()}
          onChange=${() => toggleImageSelected({imageID: row.values["ImageID"]})}
        />`
    return makeColumns(renderCheckbox);
  }, [selectedImages]);

  const rowProps = row => ({
    onClick: () => toggleImageSelected({imageID: row.values["ImageID"]})
  });

  useEffect(() => {
    currentQuery.error && console.error(currentQuery.error);
  }, [currentQuery.error])
  
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
          getRowProps=${rowProps}
        />
      </div>
    </${ApolloProvider}>
  `
}

export default VirtualSlideApp;
