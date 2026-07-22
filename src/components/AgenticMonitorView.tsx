import { useState } from 'react';
import { Bot, Clock, Bell, RefreshCw, CheckCircle2, AlertTriangle, ShieldAlert, ArrowDown, Plus } from 'lucide-react';

interface MonitoredVendor {
  id: string;
  name: string;
  domain: string;
  schedule: 'Hourly' | 'Daily' | 'Weekly';
  lastChecked: string;
  previousScore: number;
  currentScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  alertStatus: 'clean' | 'score_dropped' | 'override_triggered';
  lastAlertDetails?: string;
  autoActionTaken?: string;
}

const INITIAL_MONITORED_VENDORS: MonitoredVendor[] = [
  {
    id: 'mon_1',
    name: 'Stripe, Inc.',
    domain: 'stripe.com',
    schedule: 'Daily',
    lastChecked: 'Today, 04:00 AM UTC',
    previousScore: 950,
    currentScore: 950,
    grade: 'A',
    alertStatus: 'clean',
  },
  {
    id: 'mon_2',
    name: 'Apex Data Services Ltd.',
    domain: 'apexdata.net',
    schedule: 'Daily',
    lastChecked: 'Today, 02:15 AM UTC',
    previousScore: 840,
    currentScore: 430,
    grade: 'F',
    alertStatus: 'override_triggered',
    lastAlertDetails: 'Active Ransomware breach disclosed on BleepingComputer news feed. Grade F Override triggered.',
    autoActionTaken: 'Agentic AI automatically raised P0 CISO Alert & dispatched webhook to Slack #security-ops',
  },
  {
    id: 'mon_3',
    name: 'Vanguard Systems Group',
    domain: 'vanguard-sys.com',
    schedule: 'Weekly',
    lastChecked: 'Yesterday, 11:30 PM UTC',
    previousScore: 920,
    currentScore: 810,
    grade: 'A',
    alertStatus: 'score_dropped',
    lastAlertDetails: 'Cybersecurity score dropped 110 pts due to unpatched CVE-2024-3094 on web app.',
    autoActionTaken: 'Agentic AI logged re-assessment diff in audit ledger & queued Vendor Risk Review',
  },
];

export function AgenticMonitorView() {
  const [monitoredList, setMonitoredList] = useState<MonitoredVendor[]>(INITIAL_MONITORED_VENDORS);
  const [isRechecking, setIsRechecking] = useState(false);
  const [newDomainInput, setNewDomainInput] = useState('');

  const handleRunAllRechecks = async () => {
    setIsRechecking(true);
    await new Promise(res => setTimeout(res, 1200));
    setMonitoredList(prev => prev.map(v => ({
      ...v,
      lastChecked: 'Just now',
    })));
    setIsRechecking(false);
  };

  const handleAddVendorToSchedule = () => {
    if (!newDomainInput.trim()) return;
    const clean = newDomainInput.trim().toLowerCase().replace(/^https?:\/\//, '');
    const newVendor: MonitoredVendor = {
      id: `mon_${Date.now()}`,
      name: clean.charAt(0).toUpperCase() + clean.slice(1),
      domain: clean.includes('.') ? clean : `${clean}.com`,
      schedule: 'Daily',
      lastChecked: 'Just now',
      previousScore: 950,
      currentScore: 950,
      grade: 'A',
      alertStatus: 'clean',
    };
    setMonitoredList(prev => [newVendor, ...prev]);
    setNewDomainInput('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Agentic AI Header Banner */}
      <div className="card" style={{ borderLeft: '4px solid #10b981', background: 'linear-gradient(135deg, #ffffff, #f8fafc)', border: '1px solid #cbd5e1' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div className="brand-icon" style={{ background: '#10b981' }}>
              <Bot size={24} color="#ffffff" />
            </div>
            <div>
              <span className="version-badge" style={{ background: '#ecfdf5', borderColor: '#a7f3d0', color: '#047857' }}>
                RISKMATE AGENTIC WORKFLOW
              </span>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                Continuous Vendor Monitoring & Autonomous Re-Checker
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
                Autonomous background runner checks vendors on schedule, tracks score deltas, and dispatches automated alerts when risks shift.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            disabled={isRechecking}
            onClick={handleRunAllRechecks}
          >
            <RefreshCw size={16} className={isRechecking ? 'spin-anim' : ''} />
            {isRechecking ? 'Running Sweep...' : 'Trigger Instant Re-Check'}
          </button>
        </div>
      </div>

      {/* Add New Vendor to Monitoring Schedule Bar */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
            <Clock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#6b7280' }} />
            <input
              type="text"
              value={newDomainInput}
              onChange={e => setNewDomainInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddVendorToSchedule()}
              placeholder="Add vendor domain to Agentic Monitoring Schedule (e.g. okta.com)..."
              style={{ width: '100%', paddingLeft: '38px' }}
            />
          </div>
          <button type="button" className="btn btn-secondary" onClick={handleAddVendorToSchedule}>
            <Plus size={16} /> Add to Schedule
          </button>
        </div>
      </div>

      {/* Monitored Vendors Table & Alert Ledger */}
      <div className="card">
        <div className="card-title" style={{ fontSize: '1.05rem', marginBottom: '14px' }}>
          <Bell size={18} color="#a855f7" />
          <span>Active Agentic Monitoring Schedule ({monitoredList.length} Vendors Tracked)</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Vendor / Domain</th>
                <th>Cron Schedule</th>
                <th>Last Re-Check</th>
                <th>Score Delta</th>
                <th>Grade</th>
                <th>Agentic Alert Status & Automated Action</th>
              </tr>
            </thead>
            <tbody>
              {monitoredList.map(v => {
                const delta = v.currentScore - v.previousScore;
                const isOver = v.alertStatus === 'override_triggered';
                const isDrop = v.alertStatus === 'score_dropped';

                return (
                  <tr key={v.id} style={{ background: isOver ? 'rgba(239, 68, 68, 0.08)' : isDrop ? 'rgba(245, 158, 11, 0.08)' : undefined }}>
                    <td>
                      <strong style={{ color: '#f3f4f6' }}>{v.name}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{v.domain}</div>
                    </td>
                    <td>
                      <span className="badge badge-medium" style={{ fontSize: '0.7rem' }}>
                        <Clock size={10} style={{ marginRight: '4px' }} />
                        {v.schedule}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{v.lastChecked}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, fontSize: '0.9rem' }}>
                        {delta < 0 ? (
                          <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center' }}>
                            <ArrowDown size={14} /> {delta} pts ({v.previousScore} &rarr; {v.currentScore})
                          </span>
                        ) : (
                          <span style={{ color: '#34d399', display: 'flex', alignItems: 'center' }}>
                            <CheckCircle2 size={14} /> 0 pts ({v.currentScore}/950)
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`grade-badge-huge grade-${v.grade}`} style={{ width: '32px', height: '32px', fontSize: '1.1rem', borderRadius: '8px' }}>
                        {v.grade}
                      </span>
                    </td>
                    <td>
                      {isOver ? (
                        <div>
                          <span className="badge badge-low" style={{ fontSize: '0.72rem', marginBottom: '2px' }}>
                            <ShieldAlert size={12} /> CRITICAL OVERRIDE TRIGGERED
                          </span>
                          <p style={{ fontSize: '0.76rem', color: '#fca5a5', marginTop: '2px' }}>{v.lastAlertDetails}</p>
                          <div style={{ fontSize: '0.72rem', color: '#d8b4fe', fontWeight: 600, marginTop: '2px' }}>
                            🤖 {v.autoActionTaken}
                          </div>
                        </div>
                      ) : isDrop ? (
                        <div>
                          <span className="badge badge-medium" style={{ fontSize: '0.72rem', marginBottom: '2px' }}>
                            <AlertTriangle size={12} /> SCORE DROPPED
                          </span>
                          <p style={{ fontSize: '0.76rem', color: '#fcd34d', marginTop: '2px' }}>{v.lastAlertDetails}</p>
                          <div style={{ fontSize: '0.72rem', color: '#a5b4fc', marginTop: '2px' }}>
                            🤖 {v.autoActionTaken}
                          </div>
                        </div>
                      ) : (
                        <div style={{ color: '#34d399', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <CheckCircle2 size={14} /> Clean Telemetry. Score Stable.
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
