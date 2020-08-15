//import { useMemo } from 'react';
import { html } from 'htm/react';
import {
  DataTableCell,
  DataTableHeadCell,
  DataTableRow,
  DataTableBody,
  DataTableContent,
  DataTableHead,
} from '@rmwc/data-table'
import { Checkbox } from '@rmwc/checkbox'
import '@material/data-table/dist/mdc.data-table.css'
import '@rmwc/data-table/data-table.css'
import '@material/checkbox/dist/mdc.checkbox.css'
import '@material/form-field/dist/mdc.form-field.css'
import '@material/ripple/dist/mdc.ripple.css'
import { useTable, useRowSelect } from 'react-table'


function SlideTable({
    columns, 
    data,
    getRowProps = () => ({})
  }) {
  const { 
    getTableProps, 
    headerGroups, 
    rows, 
    prepareRow,
    state: { selectedRowIds },
  } = useTable(
    {
      columns,
      data
    },
    useRowSelect,
      hooks => {
        hooks.visibleColumns.push(columns => [
          // Let's make a column for selection
          {
            id: 'selection',
            Cell: ({ row }) => html`<${Checkbox} ...${row.getToggleRowSelectedProps()} />`,
          },
          ...columns,
        ])
      }
    )

  return html`
    <${DataTableContent} ...${getTableProps()}>
      <${DataTableHead}>
        ${headerGroups.map(headerGroup => (html`
          <${DataTableRow} ...${headerGroup.getHeaderGroupProps()}>
            ${headerGroup.headers.map(column => (html`
              <${DataTableHeadCell} ...${column.getHeaderProps()}>
                ${column.render('Header')}
              </${DataTableHeadCell}>
            `))}
          </${DataTableRow}>
        `))}
      </${DataTableHead}>
      <${DataTableBody}>
        ${rows.map((row, i) => {
          prepareRow(row)
          return html`
            <${DataTableRow} ...${row.getRowProps(getRowProps(row))}>
              ${row.cells.map(cell => {
                return html`
                  <${DataTableCell} ...${cell.getCellProps()}>
                    ${cell.render('Cell')}
                  </${DataTableCell}>
                `
              })}
            </${DataTableRow}>
          `
        })}
      </${DataTableBody}>
    </${DataTableContent}>
  `
}

export default SlideTable;
