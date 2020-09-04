import { html } from 'htm/react';
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import LinearProgress from '@material-ui/core/LinearProgress'
import { useTable } from 'react-table'
import { TableFilter } from './Filters';

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

  return html`
    <${TableContainer} component=${Paper}>
    <${Table} ...${getTableProps()}>
      <${TableHead}>
        <${TableRow}>
          <${TableCell} colSpan=${visibleColumns.length}>
            <${TableFilter} />
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
