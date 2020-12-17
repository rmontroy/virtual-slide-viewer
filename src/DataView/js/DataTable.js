import { html } from 'htm/react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import LinearProgress from '@material-ui/core/LinearProgress';
import Checkbox from '@material-ui/core/Checkbox';
import Chip from '@material-ui/core/Chip';
import { useTable, useRowSelect } from 'react-table';
import { useEffect } from 'react';

const useStyles = makeStyles((theme) => ({
  fetchMore: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    margin: theme.spacing(3),
  }
}));

function DataTable({
  columns,
  data,
  loading,
  selectionChanged,
  updateField,
  fetchMore,
  hiddenColumns
})
{
  const classes = useStyles();
  const { 
    getTableProps, 
    headerGroups, 
    rows,
    toggleHideColumn,
    prepareRow,
    visibleColumns,
    selectedFlatRows,
  } = useTable(
    {
      columns,
      data,
      // updateField() isn't part of the react-table API, but anything we put into these options will
      // automatically be available on the instance. That way we can call this function from our
      // cell renderer.
      updateField
    },
    useRowSelect,
    hooks => {
      hooks.visibleColumns.push(columns => [
        // Let's make a column for selection
        {
          id: 'selection',
          Header: ({ getToggleAllRowsSelectedProps }) => html`
              <${Checkbox} ...${getToggleAllRowsSelectedProps()}
                onClick=${event => event.stopPropagation()} />
          `,
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

  useEffect(() => {
    for (const id in hiddenColumns) {
      console.log(id)
      toggleHideColumn(id, hiddenColumns[id])
    }
  }, [hiddenColumns, toggleHideColumn]);

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
      ${fetchMore && html`
        <div className=${classes.fetchMore}>
          <${Chip}
            color=primary
            label='Fetch more rows'
            clickable 
            onClick=${fetchMore}
          />
        </div>
      `}
    </${TableContainer}>
  `
}

export default DataTable;
