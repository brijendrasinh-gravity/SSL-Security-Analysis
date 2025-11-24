import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Card, Spinner, Button, Form } from "react-bootstrap";
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  Bug,
  Shield,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Filter,
  Edit3,
  Save,
  X,
} from "lucide-react";
import API from "../../../api/api";
import "./dashboard.css";

const SmallSpinner = () => (
  <Spinner
    animation="border"
    size="sm"
    style={{ width: 16, height: 16, borderWidth: 2 }}
  />
);

const StatCard = React.memo(
  ({ title, value, thisMonth, lastMonth, icon: Icon, iconBg }) => {
    let percentageChange = 0;
    let isIncrease = false;
    const diff = (thisMonth ?? 0) - (lastMonth ?? 0);

    if ((lastMonth === 0 || lastMonth == null) && thisMonth > 0) {
      percentageChange = 100;
      isIncrease = true;
    } else if (lastMonth > 0) {
      percentageChange = Math.abs((diff / lastMonth) * 100).toFixed(1);
      isIncrease = diff > 0;
    }

    const cardClass =
      iconBg === "bg-primary"
        ? "card-primary"
        : iconBg === "bg-success"
        ? "card-success"
        : "card-warning";

    return (
      <Card className={`stat-card ${cardClass} border-0`}>
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-start">
            <div className="flex-grow-1">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div
                  className={`stat-icon-wrapper ${iconBg} rounded-circle d-flex align-items-center justify-content-center`}
                  style={{ width: 50, height: 50 }}
                >
                  <Icon size={24} className="text-white" />
                </div>
                <div>
                  <h6 className="mb-0 text-muted fw-semibold text-uppercase">
                    {title}
                  </h6>
                </div>
              </div>

              <div className="stat-value mb-3">{value ?? 0}</div>

              <div className="d-flex align-items-center gap-2 flex-wrap">
                <small className="text-muted">
                  This month:{" "}
                  <strong className="text-dark">{thisMonth ?? 0}</strong>
                </small>

                {/* No change */}
                {(!lastMonth || lastMonth === 0) &&
                  (!thisMonth || thisMonth === 0) && (
                    <span className="trend-badge badge bg-secondary">
                      No change
                    </span>
                  )}

                {(!lastMonth || lastMonth === 0) && thisMonth > 0 && (
                  <span className="trend-badge badge bg-success d-flex align-items-center gap-1">
                    <TrendingUp size={14} /> 100%
                  </span>
                )}

                {/* Increase / Decrease */}
                {lastMonth > 0 && diff !== 0 && (
                  <span
                    className={`trend-badge badge ${
                      isIncrease ? "bg-success" : "bg-danger"
                    } d-flex align-items-center gap-1`}
                  >
                    {isIncrease ? (
                      <TrendingUp size={14} />
                    ) : (
                      <TrendingDown size={14} />
                    )}
                    {percentageChange}%
                  </span>
                )}

                {lastMonth > 0 && diff === 0 && (
                  <span className="trend-badge badge bg-secondary">
                    No change
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
    );
  }
);

const FilterUI = ({ filter, setFilter, showReset = true }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const setRange = (value) =>
    setFilter({ range: value, from: "", to: "" });

  return (
    <div className="position-relative">
      <div className="d-flex gap-2 align-items-center">
        <Button
          size="sm"
          className={`filter-toggle-btn ${
            filter.range !== "all" ? "active" : ""
          }`}
          onClick={() => setShowDropdown((p) => !p)}
        >
          <Filter size={16} />
        </Button>

        {showReset && filter.range !== "all" && (
          <Button
            size="sm"
            className="reset-btn"
            onClick={() => setFilter({ range: "all", from: "", to: "" })}
          >
            <RotateCcw size={16} />
          </Button>
        )}
      </div>

      {showDropdown && (
        <>
          <div
            className="filter-backdrop"
            onClick={() => setShowDropdown(false)}
          />

          <div className="filter-dropdown">
            <div className="filter-dropdown-header">
              <span className="fw-semibold">Select Time Range</span>
              <Button
                variant="link"
                className="p-0 text-muted"
                size="sm"
                onClick={() => setShowDropdown(false)}
              >
                ✕
              </Button>
            </div>

            <div className="filter-options">
              {[
                ["all", "All Time"],
                ["today", "Today"],
                ["7d", "Last 7 Days"],
                ["15d", "Last 15 Days"],
                ["30d", "Last 30 Days"],
                ["3m", "Last 3 Months"],
                ["6m", "Last 6 Months"],
                ["year", "This Year"],
                ["custom", "Custom Range"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  className={`filter-option ${
                    filter.range === value ? "active" : ""
                  }`}
                  onClick={() => {
                    setRange(value);
                    if (value !== "custom") setShowDropdown(false);
                  }}
                >
                  {label}
                  {filter.range === value && (
                    <span className="check-icon">✓</span>
                  )}
                </button>
              ))}
            </div>

            {filter.range === "custom" && (
              <div className="custom-date-section">
                <Form.Group className="mb-2">
                  <Form.Label className="small fw-semibold">
                    From Date
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={filter.from}
                    onChange={(e) =>
                      setFilter((f) => ({
                        ...f,
                        from: e.target.value,
                      }))
                    }
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="small fw-semibold">
                    To Date
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={filter.to}
                    onChange={(e) =>
                      setFilter((f) => ({
                        ...f,
                        to: e.target.value,
                      }))
                    }
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  size="sm"
                  className="w-100"
                  disabled={!filter.from || !filter.to}
                  onClick={() => setShowDropdown(false)}
                >
                  Apply
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const UsersChart = React.memo(
  ({ data, loading, formatMonth, FilterComponent }) => (
    <div className="chart-card border-0 h-100">
      <div className="chart-header d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h6 className="chart-title mb-0">Users (Monthly)</h6>
        <div className="d-flex align-items-center gap-2">
          {loading && <SmallSpinner />}
          {FilterComponent}
        </div>
      </div>

      <div className="card-body">
        <ResponsiveContainer width="100%" height={250}>
          <LineChart
            data={(data?.monthly || []).map((m) => ({
              month: formatMonth(m.month),
              newUsers: m.newUsers,
            }))}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="newUsers"
              stroke="#8884d8"
              strokeWidth={2}
              dot
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
);

const VirusChart = React.memo(
  ({ data, loading, formatMonth, FilterComponent }) => (
    <div className="chart-card border-0 h-100">
      <div className="chart-header d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h6 className="chart-title mb-0">VirusTotal Scans (Monthly)</h6>
        <div className="d-flex align-items-center gap-2">
          {loading && <SmallSpinner />}
          {FilterComponent}
        </div>
      </div>

      <div className="card-body">
        <ResponsiveContainer width="100%" height={250}>
          <LineChart
            data={(data?.monthly || []).map((m) => ({
              month: formatMonth(m.month),
              scans: m.scans,
            }))}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="scans"
              stroke="#82ca9d"
              strokeWidth={2}
              dot
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
);

const DomainsChart = React.memo(
  ({ data, loading, formatMonth, FilterComponent }) => (
    <div className="chart-card border-0 h-100">
      <div className="chart-header d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h6 className="chart-title mb-0">Domains Scanned (Monthly)</h6>
        <div className="d-flex align-items-center gap-2">
          {loading && <SmallSpinner />}
          {FilterComponent}
        </div>
      </div>

      <div className="card-body">
        <ResponsiveContainer width="100%" height={250}>
          <LineChart
            data={(data?.monthly || []).map((m) => ({
              month: formatMonth(m.month),
              domains: m.domainsScanned,
            }))}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="domains"
              stroke="#ffc658"
              strokeWidth={2}
              dot
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
);

function Dashboard() {
  const [initialLoading, setInitialLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);

  const [userStats, setUserStats] = useState(null);
  const [virusStats, setVirusStats] = useState(null);
  const [domainStats, setDomainStats] = useState(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user?.id;

  const [layout, setLayout] = useState(null);
  const [containerWidth, setContainerWidth] = useState(1200);

  const [isEditMode, setIsEditMode] = useState(false);
  const [tempLayout, setTempLayout] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const defaultLayout = useMemo(
    () => [
      { i: "statUsers", x: 0, y: 0, w: 4, h: 4 },
      { i: "statVirus", x: 4, y: 0, w: 4, h: 4 },
      { i: "statDomains", x: 8, y: 0, w: 4, h: 4 },
      { i: "chartUsers", x: 0, y: 4, w: 6, h: 10 },
      { i: "chartVirus", x: 6, y: 4, w: 6, h: 10 },
      { i: "chartDomains", x: 0, y: 14, w: 6, h: 10 },
    ],
    []
  );

  const [globalFilter, setGlobalFilter] = useState({
    range: "all",
    from: "",
    to: "",
  });
  const [userFilter, setUserFilter] = useState({
    range: "all",
    from: "",
    to: "",
  });
  const [virusFilter, setVirusFilter] = useState({
    range: "all",
    from: "",
    to: "",
  });
  const [domainFilter, setDomainFilter] = useState({
    range: "all",
    from: "",
    to: "",
  });

  const buildParams = useCallback((filter) => {
    if (!filter) return { range: "all" };
    if (filter.range === "custom") {
      const p = { range: "custom" };
      if (filter.from) p.from = filter.from;
      if (filter.to) p.to = filter.to;
      return p;
    }
    return { range: filter.range };
  }, []);

  const fetchAll = useCallback(
    async ({ initial = false } = {}) => {
      try {
        if (!initial) setDataLoading(true);

        const effectiveUser = userFilter.range !== "all" ? userFilter : globalFilter;
        const effectiveVirus = virusFilter.range !== "all" ? virusFilter : globalFilter;
        const effectiveDomain =
          domainFilter.range !== "all" ? domainFilter : globalFilter;

        const userParams = buildParams(effectiveUser);
        const virusParams = buildParams(effectiveVirus);
        const domainParams = buildParams(effectiveDomain);

        const [uRes, vRes, dRes] = await Promise.all([
          API.get("/dashboard/user-stats", { params: userParams }),
          API.get("/dashboard/virustotal-stats", { params: virusParams }),
          API.get("/dashboard/domain-stats", { params: domainParams }),
        ]);

        if (uRes.data?.success) setUserStats(uRes.data.data);
        if (vRes.data?.success) setVirusStats(vRes.data.data);
        if (dRes.data?.success) setDomainStats(dRes.data.data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        if (!initial) setDataLoading(false);
      }
    },
    [globalFilter, userFilter, virusFilter, domainFilter, buildParams]
  );

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const res = await API.get(`/dashboard/get-layout/${userId}`);

        if (mounted) {
          setLayout(res.data?.data || defaultLayout);
        }
      } catch (err) {
        console.error("Layout load error:", err);
        if (mounted) setLayout(defaultLayout);
      }

      await fetchAll({ initial: true });
      if (mounted) setInitialLoading(false);
    };

    const handleResize = () => {
      const container = document.querySelector(".container");
      if (container) setContainerWidth(container.offsetWidth);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    init();

    return () => {
      mounted = false;
      window.removeEventListener("resize", handleResize);
    };
  }, [userId, defaultLayout, fetchAll]);

  useEffect(() => {
    if (!initialLoading) fetchAll();
  }, [globalFilter, userFilter, virusFilter, domainFilter, fetchAll, initialLoading]);

  const handleLayoutChange = (newLayout) => {
    if (!isEditMode) return;
    setLayout(newLayout);
    setHasUnsavedChanges(true);
  };

  const saveLayout = async () => {
    try {
      setIsSaving(true);
      await API.post("/dashboard/save-layout", {
        user_id: userId,
        layout,
      });
      setIsSaving(false);
      setIsEditMode(false);
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error("Save layout error:", err);
      setIsSaving(false);
    }
  };

  const toggleEditMode = () => {
    if (isEditMode) {
      if (hasUnsavedChanges) {
        if (!window.confirm("Discard unsaved changes?")) return;
        setLayout(tempLayout);
      }
      setIsEditMode(false);
      setHasUnsavedChanges(false);
    } else {
      setTempLayout(JSON.parse(JSON.stringify(layout)));
      setIsEditMode(true);
    }
  };

  const formatMonth = useCallback((ym) => {
    const [y, m] = ym.split("-");
    return new Date(Number(y), Number(m) - 1).toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
  }, []);

  const globalFilterUI = useMemo(
    () => <FilterUI filter={globalFilter} setFilter={setGlobalFilter} showReset={false} />,
    [globalFilter]
  );
  const userFilterUI = useMemo(
    () => <FilterUI filter={userFilter} setFilter={setUserFilter} />,
    [userFilter]
  );
  const virusFilterUI = useMemo(
    () => <FilterUI filter={virusFilter} setFilter={setVirusFilter} />,
    [virusFilter]
  );
  const domainFilterUI = useMemo(
    () => <FilterUI filter={domainFilter} setFilter={setDomainFilter} />,
    [domainFilter]
  );

  if (initialLoading || !layout) {
    return (
      <div className="loading-container">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2 text-muted">Loading dashboard...</p>
      </div>
    );
  }

  const resetAll = () => {
    const reset = { range: "all", from: "", to: "" };
    setGlobalFilter(reset);
    setUserFilter(reset);
    setVirusFilter(reset);
    setDomainFilter(reset);
  };

  return (
    <div className="container mt-4 mb-5">
      {/* Header */}
      <div className="dashboard-header mb-4 d-flex justify-content-between align-items-center flex-wrap">
        <div>
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle mb-0">
            {isEditMode ? "Edit mode (drag widgets)" : "Overview statistics & trends"}
          </p>
        </div>

        <div className="d-flex gap-2">
          {/* Edit mode */}
          <Button
            size="sm"
            variant={isEditMode ? "warning" : "outline-light"}
            onClick={toggleEditMode}
          >
            {isEditMode ? "Exit Edit" : "Edit Layout"}
          </Button>

          {isEditMode && hasUnsavedChanges && (
            <Button size="sm" variant="success" onClick={saveLayout} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Layout"}
            </Button>
          )}

          {!isEditMode && (
            <>
              {globalFilterUI}

              {(globalFilter.range !== "all" ||
                userFilter.range !== "all" ||
                virusFilter.range !== "all" ||
                domainFilter.range !== "all") && (
                <Button size="sm" className="reset-all-btn" onClick={resetAll}>
                  <RotateCcw size={16} />
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* GRID LAYOUT */}
      <GridLayout
        className="layout"
        layout={layout}
        cols={12}
        rowHeight={30}
        width={containerWidth}
        onLayoutChange={handleLayoutChange}
        draggableHandle=".drag-handle"
        isDraggable={isEditMode}
        isResizable={isEditMode}
        compactType="vertical"
      >
        {/* --- STAT CARDS --- */}
        <div key="statUsers" className={isEditMode ? "edit-mode" : ""}>
          {isEditMode && <div className="drag-handle">⋮⋮</div>}
          <StatCard
            title="Total Users"
            value={userStats?.totalUsers}
            thisMonth={userStats?.newUsersThisMonth}
            lastMonth={userStats?.newUsersLastMonth}
            icon={Users}
            iconBg="bg-primary"
          />
        </div>

        <div key="statVirus" className={isEditMode ? "edit-mode" : ""}>
          {isEditMode && <div className="drag-handle">⋮⋮</div>}
          <StatCard
            title="VirusTotal Scans"
            value={virusStats?.totalScans}
            thisMonth={virusStats?.scansThisMonth}
            lastMonth={virusStats?.scansLastMonth}
            icon={Bug}
            iconBg="bg-success"
          />
        </div>

        <div key="statDomains" className={isEditMode ? "edit-mode" : ""}>
          {isEditMode && <div className="drag-handle">⋮⋮</div>}
          <StatCard
            title="Domains Scanned"
            value={domainStats?.totalDomains}
            thisMonth={domainStats?.domainsThisMonth}
            lastMonth={domainStats?.domainsLastMonth}
            icon={Shield}
            iconBg="bg-warning"
          />
        </div>

        {/* --- CHARTS --- */}
        <div key="chartUsers" className={isEditMode ? "edit-mode" : ""}>
          {isEditMode && <div className="drag-handle">⋮⋮</div>}
          <UsersChart
            data={userStats}
            loading={dataLoading}
            formatMonth={formatMonth}
            FilterComponent={userFilterUI}
          />
        </div>

        <div key="chartVirus" className={isEditMode ? "edit-mode" : ""}>
          {isEditMode && <div className="drag-handle">⋮⋮</div>}
          <VirusChart
            data={virusStats}
            loading={dataLoading}
            formatMonth={formatMonth}
            FilterComponent={virusFilterUI}
          />
        </div>

        <div key="chartDomains" className={isEditMode ? "edit-mode" : ""}>
          {isEditMode && <div className="drag-handle">⋮⋮</div>}
          <DomainsChart
            data={domainStats}
            loading={dataLoading}
            formatMonth={formatMonth}
            FilterComponent={domainFilterUI}
          />
        </div>
      </GridLayout>
    </div>
  );
}

export default Dashboard;