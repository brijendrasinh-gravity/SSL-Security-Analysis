import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { Button, Spinner, Card, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { Eye, Trash2, Shield, Globe, Plus } from "lucide-react";
import API from "../../api/api";
import { usePermission } from "../../hooks/usePermission";

function SslReportsAnalysis() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);

  const navigate = useNavigate();
  const { hasPermission } = usePermission();

  useEffect(() => {
    // eslint-disable-next-line
    fetchReports(page);
  }, [page, perPage]);

  const fetchReports = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const response = await API.get(
        `/sslanalysis/getbulkreport?page=${pageNumber}&limit=${perPage}`
      );
      if (response.data.success) {
        setReports(response.data.data);
        setTotalRows(response.data.total);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;

    try {
      const response = await API.delete(`/sslanalysis/deletereport/${id}`);
      if (response.data.success) {
        alert("Report deleted successfully!");
        fetchReports(page);
      }
    } catch (error) {
      console.error("Error deleting report:", error);
      alert("Failed to delete report. Please try again.");
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handlePerRowsChange = (newPerPage, page) => {
    setPerPage(newPerPage);
    setPage(page);
  };



  const columns = [
    {
      name: "Domain",
      selector: (row) => row.domain,
      sortable: true,
      grow: 2,
      cell: (row) => (
        <div className="d-flex align-items-center py-2">
          <div 
            className="bg-primary bg-opacity-10 rounded d-flex align-items-center justify-content-center me-3"
            style={{ width: '40px', height: '40px', minWidth: '40px' }}
          >
            <Globe size={20} className="text-primary" />
          </div>
          <span className="fw-semibold">{row.domain}</span>
        </div>
      ),
    },
    {
      name: "Scan Date",
      selector: (row) => row.createdAt,
      sortable: true,
      cell: (row) => (
        <div>
          <div className="fw-semibold">
            {new Date(row.createdAt).toLocaleDateString("en-US", {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
          <small className="text-muted">
            {new Date(row.createdAt).toLocaleTimeString("en-US", {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </small>
        </div>
      ),
    },
    {
      name: "Status",
      center: true,
      cell: (row) => (
        <Badge bg="success" className="px-3 py-2">
          Completed
        </Badge>
      ),
    },
    {
      name: "Actions",
      center: true,
      cell: (row) => (
        <div className="d-flex gap-2">
          {hasPermission('ssl_security', 'canList') && (
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => navigate(`/scan/details/${row.id}`)}
              className="d-flex align-items-center"
            >
              <Eye size={14} className="me-1" />
              View
            </Button>
          )}
          {hasPermission('ssl_security', 'canDelete') && (
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => handleDelete(row.id)}
            >
              <Trash2 size={14} />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const customStyles = {
    table: {
      style: {
        backgroundColor: '#ffffff',
      },
    },
    headRow: {
      style: {
        backgroundColor: '#f8f9fa',
        borderBottom: '2px solid #dee2e6',
        minHeight: '56px',
      },
    },
    headCells: {
      style: {
        fontWeight: '600',
        fontSize: '14px',
        color: '#212529',
        paddingLeft: '16px',
        paddingRight: '16px',
      },
    },
    rows: {
      style: {
        minHeight: '72px',
        borderBottom: '1px solid #e9ecef',
        '&:not(:last-of-type)': {
          borderBottom: '1px solid #e9ecef',
        },
      },
    },
    cells: {
      style: {
        paddingLeft: '16px',
        paddingRight: '16px',
      },
    },
    pagination: {
      style: {
        borderTop: '1px solid #dee2e6',
        minHeight: '56px',
      },
    },
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <Spinner className="mb-3" />
          <p className="text-muted">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: "1200px" }}>
      {/* Page Header */}
      <div className="text-center mb-4">
        <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
          <Shield className="text-primary" size={40} />
        </div>
        <h2 className="fw-bold mb-2">Scanned Domains</h2>
        <p className="text-muted">View and manage your SSL certificate analysis reports</p>
      </div>

      {/* Stats and Action Bar */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="text-muted">Total Reports: </span>
          <span className="fw-bold fs-5">{totalRows}</span>
        </div>
        {hasPermission('ssl_security', 'canCreate') && (
          <Button 
            variant="primary"
            onClick={() => navigate('/')}
            className="d-flex align-items-center"
          >
            <Plus size={18} className="me-2" />
            New Scan
          </Button>
        )}
      </div>

      {/* Table Card */}
      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          {reports.length === 0 && !loading ? (
            <div className="text-center py-5 px-4">
              <div 
                className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                style={{ width: '80px', height: '80px' }}
              >
                <Shield size={40} className="text-muted" />
              </div>
              <h5 className="fw-bold mb-2">No SSL Reports Found</h5>
              <p className="text-muted mb-4">Start by analyzing a domain from the Dashboard</p>
              <Button 
                variant="primary" 
                onClick={() => navigate('/')}
              >
                <Plus size={18} className="me-2" />
                Go to Dashboard
              </Button>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={reports}
              progressPending={loading}
              pagination
              paginationServer
              paginationTotalRows={totalRows}
              paginationPerPage={perPage}
              paginationRowsPerPageOptions={[10, 20, 30, 50]}
              paginationDefaultPage={page}
              onChangePage={handlePageChange}
              onChangeRowsPerPage={handlePerRowsChange}
              customStyles={customStyles}
              noDataComponent={
                <div className="text-center py-5">
                  <p className="text-muted mb-0">No data available</p>
                </div>
              }
            />
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

export default SslReportsAnalysis;
