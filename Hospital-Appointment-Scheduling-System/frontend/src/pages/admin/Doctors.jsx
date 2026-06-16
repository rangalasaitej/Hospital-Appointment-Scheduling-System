import { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import API from '../../services/api';
import { Edit2, Search } from 'lucide-react';

export default function Doctors() {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState(false);
    const [selected, setSelected] = useState(null);
    const [form, setForm] = useState({ specialization: '', certifications: '', max_patients_per_day: 5 });

    const fetch = () => {
        setLoading(true);
        API.get('/doctors').then(r => setList(r.data)).finally(() => setLoading(false));
    };
    useEffect(() => { fetch(); }, []);

    const openEdit = (d) => {
        setSelected(d);
        setForm({ specialization: d.specialization || '', certifications: (d.certifications || []).join(', '), max_patients_per_day: d.max_patients_per_day || 5 });
        setModal(true);
    };

    const handleSave = async () => {
        await API.put(`/doctors/${selected.id}`, {
            ...form, certifications: form.certifications.split(',').map(s => s.trim()).filter(Boolean)
        });
        setModal(false); fetch();
    };

    const filtered = list.filter(d =>
        d.name?.toLowerCase().includes(search.toLowerCase()) ||
        d.specialization?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Layout title="Doctors" subtitle="Manage hospital doctors">
            <div className="page-header">
                <div><h2>Doctors</h2><p>{list.length} registered doctors</p></div>
            </div>
            <div className="card">
                <div className="card-header">
                    <div style={{ position: 'relative', maxWidth: 320 }}>
                        <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                        <input className="form-input" placeholder="Search doctors..." style={{ paddingLeft: '2.25rem' }}
                            value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '2rem', color: 'var(--text-muted)' }}><span className="spinner" /> Loading...</div>
                ) : filtered.length === 0 ? (
                    <div className="empty-state"><div className="empty-state-icon">👨‍⚕️</div><h3>No doctors found</h3><p>Doctors registered via Register page appear here</p></div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead><tr><th>Name</th><th>Email</th><th>Specialization</th><th>Certifications</th><th>Max Patients/Day</th><th>Avail. Slots</th><th>Actions</th></tr></thead>
                            <tbody>
                                {filtered.map(d => (
                                    <tr key={d.id}>
                                        <td style={{ fontWeight: 600 }}>{d.name}</td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{d.email}</td>
                                        <td>{d.specialization || '—'}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                                                {(d.certifications || []).slice(0, 2).map(c => (
                                                    <span key={c} className="badge badge-info" style={{ fontSize: '0.65rem' }}>{c}</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td>{d.max_patients_per_day}</td>
                                        <td>{(d.availability || []).length}</td>
                                        <td>
                                            <button className="btn btn-secondary btn-sm" onClick={() => openEdit(d)}><Edit2 size={13} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {modal && (
                <div className="modal-overlay" onClick={() => setModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Edit Doctor — {selected?.name}</h2>
                            <button className="modal-close" onClick={() => setModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Specialization</label>
                                <input className="form-input" value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })} placeholder="e.g. Cardiology" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Certifications (comma-separated)</label>
                                <input className="form-input" value={form.certifications} onChange={e => setForm({ ...form, certifications: e.target.value })} placeholder="MD - Cardiology, Fellowship - American Heart Association" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Max Patients per Day</label>
                                <input className="form-input" type="number" min="1" max="20" value={form.max_patients_per_day} onChange={e => setForm({ ...form, max_patients_per_day: +e.target.value })} />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSave}>Save</button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}
