import { useState, useEffect } from 'react';
import { html } from 'htm/react';
import {
  TopAppBar,
  TopAppBarRow,
  TopAppBarSection,
  TopAppBarTitle,
  TopAppBarActionItem,
  TopAppBarFixedAdjust
} from '@rmwc/top-app-bar';
import { Fab } from '@rmwc/fab'
import { Tooltip } from '@rmwc/tooltip'
import { Checkbox } from '@rmwc/checkbox'
import '@material/top-app-bar/dist/mdc.top-app-bar.css'
import '@material/icon-button/dist/mdc.icon-button.css'
import '@material/fab/dist/mdc.fab.css'
import '@material/checkbox/dist/mdc.checkbox.css'
import '@material/form-field/dist/mdc.form-field.css'
import '@material/ripple/dist/mdc.ripple.css'
import '@rmwc/icon/icon.css'
import '@rmwc/tooltip/tooltip.css'
import SlideTable from './SlideTable'

import { ApolloClient, InMemoryCache, useQuery } from "@apollo/client"
import config from "./app_config"
import { listSlides } from './graphql/queries'

import '../css/style.css'

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
            <${Tooltip} content=${html`
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
            <${Tooltip} content=${html`
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

function VirtualSlideApp() {
  const { loading, error, data, refetch } = useQuery(listSlides, {client});
  const [imageIdSortDir, setImageIdSortDir] = useState(null);
  const [slideIdSortDir, setSlideIdSortDir] = useState(null);
  const [scanDateSortDir, setScanDateSortDir] = useState(null);
  const [selectedImages, setSelectedImages] = useState({});
  const toggleImageSelected = row => () => {
    const selectedImagesNew = {...selectedImages};
    if (!!selectedImages[row.original["ImageID"]])
      delete selectedImagesNew[row.original["ImageID"]];
    else
      selectedImagesNew[row.original["ImageID"]] = true;
    setSelectedImages({...selectedImagesNew});
  }
  const renderCheckbox = ({ row }) => html`
          <${Checkbox}
            checked=${selectedImages[row.original["ImageID"]]}
            onChange=${toggleImageSelected(row)}
          />`
  const columns = makeColumns(renderCheckbox);

  useEffect(() => {
    error && console.error(error);
  }, [error])

  function applySort(column) {
    switch(column.id) {
      case "ImageID": return imageIdSortDir
      case "SlideID": return slideIdSortDir
      case "Scan Date": return scanDateSortDir
      default: return undefined
    }
  }

  function updateSort(sortDir, column) {
    switch(column.id) {
      case "ImageID": {
        setImageIdSortDir(sortDir);
        break;
      }
      case "SlideID": {
        setSlideIdSortDir(sortDir);
        break;
      } 
      case "Scan Date": {
        setScanDateSortDir(sortDir);
        break;
      } 
    }
  }
  const headerProps = column => ({
    sort: applySort(column),
    onSortChange: sortDir => {
      updateSort(sortDir, column);
    }
  });  

  const rowProps = row => ({
    onClick: toggleImageSelected(row)
  });
  
  return html`
    <div>
      <${AppBar}>
        <${Fab} trailingIcon="visibility" label="View" exited=${Object.keys(selectedImages).length == 0} onClick=${() => window.location.href="viewer?imageIds=" + Object.keys(selectedImages)} />
        <${Tooltip} content="Refetch">
          <${TopAppBarActionItem} icon="refresh" onClick=${() => refetch()} />
        </${Tooltip}>
      </${AppBar}>
      ${error && html`<p>Error :( ${error}</p>`}
      <${SlideTable} 
        columns=${columns} 
        data=${data ? data.listSlides.items : []} 
        loading=${loading} 
        getRowProps=${rowProps} 
        getHeaderProps=${headerProps} 
      />
    </div>
  `
}

export default VirtualSlideApp;
