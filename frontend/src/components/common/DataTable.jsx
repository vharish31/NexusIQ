import React, { useState, useMemo } from 'react';
import { Table, Form, InputGroup, Pagination, Button } from 'react-bootstrap';
import { Search, ChevronDown, ChevronUp, ArrowUpDown, Download } from 'lucide-react';
import EmptyState from './EmptyState';
import LoadingState from './LoadingState';

export const DataTable = ({
  columns,
  data = [],
  isLoading = false,
  searchPlaceholder = 'Filter records...',
  searchKeys = [],
  defaultSortKey = '',
  defaultSortDirection = 'asc',
  itemsPerPage = 10,
  emptyMessage = 'No matching records found',
  onRowClick,
  actionButton
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState(defaultSortKey);
  const [sortDirection, setSortDirection] = useState(defaultSortDirection);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();

    return data.filter((item) => {
      if (searchKeys.length > 0) {
        return searchKeys.some((key) => {
          const val = item[key];
          return val !== undefined && val !== null && String(val).toLowerCase().includes(term);
        });
      }
      return Object.values(item).some(
        (val) => val !== undefined && val !== null && String(val).toLowerCase().includes(term)
      );
    });
  }, [data, searchTerm, searchKeys]);

  // Sort
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      let aVal = a[sortKey];
      let bVal = b[sortKey];

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = (bVal || '').toLowerCase();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortKey, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const handleSort = (key) => {
    if (!key) return;
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const handleExportCSV = () => {
    if (sortedData.length === 0) return;
    const headers = columns.map(c => `"${c.label}"`).join(',');
    const rows = sortedData.map(row => {
      return columns.map(col => {
        const val = row[col.key];
        return `"${val !== undefined ? String(val).replace(/"/g, '""') : ''}"`;
      }).join(',');
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nexus_data_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return <LoadingState message="Processing tabular telemetry..." />;
  }

  return (
    <div className="nexus-card">
      {/* Header with search & actions */}
      <div className="p-3 border-bottom border-secondary border-opacity-15 d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3">
        <InputGroup style={{ maxWidth: '340px' }} size="sm">
          <InputGroup.Text className="border-end-0">
            <Search size={15} className="text-muted" />
          </InputGroup.Text>
          <Form.Control
            placeholder={searchPlaceholder}
            className="border-start-0 ps-0"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </InputGroup>

        <div className="d-flex align-items-center gap-2 w-100 w-sm-auto justify-content-end">
          <Button
            variant="outline-secondary"
            size="sm"
            className="d-flex align-items-center gap-1.5 btn-nexus-secondary"
            onClick={handleExportCSV}
            disabled={sortedData.length === 0}
          >
            <Download size={14} />
            <span>Export CSV</span>
          </Button>
          {actionButton}
        </div>
      </div>

      {/* Table content */}
      <div className="table-responsive">
        <Table hover className="nexus-table mb-0">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key || col.label}
                  style={{ cursor: col.sortable ? 'pointer' : 'default', width: col.width }}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="d-flex align-items-center gap-1">
                    <span>{col.label}</span>
                    {col.sortable && (
                      <span className="text-muted">
                        {sortKey === col.key ? (
                          sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                        ) : (
                          <ArrowUpDown size={12} className="opacity-50" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, idx) => (
                <tr
                  key={row.id || idx}
                  onClick={() => onRowClick && onRowClick(row)}
                  style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {columns.map((col) => (
                    <td key={col.key || col.label}>
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="p-0 border-0">
                  <EmptyState title="No matching data" description={emptyMessage} height="200px" />
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* Footer & pagination */}
      {totalPages > 1 && (
        <div className="p-3 border-top border-secondary border-opacity-15 d-flex align-items-center justify-content-between flex-wrap gap-2">
          <span className="text-muted small">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, sortedData.length)} of {sortedData.length} entries
          </span>

          <Pagination size="sm" className="mb-0">
            <Pagination.Prev
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            />
            {[...Array(totalPages)].map((_, i) => (
              <Pagination.Item
                key={i + 1}
                active={i + 1 === currentPage}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            />
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default DataTable;
