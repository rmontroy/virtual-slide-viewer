import { html } from 'htm/react';
import { makeStyles } from '@material-ui/core/styles'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import LinearProgress from '@material-ui/core/LinearProgress'
import Chip from '@material-ui/core/Chip'
import '@material/data-table/dist/mdc.data-table.css'
import '@rmwc/data-table/data-table.css'
import { useTable } from 'react-table'

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    '& > *': {
      margin: theme.spacing(0.5),
    },
  },
}));

function SlideTable({
  columns,
  data,
  loading,
  getHeaderProps = () => ({}),
  getRowProps = () => ({})
})
{
  const { 
    getTableProps, 
    headerGroups, 
    rows, 
    prepareRow,
    visibleColumns,
  } = useTable({ columns, data })
  const classes = useStyles();

  return html`
    <${TableContainer} component=${Paper}>
    <${Table} ...${getTableProps()}>
      <${TableHead}>
        <${TableRow}>
          <${TableCell} colSpan=${visibleColumns.length}>
            <div className=${classes.root}>
              <${Chip} color="primary" label="QC Inspection" clickable />
              <${Chip} variant="outlined" label="Pathology Review" clickable />
              <${Chip} variant="outlined" label="Case Search" clickable />
            </div>
          </${TableCell}>
        </${TableRow}>
        ${loading && html`
          <${TableRow}>
            <${TableCell} colSpan=${visibleColumns.length} style=${{ height: 1, padding: 0 }}>
              <${LinearProgress} />
            </${TableCell}>
          </${TableRow}>
        `}
        ${headerGroups.map(headerGroup => (html`
          <${TableRow} ...${headerGroup.getHeaderGroupProps()}>
            ${headerGroup.headers.map(column => (html`
              <${TableCell} ...${column.getHeaderProps(getHeaderProps(column))}>
                ${column.render('Header')}
              </${TableCell}>
            `))}
          </${TableRow}>
        `))}
      </${TableHead}>
      <${TableBody}>
        ${rows.map((row, i) => {
          prepareRow(row)
          return html`
            <${TableRow} ...${row.getRowProps(getRowProps(row))}>
              ${row.cells.map(cell => {
                return html`
                  <${TableCell} ...${cell.getCellProps()}>
                    ${cell.render('Cell')}
                  </${TableCell}>
                `
              })}
            </${TableRow}>
          `
        })}
      </${TableBody}>
      </${Table}>
    </${TableContainer}>
  `
}

export default SlideTable;
