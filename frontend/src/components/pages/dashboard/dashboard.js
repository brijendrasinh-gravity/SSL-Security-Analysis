import React, { useEffect, useState } from "react";
import { Row, Col, Card, Spinner } from "react-bootstrap";
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
import { Users, Bug, Shield } from "lucide-react";
import API from "../../../api/api";
import { usePermission } from "../../../hooks/usePermission";

const StatCard = ({ title, value, thisMonth, lastMonth, icon: Icon, iconBg }) => {
  const difference = thisMonth - lastMonth;
  const isIncrease = difference > 0;
  const percentageChange = lastMonth > 0 ? Math.abs((difference / lastMonth) * 100).toFixed(1) : 0;

  return (
    <Card className="shadow-sm mb-3 border-0">
      <Card.Body className="p-4">
        <div className="d-flex justify-content-between align-items-start">
          <div className="flex-grow-1">
            <div className="d-flex align-items-center gap-2 mb-2">
              <div 
                className={`${iconBg} rounded-circle d-flex align-items-center justify-content-center`}
                style={{ width: '40px', height: '40px' }}
              >
                <Icon size={20} className="text-white" />
              </div>
              <h6 className="mb-0 text-muted fw-semibold">{title}</h6>
            </div>
            <h2 className="mb-2 fw-bold">{value}</h2>
            <div className="d-flex align-items-center gap-2">
              <small className="text-muted">This month: <strong>{thisMonth}</strong></small>
              {difference !== 0 && (
                <span className={`badge ${isIncrease ? 'bg-success' : 'bg-danger'} d-flex align-items-center gap-1`}>
                  {isIncrease ? '↑' : '↓'} {percentageChange}%
                </span>
              )}
              {difference === 0 && (
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

  useEffect(() => {
    if (!hasPermission('dashboard_permission', 'canView')) {
      setLoading(false);
      return;
    }
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [uRes, vRes, dRes] = await Promise.all([
        API.get("/dashboard/user-stats"),
        API.get("/dashboard/virustotal-stats"),
        API.get("/dashboard/domain-stats"),
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

  if (!hasPermission('dashboard_permission', 'canView')) {
    return (
      <div className="container mt-4">
        <h4 className="text-muted">You don't have permission to view the dashboard.</h4>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "60vh" }}>
        <Spinner animation="border" />
      </div>
    );
  }

  // Convert monthly arrays to chart friendly format (x: month)
  // months format is 'YYYY-MM' in backend; convert to 'MMM YYYY' for display
  const formatMonthLabel = (ym) => {
    const [y, m] = ym.split('-').map(Number);
    const date = new Date(y, m - 1, 1);
    return date.toLocaleString(undefined, { month: 'short', year: 'numeric' });
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4 bg-light p-3 rounded shadow-sm">
        <div>
          <h4 className="fw-bold mb-0 text-primary">Dashboard</h4>
          <small className="text-muted">Overview of system statistics and trends</small>
        </div>
      </div>

      {/* Cards */}
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

      {/* Charts */}
      <div className="card shadow-sm border-0 mt-3">
        <div className="card-body">
          <h6 className="mb-3">Users - New Joiners (Last 12 months)</h6>
          <div style={{ width: '100%', height: 300 }}>
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
                <Line type="monotone" dataKey="newUsers" stroke="#8884d8" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0 mt-3">
        <div className="card-body">
          <h6 className="mb-3">VirusTotal Scans (Last 12 months)</h6>
          <div style={{ width: '100%', height: 300 }}>
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
                <Line type="monotone" dataKey="scans" stroke="#82ca9d" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0 mt-3 mb-5">
        <div className="card-body">
          <h6 className="mb-3">Domains Scanned (Last 12 months)</h6>
          <div style={{ width: '100%', height: 300 }}>
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
                <Line type="monotone" dataKey="domains" stroke="#ffc658" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
