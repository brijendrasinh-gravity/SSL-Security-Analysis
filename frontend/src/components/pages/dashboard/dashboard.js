import React, { useEffect, useState } from "react";
import { Row, Col, Card, Spinner, Button, Form } from "react-bootstrap";
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
import { Users, Bug, Shield, RotateCcw } from "lucide-react";
import API from "../../../api/api";
import { usePermission } from "../../../hooks/usePermission";

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

  return (
    <Card className="shadow-sm mb-3 border-0">
      <Card.Body className="p-4">
        <div className="d-flex justify-content-between align-items-start">
          <div className="flex-grow-1">
            <div className="d-flex align-items-center gap-2 mb-2">
              <div
                className={`${iconBg} rounded-circle d-flex align-items-center justify-content-center`}
                style={{ width: 40, height: 40 }}
              >
                <Icon size={20} className="text-white" />
              </div>
              <h6 className="mb-0 text-muted fw-semibold">{title}</h6>
            </div>

            <h2 className="mb-2 fw-bold">{value}</h2>

            <div className="d-flex align-items-center gap-2">
              <small className="text-muted">
                This month: <strong>{thisMonth}</strong>
              </small>

              {lastMonth === 0 && thisMonth === 0 && (
                <span className="badge bg-secondary">No change</span>
              )}

              {lastMonth === 0 && thisMonth > 0 && (
                <span className="badge bg-success">↑ 100%</span>
              )}

              {lastMonth > 0 && diff !== 0 && (
                <span
                  className={`badge ${isIncrease ? "bg-success" : "bg-danger"}`}
                >
                  {isIncrease ? "↑" : "↓"} {percentageChange}%
                </span>
              )}

              {lastMonth > 0 && diff === 0 && (
                <span className="badge bg-secondary">No change</span>
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

  const [globalFilter, setGlobalFilter] = useState({
    range: "all", // today, 7d, 15d, 30d, 3m, 6m, year, all, custom
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
    if (!hasPermission("dashboard_permission", "canView")) {
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

  const resetAll = () => {
    const resetState = { range: "all", from: "", to: "" };
    setGlobalFilter(resetState);
    setUserFilter(resetState);
    setVirusFilter(resetState);
    setDomainFilter(resetState);
    
    // Fetch with reset filters
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

  if (!hasPermission("dashboard_permission", "canView")) {
    return (
      <div className="container mt-4">
        <h4>You don't have permission.</h4>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "60vh" }}
      >
        <Spinner animation="border" />
      </div>
    );
  }

  const rangeOptions = (
    <>
      <option value="all">All</option>
      <option value="today">Today</option>
      <option value="7d">Last 7 Days</option>
      <option value="15d">Last 15 Days</option>
      <option value="30d">Last 30 Days</option>
      <option value="3m">Last 3 Months</option>
      <option value="6m">Last 6 Months</option>
      <option value="year">This Year</option>
      <option value="custom">Custom</option>
    </>
  );

  const FilterUI = ({ filter, setFilter, apply, showReset = true }) => (
    <div className="d-flex gap-2 align-items-center">
      <Form.Select
        value={filter.range}
        onChange={(e) => {
          const value = e.target.value;
          setFilter({ range: value, from: "", to: "" });
          if (value !== "custom") {
            setTimeout(() => apply(), 0);
          }
        }}
        style={{ width: 150 }}
      >
        {rangeOptions}
      </Form.Select>

      {filter.range === "custom" && (
        <>
          <Form.Control
            type="date"
            value={filter.from}
            onChange={(e) => {
              setFilter((f) => ({ ...f, from: e.target.value }));
            }}
            onBlur={() => {
              if (filter.from && filter.to) {
                setTimeout(() => apply(), 0);
              }
            }}
            style={{ width: 150 }}
          />
          <Form.Control
            type="date"
            value={filter.to}
            onChange={(e) => {
              setFilter((f) => ({ ...f, to: e.target.value }));
            }}
            onBlur={() => {
              if (filter.from && filter.to) {
                setTimeout(() => apply(), 0);
              }
            }}
            style={{ width: 150 }}
          />
          <Button 
            variant="outline-primary" 
            size="sm"
            onClick={apply}
            disabled={!filter.from || !filter.to}
          >
            Apply
          </Button>
        </>
      )}

      {showReset && filter.range !== "all" && (
        <Button
          variant="outline-secondary"
          size="sm"
          className="d-flex align-items-center gap-1"
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
  );

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3 bg-light p-3 rounded shadow-sm">
        <div>
          <h4 className="fw-bold mb-0 text-primary">Dashboard</h4>
          <small className="text-muted">Overview statistics & trends</small>
        </div>

        <div className="d-flex gap-2 align-items-center">
          <small className="text-muted fw-semibold">Global Filter:</small>
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
              variant="danger" 
              size="sm" 
              className="d-flex align-items-center justify-content-center"
              onClick={resetAll}
              title="Reset all filters"
            >
              <RotateCcw size={16} />
            </Button>
          )}
        </div>
      </div>

      <Row>
        <Col md={4}>
          <StatCard
            title="Total Users"
            value={userStats?.totalUsers ?? 0}
            thisMonth={userStats?.newUsersThisMonth ?? 0}
            lastMonth={userStats?.newUsersLastMonth ?? 0}
            icon={Users}
            iconBg="bg-primary"
          />
        </Col>
        <Col md={4}>
          <StatCard
            title="VirusTotal Scans"
            value={virusStats?.totalScans ?? 0}
            thisMonth={virusStats?.scansThisMonth ?? 0}
            lastMonth={virusStats?.scansLastMonth ?? 0}
            icon={Bug}
            iconBg="bg-success"
          />
        </Col>
        <Col md={4}>
          <StatCard
            title="Domains Scanned"
            value={domainStats?.totalDomains ?? 0}
            thisMonth={domainStats?.domainsThisMonth ?? 0}
            lastMonth={domainStats?.domainsLastMonth ?? 0}
            icon={Shield}
            iconBg="bg-warning"
          />
        </Col>
      </Row>

      <div className="card shadow-sm border-0 mt-3">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="mb-0 fw-bold">Users (Monthly)</h6>
            <FilterUI
              filter={userFilter}
              setFilter={setUserFilter}
              apply={fetchAll}
              showReset={true}
            />
          </div>

          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
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
      </div>

      <div className="card shadow-sm border-0 mt-3">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="mb-0 fw-bold">VirusTotal Scans</h6>
            <FilterUI
              filter={virusFilter}
              setFilter={setVirusFilter}
              apply={fetchAll}
              showReset={true}
            />
          </div>

          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
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
      </div>

      <div className="card shadow-sm border-0 mt-3 mb-5">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="mb-0 fw-bold">Domains Scanned</h6>
            <FilterUI
              filter={domainFilter}
              setFilter={setDomainFilter}
              apply={fetchAll}
              showReset={true}
            />
          </div>

          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
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
      </div>
    </div>
  );
}

export default Dashboard;
