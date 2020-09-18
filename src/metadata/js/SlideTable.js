/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */
import { html } from 'htm/react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import LinearProgress from '@material-ui/core/LinearProgress';
import Checkbox from '@material-ui/core/Checkbox';
import { useTable, useRowSelect } from 'react-table';
import { useEffect } from 'react';

function SlideTable({
  columns,
  data,
  loading,
  selectionChanged
})
{
  const { 
    getTableProps, 
    headerGroups, 
    rows, 
    prepareRow,
    visibleColumns,
    selectedFlatRows,
  } = useTable(
    { columns, data },
    useRowSelect,
    hooks => {
      hooks.visibleColumns.push(columns => [
        // Let's make a column for selection
        {
          id: 'selection',
          Cell: ({ row }) => html`
              <${Checkbox} ...${row.getToggleRowSelectedProps()}
                onClick=${event => event.stopPropagation()} />
          `,
        },
        ...columns,
      ])
    });

  const rowProps = row => ({
    onClick: () => row.toggleRowSelected()
  });

  useEffect(() => {
    selectionChanged(selectedFlatRows);
  }, [selectedFlatRows, selectionChanged]);

  return html`
    <${TableContainer} component=${Paper}>
      <${Table} ...${getTableProps()}>
        <${TableHead}>
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
              <${TableCell} ...${column.getHeaderProps()}>
                ${column.render('Header')}
              </${TableCell}>
            `))}
          </${TableRow}>
        `))}
      </${TableHead}>
      <${TableBody}>
        ${rows.map((row) => {
          prepareRow(row)
          return html`
            <${TableRow} ...${row.getRowProps(rowProps(row))}>
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
