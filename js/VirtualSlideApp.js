import { useMemo, useState, useEffect } from 'react';
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
import '@material/top-app-bar/dist/mdc.top-app-bar.css'
import '@material/icon-button/dist/mdc.icon-button.css'
import '@material/fab/dist/mdc.fab.css'
import '@material/ripple/dist/mdc.ripple.css'
import '@rmwc/icon/icon.css'
import '@rmwc/tooltip/tooltip.css'
import SlideTable from './SlideTable'

import ApolloClient from "apollo-boost"
import { useQuery } from '@apollo/react-hooks';
import config from "./app_config"
import { listSlides } from './graphql/queries'

import '../css/style.css'

const client = new ApolloClient({
  uri: config.graphqlUri,
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

function makeColumns() {
  return [ 
      {
        Header: 'Label',
        accessor: 'ImageID',
        id: 'label',
        Cell: ({value}) => {
          const imgSrc = `${config.vsv_bucket}/${value}/label.jpg`
          return html`
            <${Tooltip} content=${html`
              <img
                style=${{ height: 200, "vertical-align": "middle" }}
                src=${imgSrc} alt="label"
              />
            `}>
              <img
                style=${{ height: 72, "vertical-align": "middle" }}
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
                style=${{ height: 200, "vertical-align": "middle" }}
                src=${imgSrc} alt="label"
              />
            `}>
              <img
                style=${{ height: 72, "vertical-align": "middle" }}
                src=${imgSrc} alt="label"
              />
            </${Tooltip}>
          `
        },
      },
      { Header: 'Image ID', accessor: 'ImageID' },
      { Header: 'Slide ID', accessor: 'SlideID' },
      { Header: 'Case ID', accessor: 'CaseID' },
      { Header: 'Case ID', accessor: 'CaseID' },
      { Header: 'Scan Date', accessor: row => html`${row.Date}<br/>${row.Time}` },
      { Header: 'Mag', accessor: 'AppMag' },
    ]
  }

function VirtualSlideApp() {
  const columns = useMemo(makeColumns, [])
  const { loading, error, data, refetch } = useQuery(listSlides, {client});
  const [imageIdSortDir, setImageIdSortDir] = useState(null);
  const [barcodeIdSortDir, setBarcodeIdSortDir] = useState(null);

  useEffect(() => {
    error && console.error(error);
  }, [error])

  function applySort(column) {
    switch(column.id) {
      case "ImageID": return imageIdSortDir
      case "BarcodeID": return barcodeIdSortDir
      default: return undefined
    }
  }

  function updateSort(sortDir, column) {
    switch(column.id) {
      case "ImageID": {
        setImageIdSortDir(sortDir);
        break;
      }
      case "BarcodeID": {
        setBarcodeIdSortDir(sortDir);
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
    onClick: () => row.toggleRowSelected(!row.isSelected)
  });

  return html`
    <div>
      <${AppBar}>
        <${Fab} trailingIcon="visibility" label="View" tag="a" href="viewer" />
        <${Tooltip} content="Refetch">
          <${TopAppBarActionItem} icon="refresh" onClick=${() => refetch()} />
        </${Tooltip}>
      </${AppBar}>
      ${error && html`<p>Error :( ${error}</p>`}
      <${SlideTable} columns=${columns} data=${data ? data.listSlides.items : []} loading=${loading} getRowProps=${rowProps} getHeaderProps=${headerProps} />      
    </div>
  `
}

export default VirtualSlideApp;
