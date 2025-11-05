import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { Button, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import API from "../../api/api";


function SslReportsAnalysis() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);

  const navigate = useNavigate();

  useEffect(() => {
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
        setTotalRows(response.data.total); // our pagination
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
    console.log("Page changed to:", newPage);
    setPage(newPage);
  };

  const handlePerRowsChange = (newPerPage, page) => {
    console.log("Rows per page changed to:", newPerPage, "Current page:", page);
    setPerPage(newPerPage);
    setPage(page); //Issue: When changing to next page it was switching to page 1 instead of going to next page.
    //solution: setPage(page) so that it stays on next page
  };

  const columns = [
    {
      name: "Domain",
      selector: (row) => row.domain,
      sortable: true,
    },
    {
      name: "Created At",
      selector: (row) =>
        new Date(row.createdAt).toLocaleString("en-IN", {
          dateStyle: "short",
          timeStyle: "short",
        }),
      sortable: true,
    },
    {
      name: "Action",
      cell: (row) => (
        <>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(`/scan/details/${row.id}`)}
            className="me-2"
          >
            Details
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDelete(row.id)}
          >
            Delete
          </Button>
        </>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" /> <p>Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="text-white fw-bolder mb-0">Scanned Domains</h3>
      </div>
      <DataTable
        columns={columns}
        data={reports}
        progressPending={loading}
        pagination
        paginationServer
        paginationTotalRows={totalRows}
        paginationPerPage={perPage}
        paginationRowsPerPageOptions={[5, 10, 15, 20, 25, 50]}
        paginationDefaultPage={page}
        onChangePage={handlePageChange}
        onChangeRowsPerPage={handlePerRowsChange}
        pointerOnHover
        striped
        persistTableHead
      />
    </div>
  );
}

export default SslReportsAnalysis;
