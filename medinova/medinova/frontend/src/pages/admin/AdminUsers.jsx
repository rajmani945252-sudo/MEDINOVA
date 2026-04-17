import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import {
  PortalCard,
  PortalEmptyState,
  PortalFilterPills,
  PortalHero,
  PortalPage,
  PortalStatGrid,
  StatusPill,
} from '../../components/portal/PortalChrome'
import { adminSidebarItems } from '../../components/portal/moduleConfig'

const roleToneMap = {
  patient: 'teal',
  doctor: 'blue',
  admin: 'red',
  store: 'green',
  mr: 'purple',
}

function AdminUsers() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const token = localStorage.getItem('token')
  const h = { headers: { Authorization: `Bearer ${token}` } }

  const fetchUsers = () => {
    axios.get('http://localhost:5000/api/admin/users', h)
      .then((res) => { setUsers(res.data); setLoading(false) })
      .catch(() => { setUsers([]); setLoading(false) })
  }

  useEffect(() => { fetchUsers() }, [])

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user ${name}? This cannot be undone.`)) return
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${id}`, h)
      fetchUsers()
    } catch {}
  }

  const handleVerify = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/users/${id}/verify`, {}, h)
      fetchUsers()
    } catch {}
  }

  const roles = ['all', 'patient', 'doctor', 'store', 'mr', 'admin']
  const filtered = users
    .filter((entry) => filter === 'all' || entry.role === filter)
    .filter((entry) =>
      entry.name.toLowerCase().includes(search.toLowerCase()) ||
      entry.email.toLowerCase().includes(search.toLowerCase()),
    )

  const verifiedCount = users.filter((entry) => entry.is_verified).length
  const doctorCount = users.filter((entry) => entry.role === 'doctor').length
  const patientCount = users.filter((entry) => entry.role === 'patient').length
  const storeCount = users.filter((entry) => entry.role === 'store').length
  const filterCounts = useMemo(() => ({
    all: users.length,
    patient: patientCount,
    doctor: doctorCount,
    store: storeCount,
    mr: users.filter((entry) => entry.role === 'mr').length,
    admin: users.filter((entry) => entry.role === 'admin').length,
  }), [doctorCount, patientCount, storeCount, users])

  return (
    <PortalPage
      user={user}
      moduleLabel="Admin Panel"
      moduleName="MediNova Control"
      sidebarItems={adminSidebarItems}
      progressValue={100}
      progressLabel="User governance"
      progressText="100% ready to review, verify, and remove platform users."
      focusTitle={loading ? 'Loading user directory' : 'Review verification queue'}
      focusDescription={
        loading
          ? 'The existing admin user endpoint is loading into the new patient-style interface.'
          : `${users.length - verifiedCount} account${users.length - verifiedCount === 1 ? '' : 's'} currently unverified.`
      }
      avatarFallback="A"
      maxWidth="1800px"
    >
      <PortalHero
        eyebrow="User Management"
        title="Manage users"
        description={`${users.length} total user${users.length === 1 ? '' : 's'} across all Medinova roles.`}
        actions={
          <>
            <Link to="/admin/dashboard" style={{ textDecoration: 'none' }}>
              <button className="btn-primary" style={{ padding: '13px 20px', borderRadius: '16px' }}>
                Open Dashboard
              </button>
            </Link>
            <Link to="/admin/appointments" style={{ textDecoration: 'none' }}>
              <button className="btn-outline" style={{ padding: '13px 20px', borderRadius: '16px', background: '#FFFFFF' }}>
                Review Appointments
              </button>
            </Link>
          </>
        }
        aside={
          <>
            <div className="portal-kicker">User Snapshot</div>
            <div style={{ fontSize: '19px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
              {verifiedCount} verified account{verifiedCount === 1 ? '' : 's'}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.7, marginBottom: '16px' }}>
              Search, filter, verify, and delete users from the same logic you already had before the reskin.
            </div>
            <div className="portal-summary-grid">
              <div className="portal-summary-box">
                <div className="portal-summary-box__value">{patientCount}</div>
                <div className="portal-summary-box__label">Patients</div>
              </div>
              <div className="portal-summary-box portal-summary-box--plain">
                <div className="portal-summary-box__value">{doctorCount}</div>
                <div className="portal-summary-box__label">Doctors</div>
              </div>
            </div>
          </>
        }
      />

      <PortalStatGrid
        items={[
          { title: 'Users', value: users.length, note: 'All accounts' },
          { title: 'Verified', value: verifiedCount, note: 'Approved accounts' },
          { title: 'Patients', value: patientCount, note: 'Patient role users' },
          { title: 'Stores', value: storeCount, note: 'Store role users' },
        ]}
      />

      <section className="portal-main-grid">
        <div className="portal-stack">
          <PortalCard
            title="User directory"
            description="Patient-style search, role filters, and list rows wrapped around the current admin user logic."
            className="fade-up-2"
          >
            <div style={{ marginBottom: '18px' }}>
              <input
                className="input"
                placeholder="Search by name or email..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                style={{ height: '52px', borderRadius: '16px' }}
              />
            </div>

            <PortalFilterPills options={roles} value={filter} onChange={setFilter} counts={filterCounts} />

            {loading ? (
              <div className="portal-note">Loading users...</div>
            ) : filtered.length === 0 ? (
              <PortalEmptyState
                icon="US"
                title="No users found"
                description="No users matched the current role filter and search terms."
              />
            ) : (
              <div className="portal-list">
                {filtered.map((entry) => (
                  <div key={entry.id} className="portal-card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div className="portal-record-card__icon" style={{ width: '44px', height: '44px', marginBottom: 0 }}>
                          {entry.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="portal-row__title" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            {entry.name}
                            <StatusPill label={entry.is_verified ? 'Verified' : 'Unverified'} tone={entry.is_verified ? 'green' : 'amber'} />
                          </div>
                          <div className="portal-row__meta">
                            {entry.email} {entry.phone ? `| ${entry.phone}` : ''}
                          </div>
                          <div className="portal-row__meta" style={{ marginTop: '4px' }}>
                            Joined: {new Date(entry.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <StatusPill label={entry.role} tone={roleToneMap[entry.role] || 'neutral'} />
                        {!entry.is_verified && (
                          <button className="btn-outline" style={{ padding: '8px 16px' }} onClick={() => handleVerify(entry.id)}>
                            Verify
                          </button>
                        )}
                        {entry.role !== 'admin' && (
                          <button className="btn-danger" style={{ padding: '8px 16px' }} onClick={() => handleDelete(entry.id, entry.name)}>
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </PortalCard>
        </div>

        <div className="portal-stack">
          <PortalCard
            eyebrow="Role mix"
            title="Current role counts"
            description="A compact view of how user roles are distributed across the system."
            className="fade-up-2"
          >
            <div className="portal-list">
              <div className="portal-row">
                <div>
                  <div className="portal-row__title">Patients</div>
                  <div className="portal-row__meta">Patient accounts</div>
                </div>
                <StatusPill label={`${patientCount}`} tone="teal" />
              </div>
              <div className="portal-row">
                <div>
                  <div className="portal-row__title">Doctors</div>
                  <div className="portal-row__meta">Doctor profiles</div>
                </div>
                <StatusPill label={`${doctorCount}`} tone="blue" />
              </div>
              <div className="portal-row">
                <div>
                  <div className="portal-row__title">Stores</div>
                  <div className="portal-row__meta">Store users</div>
                </div>
                <StatusPill label={`${storeCount}`} tone="green" />
              </div>
            </div>
          </PortalCard>

          <PortalCard
            eyebrow="Governance note"
            title="Verification flow"
            description="Unverified accounts can still be reviewed and verified from the exact same handler as before."
            className="fade-up-3"
            soft
          >
            <div className="portal-note">
              Search input, role filtering, verify, and delete actions were preserved. Only layout, spacing, card treatment, and visual hierarchy changed.
            </div>
          </PortalCard>
        </div>
      </section>
    </PortalPage>
  )
}

export default AdminUsers
