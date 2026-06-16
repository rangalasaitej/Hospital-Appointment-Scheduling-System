import { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import API from '../../services/api';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';

export default function Patients() {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState(null); // null | 'edit' | 'add'
    const [selected, setSelected] = useState(null);
    const [form, setForm] = useState({ medical_condition: '', age: 0, priority: 5, required_appointments: 1, status: 'pending' });
    const [addForm, setAddForm] = useState({ name: '', email: '', password: '', medical_condition: '', age: 0, priority: 5, required_appointments: 1 });
    const [addError, setAddError] = useState('');
    const [addLoading, setAddLoading] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null); // patient to confirm-delete

    const fetchPatients = () => {
        setLoading(true);
        API.get('/patients').then(r => setPatients(r.data)).finally(() => setLoading(false));
    };

    useEffect(() => { fetchPatients(); }, []);

    const openEdit = (p) => {
        setSelected(p);
        setForm({ medical_condition: p.medical_condition || '', age: p.age, priority: p.priority, required_appointments: p.required_appointments, status: p.status });
        setModal('edit');
    };

    const openAdd = () => {
        setAddForm({ name: '', email: '', password: '', medical_condition: '', age: 0, priority: 5, required_appointments: 1 });
        setAddError('');
        setModal('add');
    };

    const handleAdd = async () => {
        const { name, email, password, medical_condition, age, priority, required_appointments } = addForm;
        if (!name || !email || !password) { setAddError('Name, email and password are required.'); return; }
        setAddLoading(true); setAddError('');
        try {
            // Step 1: Register user with role=patient (backend auto-creates patient profile)
            await API.post('/auth/register', { name, email, password, role: 'patient' });

            // Step 2: Get the newly created patient profile
            const profileRes = await API.get('/patients');
            const newPatient = profileRes.data.find(p => p.email === email);

            if (newPatient) {
                // Step 3: Update profile with medical details
                await API.put(`/patients/${newPatient.id}`, {
                    medical_condition, age: +age,
                    priority: +priority, required_appointments: +required_appointments, status: 'pending'
                });

                // Step 4: Auto-assign ALL existing appointment slots so patient is immediately schedulable
                const slotsRes = await API.get('/appointment-slots');
                const allSlotIds = slotsRes.data
                    .filter(s => !s.is_break)        // exclude break slots
                    .map(s => s.id);
                if (allSlotIds.length > 0) {
                    await API.put(`/patients/${newPatient.id}/availability`, { appointment_slot_ids: allSlotIds });
                }
            }
            setModal(null); fetchPatients();
        } catch (err) {
            setAddError(err.response?.data?.error || 'Failed to add patient.');
        } finally { setAddLoading(false); }
    };

    const handleSave = async () => {
        await API.put(`/patients/${selected.id}`, form);
        setModal(null); fetchPatients();
    };

    const handleDelete = (p) => {
        setDeleteTarget(p); // open confirmation modal
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            await API.delete(`/patients/${deleteTarget.id}`);
            fetchPatients();
        } catch (err) {
            console.error('Delete failed:', err);
        } finally {
            setDeleteTarget(null);
        }
    };

    const filtered = patients.filter(p =>
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.email?.toLowerCase().includes(search.toLowerCase()) ||
        p.medical_condition?.toLowerCase().includes(search.toLowerCase())
    );

    const statusBadge = (s) => {
        const map = { pending: 'badge-warning', scheduled: 'badge-success', completed: 'badge-info', cancelled: 'badge-danger' };
        return map[s] || 'badge-default';
    };

    return (
        <Layout title="Patients" subtitle="Manage hospital patients">
            <div className="page-header">
                <div><h2>Patients</h2><p>{patients.length} total patients</p></div>
                <button className="btn btn-primary" onClick={openAdd} id="add-patient-btn">
                    <Plus size={15} /> Add Patient
                </button>
            </div>

            <div className="card">
                <div className="card-header">
                    <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
                        <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                        <input className="form-input" placeholder="Search patients..."
                            style={{ paddingLeft: '2.25rem' }} value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '2rem', color: 'var(--text-muted)' }}>
                        <span className="spinner" /> Loading...
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">🏥</div>
                        <h3>No patients found</h3>
                        <p>Patients registered via the Register page will appear here</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th><th>Email</th><th>Medical Condition</th>
                                    <th>Age</th><th>Priority</th><th>Appointments</th><th>Status</th><th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(p => (
                                    <tr key={p.id}>
                                        <td style={{ fontWeight: 600 }}>{p.name}</td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{p.email}</td>
                                        <td>{p.medical_condition || '—'}</td>
                                        <td>{p.age}</td>
                                        <td>
                                            <span style={{ background: 'rgba(99,102,241,0.12)', color: 'var(--primary-light)', borderRadius: '99px', padding: '0.2rem 0.6rem', fontSize: '0.75rem', fontWeight: 700 }}>
                                                P{p.priority}
                                            </span>
                                        </td>
                                        <td>{p.required_appointments}</td>
                                        <td><span className={`badge ${statusBadge(p.status)}`}>{p.status}</span></td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                                                <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)} title="Edit"><Edit2 size={13} /></button>
                                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p)} title="Delete"><Trash2 size={13} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {modal === 'edit' && (
                <div className="modal-overlay" onClick={() => setModal(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Edit Patient — {selected?.name}</h2>
                            <button className="modal-close" onClick={() => setModal(null)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Medical Condition</label>
                                <input className="form-input" value={form.medical_condition} onChange={e => setForm({ ...form, medical_condition: e.target.value })} placeholder="e.g. Hypertension" />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Age</label>
                                    <input className="form-input" type="number" min="0" max="150" value={form.age} onChange={e => setForm({ ...form, age: +e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Priority (1=Highest)</label>
                                    <input className="form-input" type="number" min="1" max="10" value={form.priority} onChange={e => setForm({ ...form, priority: +e.target.value })} />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Required Appointments</label>
                                    <input className="form-input" type="number" min="1" max="5" value={form.required_appointments} onChange={e => setForm({ ...form, required_appointments: +e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Status</label>
                                    <select className="form-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                                        <option value="pending">Pending</option>
                                        <option value="scheduled">Scheduled</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSave}>Save</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Modal */}
            {modal === 'add' && (
                <div className="modal-overlay" onClick={() => setModal(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Add New Patient</h2>
                            <button className="modal-close" onClick={() => setModal(null)}>✕</button>
                        </div>
                        <div className="modal-body">
                            {addError && <div style={{ padding: '0.75rem', background: 'rgba(220,38,38,0.1)', color: '#dc2626', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.875rem' }}>{addError}</div>}
                            <div className="form-group">
                                <label className="form-label">Name</label>
                                <input className="form-input" value={addForm.name} onChange={e => setAddForm({ ...addForm, name: e.target.value })} placeholder="Full name" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input className="form-input" type="email" value={addForm.email} onChange={e => setAddForm({ ...addForm, email: e.target.value })} placeholder="patient@hospital.com" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Password</label>
                                <input className="form-input" type="password" value={addForm.password} onChange={e => setAddForm({ ...addForm, password: e.target.value })} placeholder="Strong password" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Medical Condition</label>
                                <input className="form-input" value={addForm.medical_condition} onChange={e => setAddForm({ ...addForm, medical_condition: e.target.value })} placeholder="e.g. Hypertension" />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Age</label>
                                    <input className="form-input" type="number" min="0" max="150" value={addForm.age} onChange={e => setAddForm({ ...addForm, age: +e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Priority (1=Highest)</label>
                                    <input className="form-input" type="number" min="1" max="10" value={addForm.priority} onChange={e => setAddForm({ ...addForm, priority: +e.target.value })} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Required Appointments</label>
                                <input className="form-input" type="number" min="1" max="5" value={addForm.required_appointments} onChange={e => setAddForm({ ...addForm, required_appointments: +e.target.value })} />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleAdd} disabled={addLoading}>{addLoading ? 'Adding...' : 'Add Patient'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteTarget && (
                <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Confirm Delete</h2>
                            <button className="modal-close" onClick={() => setDeleteTarget(null)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <p>Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This action cannot be undone.</p>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
                            <button className="btn btn-danger" onClick={confirmDelete}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}
