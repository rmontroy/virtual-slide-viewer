import { useMemo } from 'react';
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
import '../css/style.css'
import '@material/top-app-bar/dist/mdc.top-app-bar.css'
import '@material/icon-button/dist/mdc.icon-button.css'
import '@material/fab/dist/mdc.fab.css'
import '@material/ripple/dist/mdc.ripple.css'
import '@rmwc/icon/icon.css'
import SlideTable from './SlideTable'

import ApolloClient from "apollo-boost"
import { ApolloProvider } from "react-apollo"
import { Query } from "react-apollo"
import config from "./app_config"
import { listSlides } from './graphql/queries'

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

function App() {
  const columns = useMemo(
    () => [ 
      {
        Header: 'Label',
        accessor: 'ImageID',
        id: 'label',
        Cell: ({value}) => {
          const labelUrl = `${config.vsv_bucket}/${value}/label.jpg`
          return html`
          <img
            style=${{ height: 72, "vertical-align": "middle" }}
            src=${labelUrl} alt="label"
          />
        `},
      },
      {
        Header: 'Thumbnail',
        accessor: 'ImageID',
        id: 'thumbnail',
        Cell: ({value}) => {
          const labelUrl = `${config.vsv_bucket}/${value}/thumbnail.jpg`
          return html`
              <img
                style=${{ height: 72, "vertical-align": "middle" }}
                src=${labelUrl} alt="label"
              />
          `
        },
      },
      { Header: 'Image ID', accessor: 'ImageID' },
      { Header: 'Barcode ID', accessor: 'BarcodeID' },
      { Header: 'Mag', accessor: 'AppMag' },
    ],
    []
  )

  const rowProps = row => ({
    onClick: () => row.toggleRowSelected(!row.isSelected)
  });

  return html`
    <${ApolloProvider} client=${client}>
      <${AppBar}>
        <${Fab} mini
          trailingIcon="visibility"
          label="View"
          tag="a"
          href="viewer"
        />
        <${TopAppBarActionItem} icon="refresh" />
      </${AppBar}>
      <${Query} query=${listSlides}>
        ${({ loading, error, data }) => {
          if (loading) return html`<p>Loading...</p>`;
          if (error) return html`<p>Error :(</p>`;

          const slideData = data.listSlides.items;
          return html`<${SlideTable} columns=${columns} data=${slideData} getRowProps=${rowProps} />`
        }}
      </${Query}>
      
    </${ApolloProvider}>
  `
}

export default App;
