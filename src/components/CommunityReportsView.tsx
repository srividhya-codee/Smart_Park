import React, { useState } from 'react';
import { 
  Radio, 
  ThumbsUp, 
  ThumbsDown, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  MapPin, 
  Clock, 
  Filter, 
  X 
} from 'lucide-react';
import type { CommunityReport, ChennaiZone } from '../types';

interface CommunityReportsViewProps {
  reports: CommunityReport[];
  onVote: (reportId: string, type: 'upvote' | 'downvote') => void;
  onSubmitReport: (newReport: {
    streetAddress: string;
    zone: ChennaiZone;
    reportType: CommunityReport['reportType'];
    description: string;
    severity: 'low' | 'medium' | 'high';
    reportedBy: string;
  }) => void;
}

export const CommunityReportsView: React.FC<CommunityReportsViewProps> = ({
  reports,
  onVote,
  onSubmitReport
}) => {
  const [selectedZone, setSelectedZone] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [streetAddress, setStreetAddress] = useState('');
  const [zone, setZone] = useState<ChennaiZone>('T. Nagar (Pondy Bazaar / Usman Rd)');
  const [reportType, setReportType] = useState<CommunityReport['reportType']>('free_spot_opened');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high'>('low');
  const [reportedBy, setReportedBy] = useState('Chennai Commuter');

  const filteredReports = reports.filter(r => {
    if (selectedZone !== 'All') return r.zone === selectedZone;
    return true;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!streetAddress || !description) return;
    onSubmitReport({
      streetAddress,
      zone,
      reportType,
      description,
      severity,
      reportedBy
    });
    setIsModalOpen(false);
    setStreetAddress('');
    setDescription('');
  };

  const getReportTypeBadge = (type: CommunityReport['reportType']) => {
    switch (type) {
      case 'gcc_sweeping':
        return <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold">🧹 GCC Sweeper Active</span>;
      case 'waterlogging':
        return <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200 text-[10px] font-semibold">🌊 Rain Waterlogging</span>;
      case 'meter_broken':
        return <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-[10px] font-semibold">⚠️ Smart Meter Sensor Down</span>;
      case 'free_spot_opened':
        return <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-[10px] font-semibold">✨ Free Spot Just Opened</span>;
      case 'auto_blockage':
        return <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-semibold">🛺 Auto Stand / Curb Hazard</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-semibold">📢 Roadside Alert</span>;
    }
  };

  return (
    <div id="community-reports-container" className="max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
              <Radio className="w-3.5 h-3.5 text-teal-600" />
              Live Roadside Crowd-Intel
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Chennai Community Road & Curb Reports
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time verified reports by Chennai drivers regarding GCC sweeping, unexpected vacant spots, rain puddles, or broken sensors.
          </p>
        </div>

        <button
          id="btn-open-report-modal"
          onClick={() => setIsModalOpen(true)}
          className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Report Road Condition</span>
        </button>
      </div>

      {/* Zone Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <span className="text-xs text-slate-500 flex items-center gap-1 font-semibold pl-1">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          Zone:
        </span>
        {[
          'All',
          'T. Nagar (Pondy Bazaar / Usman Rd)',
          'Anna Nagar (2nd Ave / Shanthi Colony)',
          'Nungambakkam (Khader Nawaz Khan Rd)',
          'Mylapore (Luz / Kapaleeshwarar)',
          "Besant Nagar & Adyar (Elliot's Beach)",
          'Velachery (100 Ft Bypass Rd)',
          'OMR IT Corridor (Perungudi / Thoraipakkam)'
        ].map((z, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedZone(z)}
            className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              selectedZone === z
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
            }`}
          >
            {z.split('(')[0].trim()}
          </button>
        ))}
      </div>

      {/* Reports Feed */}
      <div className="space-y-3">
        {filteredReports.map(report => (
          <div
            key={report.id}
            id={`report-${report.id}`}
            className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs hover:border-slate-300 transition-all"
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                {getReportTypeBadge(report.reportType)}
                <span className="text-xs font-semibold text-slate-700">{report.zone}</span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <p className="text-sm text-slate-900 font-medium">{report.description}</p>
              
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <span className="flex items-center gap-1 text-slate-400">
                  <MapPin className="w-3.5 h-3.5" />
                  {report.streetAddress}
                </span>
                <span>•</span>
                <span className="text-slate-500">Reported by: <strong className="text-slate-700">{report.reportedBy}</strong></span>
              </div>
            </div>

            {/* Upvote / Downvote */}
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center bg-slate-50 p-1.5 rounded-xl border border-slate-200">
              <button
                onClick={() => onVote(report.id, 'upvote')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  report.userAction === 'upvoted'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                    : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-100'
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>{report.upvotes}</span>
              </button>

              <button
                onClick={() => onVote(report.id, 'downvote')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  report.userAction === 'downvoted'
                    ? 'bg-rose-50 text-rose-700 border border-rose-300'
                    : 'text-slate-600 hover:text-rose-700 hover:bg-slate-100'
                }`}
              >
                <ThumbsDown className="w-3.5 h-3.5" />
                <span>{report.downvotes}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* New Report Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-lg font-bold text-slate-900 mb-4">Post Roadside Intel Report</h2>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Chennai Zone</label>
                <select
                  value={zone}
                  onChange={(e) => setZone(e.target.value as ChennaiZone)}
                  className="w-full bg-slate-50 text-slate-900 text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 focus:bg-white"
                >
                  <option value="T. Nagar (Pondy Bazaar / Usman Rd)">T. Nagar (Pondy Bazaar / Usman Rd)</option>
                  <option value="Anna Nagar (2nd Ave / Shanthi Colony)">Anna Nagar (2nd Ave / Shanthi Colony)</option>
                  <option value="Nungambakkam (Khader Nawaz Khan Rd)">Nungambakkam (Khader Nawaz Khan Rd)</option>
                  <option value="Mylapore (Luz / Kapaleeshwarar)">Mylapore (Luz / Kapaleeshwarar)</option>
                  <option value="Besant Nagar & Adyar (Elliot's Beach)">Besant Nagar & Adyar (Elliot's Beach)</option>
                  <option value="Velachery (100 Ft Bypass Rd)">Velachery (100 Ft Bypass Rd)</option>
                  <option value="OMR IT Corridor (Perungudi / Thoraipakkam)">OMR IT Corridor (Perungudi / Thoraipakkam)</option>
                  <option value="Marina Beach (Kamarajar Salai)">Marina Beach (Kamarajar Salai)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address / Landmark</label>
                <input
                  type="text"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="e.g. Opposite Naidu Hall, Sir Thyagaraya Rd, T. Nagar"
                  required
                  className="w-full bg-slate-50 text-slate-900 text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Report Category</label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value as any)}
                    className="w-full bg-slate-50 text-slate-900 text-xs px-3 py-2 rounded-xl border border-slate-200 focus:bg-white"
                  >
                    <option value="free_spot_opened">Free Spot Just Opened</option>
                    <option value="gcc_sweeping">GCC Road Sweeping Active</option>
                    <option value="waterlogging">Rain Water Puddle</option>
                    <option value="auto_blockage">Auto / Construction Block</option>
                    <option value="meter_broken">Smart Meter Issue</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Severity</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full bg-slate-50 text-slate-900 text-xs px-3 py-2 rounded-xl border border-slate-200 focus:bg-white"
                  >
                    <option value="low">Low (Info)</option>
                    <option value="medium">Medium</option>
                    <option value="high">High (Hazard)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Intel</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe roadside vacancy, traffic conditions, or obstruction..."
                  required
                  className="w-full bg-slate-50 text-slate-900 text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-xs"
              >
                Broadcast Report Across Chennai Network
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
