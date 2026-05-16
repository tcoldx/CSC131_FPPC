'use client';

import { useState, useEffect } from 'react';
import { sendConflictAlert } from './emailNotification';

// NOTE: Dummy data is used for demonstration purposes.
const dummyConflicts = [
  { id: 'CON-1001', parties: 'Party A vs. Agency B', type: 'Financial Interest', date: '2025-05-01', severity: 'High' },
  { id: 'CON-1004', parties: 'Agency G vs. Supplier H', type: 'Financial Interest', date: '2025-05-05', severity: 'Low' },
  { id: 'CON-1005', parties: 'Officer I vs. Firm J', type: 'Prior Employment', date: '2025-05-06', severity: 'Medium' },
];

function severityColor(severity: string) {
  if (severity === 'High') return 'text-red-400 bg-red-900/30 border border-red-700';
  if (severity === 'Medium') return 'text-yellow-400 bg-yellow-900/30 border border-yellow-700';
  return 'text-green-400 bg-green-900/30 border border-green-700';
}

export default function EmailPage() {
  const [emails, setEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const [subscribeStatus, setSubscribeStatus] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('investigatorEmails');
    if (saved) setEmails(JSON.parse(saved));
  }, []);

  function validateEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function handleAddEmail() {
    if (!newEmail.trim()) {
      setEmailError('Please enter an email address.');
      return;
    }
    if (!validateEmail(newEmail)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    if (emails.includes(newEmail)) {
      setEmailError('This email is already added.');
      return;
    }
    const updated = [...emails, newEmail];
    setEmails(updated);
    localStorage.setItem('investigatorEmails', JSON.stringify(updated));
    setNewEmail('');
    setEmailError('');
    setSubscribeStatus('Email added successfully!');
    setTimeout(() => setSubscribeStatus(''), 3000);
  }

  function handleRemoveEmail(email: string) {
    const updated = emails.filter(e => e !== email);
    setEmails(updated);
    localStorage.setItem('investigatorEmails', JSON.stringify(updated));
  }

  async function handleNotify(conflict: typeof dummyConflicts[0]) {
    if (emails.length === 0) {
      setStatuses(prev => ({ ...prev, [conflict.id]: 'No emails added ❌' }));
      return;
    }
    setStatuses(prev => ({ ...prev, [conflict.id]: 'Sending...' }));
    try {
      await Promise.all(emails.map(email =>
        sendConflictAlert(
          email,
          conflict.id,
          `Parties: ${conflict.parties}\nType: ${conflict.type}\nDate: ${conflict.date}\nSeverity: ${conflict.severity}`
        )
      ));
      setStatuses(prev => ({ ...prev, [conflict.id]: 'Notified ✅' }));
    } catch {
      setStatuses(prev => ({ ...prev, [conflict.id]: 'Failed ❌ Try Again' }));
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white">Email Notifications</h1>
          <p className="text-gray-400 text-sm mt-1">Manage investigator emails and test conflict alerts.</p>
        </div>

        {/* Email Input Section */}
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-1">Investigator Emails</h2>
          <p className="text-gray-400 text-sm mb-4">Add investigator emails below. These are saved in the browser and can be used for conflict alert notifications.</p>

          <div className="flex gap-3 mb-2">
            <input
              type="email"
              value={newEmail}
              onChange={e => { setNewEmail(e.target.value); setEmailError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleAddEmail()}
              placeholder="Enter investigator email"
              className="flex-1 bg-slate-800 border border-slate-600 text-gray-100 placeholder:text-gray-500 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <button
              onClick={handleAddEmail}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition"
            >
              Add Email
            </button>
          </div>

          {emailError && <p className="text-red-400 text-xs mt-1">{emailError}</p>}
          {subscribeStatus && <p className="text-green-400 text-xs mt-1">{subscribeStatus}</p>}

          <div className="mt-4 flex flex-col gap-2">
            {emails.length === 0 ? (
              <p className="text-gray-500 text-sm">No emails added yet.</p>
            ) : (
              emails.map(email => (
                <div key={email} className="flex items-center justify-between bg-slate-800 border border-slate-700 rounded-lg px-4 py-2">
                  <span className="text-gray-300 text-sm">{email}</span>
                  <button
                    onClick={() => handleRemoveEmail(email)}
                    className="text-red-400 hover:text-red-300 text-xs transition"
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Conflict Table */}
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Sample Conflict Alerts</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-gray-400 text-left">
                  <th className="pb-3 pr-4">Conflict ID</th>
                  <th className="pb-3 pr-4">Parties</th>
                  <th className="pb-3 pr-4">Type</th>
                  <th className="pb-3 pr-4">Date</th>
                  <th className="pb-3 pr-4">Severity</th>
                  <th className="pb-3 pr-4">Action</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {dummyConflicts.map(conflict => (
                  <tr key={conflict.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition">
                    <td className="py-3 pr-4 text-gray-300">{conflict.id}</td>
                    <td className="py-3 pr-4 text-gray-300">{conflict.parties}</td>
                    <td className="py-3 pr-4 text-gray-300">{conflict.type}</td>
                    <td className="py-3 pr-4 text-gray-300">{conflict.date}</td>
                    <td className="py-3 pr-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${severityColor(conflict.severity)}`}>
                        {conflict.severity}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <button
                        onClick={() => handleNotify(conflict)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition"
                      >
                        Notify Investigator
                      </button>
                    </td>
                    <td className="py-3 text-gray-400 text-xs">
                      {statuses[conflict.id] || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}