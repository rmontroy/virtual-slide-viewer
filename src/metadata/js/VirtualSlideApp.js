import { useState, useEffect, useMemo, useReducer } from 'react';
import { html } from 'htm/react';
import {
  TopAppBar,
  TopAppBarRow,
  TopAppBarSection,
  TopAppBarTitle,
  TopAppBarActionItem,
  TopAppBarFixedAdjust
} from '@rmwc/top-app-bar';
import { Fab } from '@rmwc/fab';
import Tooltip from '@material-ui/core/Tooltip';
import Checkbox from '@material-ui/core/Checkbox';
import '@material/top-app-bar/dist/mdc.top-app-bar.css';
import '@material/icon-button/dist/mdc.icon-button.css';
import '@material/fab/dist/mdc.fab.css';
import '@material/ripple/dist/mdc.ripple.css';
import '@rmwc/icon/icon.css';
import SlideTable from './SlideTable';
import { TableFilter, Statuses } from './Filters';

import { ApolloClient, InMemoryCache, useQuery, ApolloProvider } from '@apollo/client';
import config from './app_config';
import { GET_SLIDES_BY_STATUS } from './graphql/queries';

import '../css/style.css';

const client = new ApolloClient({
  uri: config.graphqlUri,
  cache: new InMemoryCache(),
  headers: {
    'x-api-key': config.apiKey
  }
});

function AppBar({
  children
}) {
  let title = config.appTitle || 'Virtual Slide';
  return html`
    <div>
      <${TopAppBar} fixed>
        <${TopAppBarRow}>
          <${TopAppBarSection} alignStart>
            <${TopAppBarTitle}>${title}</${TopAppBarTitle}>
          </${TopAppBarSection}>
          <${TopAppBarSection} alignEnd>
            ${children}
          </${TopAppBarSection}>
        </${TopAppBarRow}>
      </${TopAppBar}>
      <${TopAppBarFixedAdjust} />
    </div>
  `
}

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
  const { loading, error, data, refetch } = useQuery(GET_SLIDES_BY_STATUS, {client, variables: { statusFilter }});
  const [selectedImages, toggleImageSelected] = useReducer(selectedImagesReducer, []);
  
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
    error && console.error(error);
  }, [error])
  
  return html`
    <${ApolloProvider} client=${client}>
      <div>
        <${AppBar}>
          <${Fab} trailingIcon="visibility" label="View" exited=${selectedImages.length == 0} tag="a" href=${"viewer?imageIds=" + selectedImages} />
          <${Tooltip} title="Refetch">
            <${TopAppBarActionItem} icon="refresh" onClick=${() => refetch()} />
          </${Tooltip}>
        </${AppBar}>
        <${TableFilter}
          statusFilter=${statusFilter}
          onFilterClick=${(statusFilter) => setStatusFilter(statusFilter)}
        />
        ${error && html`<p>Error :( ${error.message}</p>`}
        <${SlideTable} 
          columns=${columns} 
          data=${data ? data.Slides.items : []} 
          loading=${loading} 
          getRowProps=${rowProps}
        />
      </div>
    </${ApolloProvider}>
  `
}

export default VirtualSlideApp;
