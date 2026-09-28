import React from 'react';
import { Project } from '../../types/paimana';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

interface DashboardChartsProps {
  projects: Project[];
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ projects }) => {
  // A. Projects by State
  const stateCounts = React.useMemo(() => {
    const map = new Map<string, number>();
    projects.forEach(p => {
      map.set(p.state, (map.get(p.state) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([state, count]) => ({ state, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [projects]);

  // B. Projects by Ministry
  const ministryCounts = React.useMemo(() => {
    const map = new Map<string, number>();
    projects.forEach(p => {
      const shortMin = p.ministry.replace('Ministry of ', 'Mo ');
      map.set(shortMin, (map.get(shortMin) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([ministry, count]) => ({ ministry, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [projects]);

  // C. Projects by Sector
  const sectorCounts = React.useMemo(() => {
    const map = new Map<string, number>();
    projects.forEach(p => {
      map.set(p.sector, (map.get(p.sector) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([sector, count]) => ({ sector, count }))
      .sort((a, b) => b.count - a.count);
  }, [projects]);

  // D. Original vs Revised Cost (Top 7 by Cost)
  const costComparisonData = React.useMemo(() => {
    return [...projects]
      .sort((a, b) => b.revisedCost - a.revisedCost)
      .slice(0, 7)
      .map(p => ({
        name: p.projectName.length > 20 ? p.projectName.slice(0, 18) + '...' : p.projectName,
        originalCost: Math.round(p.originalCost),
        revisedCost: Math.round(p.revisedCost),
        fullName: p.projectName,
      }));
  }, [projects]);

  // E. Expenditure vs Revised Cost
  const expenditureData = React.useMemo(() => {
    return [...projects]
      .sort((a, b) => b.revisedCost - a.revisedCost)
      .slice(0, 7)
      .map(p => ({
        name: p.projectName.length > 20 ? p.projectName.slice(0, 18) + '...' : p.projectName,
        revisedCost: Math.round(p.revisedCost),
        expenditure: Math.round(p.cumulativeExpenditure),
        fullName: p.projectName,
      }));
  }, [projects]);

  // F. Physical Progress Distribution (0-25%, 26-50%, 51-75%, 76-100%)
  const progressDistData = React.useMemo(() => {
    let b1 = 0, b2 = 0, b3 = 0, b4 = 0, na = 0;
    projects.forEach(p => {
      if (p.physicalProgress === null) na++;
      else if (p.physicalProgress <= 25) b1++;
      else if (p.physicalProgress <= 50) b2++;
      else if (p.physicalProgress <= 75) b3++;
      else b4++;
    });

    const data = [
      { name: '0–25% (Low)', count: b1, color: '#f59e0b' },
      { name: '26–50% (Moderate)', count: b2, color: '#3b82f6' },
      { name: '51–75% (Advanced)', count: b3, color: '#10b981' },
      { name: '76–100% (Mature)', count: b4, color: '#047857' },
    ];
    if (na > 0) {
      data.push({ name: 'N/A (Not Reported)', count: na, color: '#94a3b8' });
    }
    return data;
  }, [projects]);

  // G. Project Completion Timeline (Target years distribution)
  const timelineData = React.useMemo(() => {
    const yearMap = new Map<string, { original: number; revised: number }>();
    projects.forEach(p => {
      const origYear = p.originalCompletionDate.slice(0, 4);
      if (origYear) {
        const cur = yearMap.get(origYear) || { original: 0, revised: 0 };
        cur.original += 1;
        yearMap.set(origYear, cur);
      }
      if (p.revisedCompletionDate) {
        const revYear = p.revisedCompletionDate.slice(0, 4);
        if (revYear) {
          const cur = yearMap.get(revYear) || { original: 0, revised: 0 };
          cur.revised += 1;
          yearMap.set(revYear, cur);
        }
      }
    });

    return Array.from(yearMap.entries())
      .map(([year, val]) => ({ year, original: val.original, revised: val.revised }))
      .sort((a, b) => a.year.localeCompare(b.year))
      .filter(item => Number(item.year) >= 2016 && Number(item.year) <= 2030);
  }, [projects]);

  return (
    <div className="space-y-6">
      {/* Row 1: State & Ministry Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* A. Projects by State */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="mb-4">
            <h4 className="text-sm font-bold text-slate-800">A. Projects by State / Region</h4>
            <p className="text-xs text-slate-500">Number of monitored central infrastructure projects</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stateCounts} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="state"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  angle={-25}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" name="Projects" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* B. Projects by Ministry */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="mb-4">
            <h4 className="text-sm font-bold text-slate-800">B. Projects by Ministry</h4>
            <p className="text-xs text-slate-500">Distribution across central nodal ministries</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ministryCounts} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="ministry"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  angle={-20}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" name="Projects" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Sector & Progress Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* C. Projects by Sector */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="mb-4">
            <h4 className="text-sm font-bold text-slate-800">C. Projects by Sector</h4>
            <p className="text-xs text-slate-500">Volume by core infrastructure domains</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectorCounts} layout="vertical" margin={{ top: 10, right: 20, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <YAxis dataKey="sector" type="category" tick={{ fontSize: 10, fill: '#64748b' }} width={120} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" name="Projects" fill="#4f46e5" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* F. Physical Progress Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="mb-4">
            <h4 className="text-sm font-bold text-slate-800">F. Physical Progress Distribution</h4>
            <p className="text-xs text-slate-500">Categorized by completion brackets</p>
          </div>
          <div className="h-64 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={progressDistData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="count"
                  label={(entry: any) => `${(entry.name || '').split(' ')[0]}: ${entry.value ?? entry.count}`}
                >
                  {progressDistData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Financial Comparisons (D & E) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* D. Original vs Revised Cost */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="mb-4">
            <h4 className="text-sm font-bold text-slate-800">D. Original vs Revised Cost (Top Projects)</h4>
            <p className="text-xs text-slate-500">Values in ₹ Crores (Approved vs Currently Sanctioned)</p>
          </div>
          <div className="h-68">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costComparisonData} margin={{ top: 10, right: 10, left: 10, bottom: 35 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')} Cr`, '']}
                  labelFormatter={(_label, payload) => payload?.[0]?.payload?.fullName || _label}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="originalCost" name="Original Cost" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="revisedCost" name="Revised Cost" fill="#dc2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* E. Expenditure vs Revised Cost */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="mb-4">
            <h4 className="text-sm font-bold text-slate-800">E. Cumulative Expenditure vs Revised Cost</h4>
            <p className="text-xs text-slate-500">Disbursed spend compared against revised budget (₹ Cr)</p>
          </div>
          <div className="h-68">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expenditureData} margin={{ top: 10, right: 10, left: 10, bottom: 35 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')} Cr`, '']}
                  labelFormatter={(_label, payload) => payload?.[0]?.payload?.fullName || _label}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="revisedCost" name="Revised Cost" fill="#0284c7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenditure" name="Cumulative Expenditure" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 4: G. Project Completion Timeline */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="mb-4">
          <h4 className="text-sm font-bold text-slate-800">G. Project Completion Timeline (Target vs Revised Schedule Shift)</h4>
          <p className="text-xs text-slate-500">
            Number of projects scheduled to complete by target year (Original Target vs Revised Milestones)
          </p>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timelineData} margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Line
                type="monotone"
                dataKey="original"
                name="Original Scheduled Completion"
                stroke="#64748b"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="revised"
                name="Revised Scheduled Completion"
                stroke="#ea580c"
                strokeWidth={2.5}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
