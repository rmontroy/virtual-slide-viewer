import { useState, useEffect, useMemo, useCallback, useReducer } from 'react';
import { html } from 'htm/react';
import AppBar from './AppBar';
import Tooltip from '@material-ui/core/Tooltip';
import Snackbar from '@material-ui/core/Snackbar';
import DataTable from './DataTable';
import { TableFilter } from './Filters';
import { useQuery, useLazyQuery, useMutation } from '@apollo/client';
import config from './config';
import { GET_SLIDES_BY_STATUS, GET_SLIDES, UPDATE_SLIDEID, UPDATE_CASEID, UPDATE_STATUS, Statuses } from './graphql/queries';
import '../css/style.css';
import EditableField from './EditableField';
import Box from "@material-ui/core/Box";
import Chip from '@material-ui/core/Chip';

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
  { Header: 'Status', accessor: 'Status', id: 'Status' },
];

function hiddenColumnsReducer(hiddenColumns, delta) {
  return {...hiddenColumns, ...delta}
}

function DataView() {
  const [statusFilter, setStatusFilter] = useState(Statuses[0]);
  const [casesFilter, setCasesFilter] = useState([]);
  const QueryByStatus = useQuery(GET_SLIDES_BY_STATUS, {variables: { statusFilter, limit: 20 }});
  const [getCaseData, QueryByCase] = useLazyQuery(GET_SLIDES, {variables: { ImageIDs: casesFilter }});
  const [updateSlideID] = useMutation(UPDATE_SLIDEID);
  const [updateCaseID] = useMutation(UPDATE_CASEID);
  const [updateStatus] = useMutation(UPDATE_STATUS, {
    update(cache, { data: { updateSlide } }) {
      let key = `Slide:{"ImageID":"${updateSlide.ImageID}"}`;
      cache.evict(key)
    }
  });
  const [currentQuery, setCurrentQuery] = useState({loading: false, error: null, data: [], refetch: null});
  const [selectedImages, setSelectedImages] = useState([]);
  const byStatus = casesFilter.length == 0;
  const [toastMessage, setToastMessage] = useState(null);
  const [hiddenColumns, updateHiddenColumns] = useReducer(hiddenColumnsReducer, { Status: true });

  useEffect(() => {
    let currentQuery = byStatus ? {...QueryByStatus} : {...QueryByCase};
    currentQuery.data = currentQuery.data ? (byStatus ? QueryByStatus.data.Slides.items : QueryByCase.data.Slides) : [];
    currentQuery.moreData = byStatus && QueryByStatus.data && QueryByStatus.data.Slides.nextToken;
    setCurrentQuery(currentQuery);
  }, [QueryByStatus, QueryByCase, byStatus]);

  useEffect(() => {
    if (casesFilter.length > 0)
      getCaseData();
    updateHiddenColumns({Status: casesFilter.length == 0});
  }, [casesFilter, getCaseData, updateHiddenColumns]);

  const columns = useMemo(() => COLUMNS, []);

  useEffect(() => {
    currentQuery.error && console.error(currentQuery.error);
  }, [currentQuery.error])
  
  const selectionChanged = useCallback(selectedRows => setSelectedImages(selectedRows.map(row => (
      {
        ImageID: row.original["ImageID"],
        Filename: row.original["Filename"]
      }
    ))), [setSelectedImages]);

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

  const removeImages = (op, images) => {
    fetch('RemoveImages', {
      method: 'DELETE',
      credentials: 'same-origin',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json;charset=UTF-8'
      },
      body: JSON.stringify({
        Operation: op,
        Images: images
      })
    })
    .then(response => {
      if (response.ok) {
        images.forEach(image => updateStatus({ variables: { Status: op, ImageID: image.ImageID } }));
        let messageText = (op === 'TRANSFERRED' ? 'Transfer' : 'Delete') + ' images request submitted successfully.';
        setToastMessage(messageText);
      }
      else {
        console.error(response.statusText)
        setToastMessage(`Request failed.`);
      }
    })
    .catch(error => console.error(error));
  }

  const fetchMore = () => QueryByStatus.fetchMore({
    variables: {
      nextToken: QueryByStatus.data.Slides.nextToken,
    },
  })

  return html`
    <div>
      <${AppBar}
        title=${config.appTitle}
        selectedImages=${selectedImages}
        refetch=${currentQuery.refetch}
        removeImages=${removeImages}
        statusFilter=${statusFilter}
      />
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
        hiddenColumns=${hiddenColumns}
      />
      ${currentQuery.moreData && html`
        <${Box} display='flex' justifyContent='center' flexWrap='wrap' m=${3}>
          <${Chip}
            color=primary
            label='Fetch more rows'
            clickable 
            onClick=${fetchMore}
          />
        <//>
      `}
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
  `
}

export default DataView;
