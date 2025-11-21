import React, { useEffect, useState } from "react";
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
} from "lucide-react";
import API from "../../../api/api";
import { usePermission } from "../../../hooks/usePermission";
import "./dashboard.css";

const StatCard = ({
  title,
  value,
  thisMonth,
  lastMonth,
  icon: Icon,
  iconBg,
}) => {
  let percentageChange = 0;
  let isIncrease = false;
  let diff = thisMonth - lastMonth;

  if (lastMonth === 0 && thisMonth > 0) {
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
                <h6
                  className="mb-0 text-muted fw-semibold text-uppercase"
                  style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}
                >
                  {title}
                </h6>
              </div>
            </div>

            <div className="stat-value mb-3">{value}</div>

            <div className="d-flex align-items-center gap-2 flex-wrap">
              <small className="text-muted">
                This month: <strong className="text-dark">{thisMonth}</strong>
              </small>

              {lastMonth === 0 && thisMonth === 0 && (
                <span className="trend-badge badge bg-secondary">No change</span>
              )}

              {lastMonth === 0 && thisMonth > 0 && (
                <span className="trend-badge badge bg-success d-flex align-items-center gap-1">
                  <TrendingUp size={14} /> 100%
                </span>
              )}

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
                <span className="trend-badge badge bg-secondary">No change</span>
              )}
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

function Dashboard() {
  const { hasPermission } = usePermission();

  const [loading, setLoading] = useState(true);

  const [userStats, setUserStats] = useState(null);
  const [virusStats, setVirusStats] = useState(null);
  const [domainStats, setDomainStats] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  // GRID LAYOUT STATE
  const [layout, setLayout] = useState(null);
  const [containerWidth, setContainerWidth] = useState(1200);

  // Default layout if DB doesn't have any
  const defaultLayout = [
    { i: "statUsers", x: 0, y: 0, w: 4, h: 4, minW: 3, minH: 4 },
    { i: "statVirus", x: 4, y: 0, w: 4, h: 4, minW: 3, minH: 4 },
    { i: "statDomains", x: 8, y: 0, w: 4, h: 4, minW: 3, minH: 4 },

    { i: "chartUsers", x: 0, y: 4, w: 6, h: 10, minW: 4, minH: 8 },
    { i: "chartVirus", x: 6, y: 4, w: 6, h: 10, minW: 4, minH: 8 },
    { i: "chartDomains", x: 0, y: 14, w: 6, h: 10, minW: 4, minH: 8 },
  ];

  // Load layout from backend and handle window resize
  useEffect(() => {
    loadUserLayout();
    
    const handleResize = () => {
      const container = document.querySelector('.container');
      if (container) {
        setContainerWidth(container.offsetWidth);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  async function loadUserLayout() {
    try {
      const res = await API.get(`/dashboard/get-layout/${userId}`);

      if (res.data.success && res.data.data) {
        setLayout(res.data.data);
      } else {
        setLayout(defaultLayout);
      }
    } catch (err) {
      console.log("Error loading layout:", err);
      setLayout(defaultLayout);
    }
  }

  // SAVE LAYOUT (debounced)
  let saveTimer;
  const handleLayoutChange = (newLayout) => {
    setLayout(newLayout);

    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      saveLayoutToDB(newLayout);
    }, 800);
  };

  async function saveLayoutToDB(updatedLayout) {
    try {
      await API.post("/dashboard/save-layout", {
        user_id: userId,
        layout: updatedLayout,
      });
    } catch (error) {
      console.log("Error saving layout:", error);
    }
  }

  // FETCH FILTERED DATA (your existing logic)
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

  useEffect(() => {
    if (!hasPermission("dashboard", "canList")) {
      setLoading(false);
      return;
    }
    fetchAll();
  }, []);

  const buildParams = (filter) => {
    if (filter.range === "custom") {
      const params = {};
      if (filter.from) params.from = filter.from;
      if (filter.to) params.to = filter.to;
      return params;
    }
    return { range: filter.range };
  };

  const fetchAll = async () => {
    try {
      setLoading(true);

      const userParams = buildParams(
        userFilter.range === "all" ? globalFilter : userFilter
      );
      const virusParams = buildParams(
        virusFilter.range === "all" ? globalFilter : virusFilter
      );
      const domainParams = buildParams(
        domainFilter.range === "all" ? globalFilter : domainFilter
      );

      const [uRes, vRes, dRes] = await Promise.all([
        API.get("/dashboard/user-stats", { params: userParams }),
        API.get("/dashboard/virustotal-stats", { params: virusParams }),
        API.get("/dashboard/domain-stats", { params: domainParams }),
      ]);

      if (uRes.data.success) setUserStats(uRes.data.data);
      if (vRes.data.success) setVirusStats(vRes.data.data);
      if (dRes.data.success) setDomainStats(dRes.data.data);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!hasPermission("dashboard", "canList")) {
    return (
      <div className="container mt-4">
        <h4>You don't have permission.</h4>
      </div>
    );
  }

  if (loading || !layout) {
    return (
      <div className="loading-container">
        <Spinner animation="border" variant="primary" className="loading-spinner" />
        <p className="text-muted fw-semibold">Loading dashboard...</p>
      </div>
    );
  }

  const resetAll = () => {
    const resetState = { range: "all", from: "", to: "" };
    setGlobalFilter(resetState);
    setUserFilter(resetState);
    setVirusFilter(resetState);
    setDomainFilter(resetState);
    
    setTimeout(() => {
      fetchAll();
    }, 0);
  };

  const formatMonthLabel = (ym) => {
    const [y, m] = ym.split("-").map(Number);
    return new Date(y, m - 1, 1).toLocaleString(undefined, {
      month: "short",
      year: "numeric",
    });
  };

  const FilterUI = ({ filter, setFilter, apply, showReset = true }) => {
    const [showDropdown, setShowDropdown] = useState(false);

    return (
      <div className="position-relative">
        <div className="d-flex gap-2 align-items-center">
          <Button
            size="sm"
            className={`filter-toggle-btn d-flex align-items-center justify-content-center ${filter.range !== "all" ? "active" : ""}`}
            onClick={() => setShowDropdown(!showDropdown)}
            title={filter.range === "all" ? "Filter" : 
                   filter.range === "custom" ? "Custom Range" : 
                   filter.range === "today" ? "Today" :
                   filter.range === "7d" ? "Last 7 Days" :
                   filter.range === "15d" ? "Last 15 Days" :
                   filter.range === "30d" ? "Last 30 Days" :
                   filter.range === "3m" ? "Last 3 Months" :
                   filter.range === "6m" ? "Last 6 Months" :
                   filter.range === "year" ? "This Year" : "Filter"}
          >
            <Filter size={16} />
          </Button>

          {showReset && filter.range !== "all" && (
            <Button
              size="sm"
              className="reset-btn d-flex align-items-center justify-content-center"
              onClick={() => {
                setFilter({ range: "all", from: "", to: "" });
                setTimeout(() => apply(), 0);
              }}
              title="Reset filter"
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
                  size="sm"
                  className="p-0 text-muted"
                  onClick={() => setShowDropdown(false)}
                >
                  ✕
                </Button>
              </div>
              
              <div className="filter-options">
                {[
                  { value: "all", label: "All Time" },
                  { value: "today", label: "Today" },
                  { value: "7d", label: "Last 7 Days" },
                  { value: "15d", label: "Last 15 Days" },
                  { value: "30d", label: "Last 30 Days" },
                  { value: "3m", label: "Last 3 Months" },
                  { value: "6m", label: "Last 6 Months" },
                  { value: "year", label: "This Year" },
                  { value: "custom", label: "Custom Range" },
                ].map((option) => (
                  <button
                    key={option.value}
                    className={`filter-option ${filter.range === option.value ? "active" : ""}`}
                    onClick={() => {
                      setFilter({ range: option.value, from: "", to: "" });
                      if (option.value !== "custom") {
                        setTimeout(() => apply(), 0);
                        setShowDropdown(false);
                      }
                    }}
                  >
                    {option.label}
                    {filter.range === option.value && <span className="check-icon">✓</span>}
                  </button>
                ))}
              </div>

              {filter.range === "custom" && (
                <div className="custom-date-section">
                  <div className="mb-2">
                    <Form.Label className="small fw-semibold mb-1">From Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={filter.from}
                      onChange={(e) => {
                        setFilter((f) => ({ ...f, from: e.target.value }));
                      }}
                      className="filter-date-input"
                      size="sm"
                    />
                  </div>
                  <div className="mb-3">
                    <Form.Label className="small fw-semibold mb-1">To Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={filter.to}
                      onChange={(e) => {
                        setFilter((f) => ({ ...f, to: e.target.value }));
                      }}
                      className="filter-date-input"
                      size="sm"
                    />
                  </div>
                  <Button 
                    variant="primary" 
                    size="sm"
                    className="w-100 apply-btn"
                    onClick={() => {
                      apply();
                      setShowDropdown(false);
                    }}
                    disabled={!filter.from || !filter.to}
                  >
                    Apply Custom Range
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  // Chart Renderers
  const UsersChart = () => (
    <div className="chart-card border-0 h-100">
      <div className="chart-header">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h6 className="chart-title mb-0">Users (Monthly)</h6>
          <FilterUI
            filter={userFilter}
            setFilter={setUserFilter}
            apply={fetchAll}
            showReset={true}
          />
        </div>
      </div>
      <div className="card-body">
        <ResponsiveContainer width="100%" height={250}>
          <LineChart
            data={(userStats?.monthly || []).map((m) => ({
              month: formatMonthLabel(m.month),
              newUsers: m.newUsers,
            }))}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="newUsers" stroke="#8884d8" strokeWidth={2} dot />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const VirusChart = () => (
    <div className="chart-card border-0 h-100">
      <div className="chart-header">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h6 className="chart-title mb-0">VirusTotal Scans (Monthly)</h6>
          <FilterUI
            filter={virusFilter}
            setFilter={setVirusFilter}
            apply={fetchAll}
            showReset={true}
          />
        </div>
      </div>
      <div className="card-body">
        <ResponsiveContainer width="100%" height={250}>
          <LineChart
            data={(virusStats?.monthly || []).map((m) => ({
              month: formatMonthLabel(m.month),
              scans: m.scans,
            }))}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="scans" stroke="#82ca9d" strokeWidth={2} dot />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const DomainsChart = () => (
    <div className="chart-card border-0 h-100">
      <div className="chart-header">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h6 className="chart-title mb-0">Domains Scanned (Monthly)</h6>
          <FilterUI
            filter={domainFilter}
            setFilter={setDomainFilter}
            apply={fetchAll}
            showReset={true}
          />
        </div>
      </div>
      <div className="card-body">
        <ResponsiveContainer width="100%" height={250}>
          <LineChart
            data={(domainStats?.monthly || []).map((m) => ({
              month: formatMonthLabel(m.month),
              domains: m.domainsScanned,
            }))}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="domains" stroke="#ffc658" strokeWidth={2} dot />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <div className="container mt-4 mb-5">

      {/* Dashboard Header (NOT draggable) */}
      <div className="dashboard-header mb-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h1 className="dashboard-title">Dashboard</h1>
            <p className="dashboard-subtitle mb-0">Overview statistics & trends</p>
          </div>

          <div className="d-flex gap-2 align-items-center flex-wrap">
            <FilterUI
              filter={globalFilter}
              setFilter={setGlobalFilter}
              apply={fetchAll}
              showReset={false}
            />
            {(globalFilter.range !== "all" || 
              userFilter.range !== "all" || 
              virusFilter.range !== "all" || 
              domainFilter.range !== "all") && (
              <Button 
                size="sm" 
                className="reset-all-btn d-flex align-items-center justify-content-center"
                onClick={resetAll}
                title="Reset all filters"
              >
                <RotateCcw size={16} />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* GRID LAYOUT START */}
      <GridLayout
        className="layout"
        layout={layout}
        cols={12}
        rowHeight={30}
        width={containerWidth}
        onLayoutChange={handleLayoutChange}
        draggableHandle=".drag-handle"
        isDraggable={true}
        isResizable={true}
        compactType="vertical"
      >
        {/* 6 WIDGETS AS GRID ITEMS */}

        <div key="statUsers" className="grid-item">
          <div className="drag-handle">⋮⋮</div>
          <StatCard
            title="Total Users"
            value={userStats?.totalUsers ?? 0}
            thisMonth={userStats?.newUsersThisMonth ?? 0}
            lastMonth={userStats?.newUsersLastMonth ?? 0}
            icon={Users}
            iconBg="bg-primary"
          />
        </div>

        <div key="statVirus" className="grid-item">
          <div className="drag-handle">⋮⋮ </div>
          <StatCard
            title="VirusTotal Scans"
            value={virusStats?.totalScans ?? 0}
            thisMonth={virusStats?.scansThisMonth ?? 0}
            lastMonth={virusStats?.scansLastMonth ?? 0}
            icon={Bug}
            iconBg="bg-success"
          />
        </div>

        <div key="statDomains" className="grid-item">
          <div className="drag-handle">⋮⋮</div>
          <StatCard
            title="Domains Scanned"
            value={domainStats?.totalDomains ?? 0}
            thisMonth={domainStats?.domainsThisMonth ?? 0}
            lastMonth={domainStats?.domainsLastMonth ?? 0}
            icon={Shield}
            iconBg="bg-warning"
          />
        </div>

        <div key="chartUsers" className="grid-item">
          <div className="drag-handle">⋮⋮</div>
          {UsersChart()}
        </div>

        <div key="chartVirus" className="grid-item">
          <div className="drag-handle">⋮⋮</div>
          {VirusChart()}
        </div>

        <div key="chartDomains" className="grid-item">
          <div className="drag-handle">⋮⋮</div>
          {DomainsChart()}
        </div>
      </GridLayout>
      {/* GRID LAYOUT END */}
    </div>
  );
}

export default Dashboard;