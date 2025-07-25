import React from 'react';

export interface Column<T> {
  label: string;
  accessor: keyof T | string;
  render?: (value: any, row: T, rowIndex: number) => React.ReactNode;
  className?: string;
}

interface AdminTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  tableClassName?: string;
  theadClassName?: string;
  tbodyClassName?: string;
}

function AdminTable<T extends object>({
  columns,
  data,
  emptyMessage = 'No data found.',
  tableClassName = 'min-w-full border border-gray-200',
  theadClassName = '',
  tbodyClassName = '',
}: AdminTableProps<T>) {
  return (
    <table className={tableClassName}>
      <thead className={theadClassName}>
        <tr>
          {columns.map((col, idx) => (
            <th key={idx} className={col.className || 'px-4 py-2 border-b'}>{col.label}</th>
          ))}
        </tr>
      </thead>
      <tbody className={tbodyClassName}>
        {data.length === 0 ? (
          <tr>
            <td colSpan={columns.length} className="text-center text-gray-400 py-4">{emptyMessage}</td>
          </tr>
        ) : (
          data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((col, colIndex) => {
                const value = typeof col.accessor === 'string' ? (row as any)[col.accessor] : row[col.accessor];
                return (
                  <td key={colIndex} className={col.className || 'px-4 py-2 border-b'}>
                    {col.render ? col.render(value, row, rowIndex) : value}
                  </td>
                );
              })}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

export default AdminTable; 