import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import {
  PortalCard,
  PortalEmptyState,
  PortalField,
  PortalHero,
  PortalMessage,
  PortalPage,
  PortalStatGrid,
  StatusPill,
} from '../../components/portal/PortalChrome'
import { storeSidebarItems } from '../../components/portal/moduleConfig'
import { demoMedicines } from '../../utils/demoData'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

function MedicineInventory() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const [medicines, setMedicines] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState({ name: '', category: '', price: '', stock: '', unit: 'tablets', description: '' })
  const [msg, setMsg] = useState('')
  const [msgKind, setMsgKind] = useState('success')
  const [usingDemoData, setUsingDemoData] = useState(false)
  const token = localStorage.getItem('token')
  const h = { headers: { Authorization: `Bearer ${token}` } }

  const fetchMedicines = () => {
    axios.get(`${API_BASE_URL}/api/store/medicines`, h)
      .then((res) => {
        const liveMedicines = Array.isArray(res.data) ? res.data : []
        if (liveMedicines.length > 0) {
          setMedicines(liveMedicines)
          setUsingDemoData(false)
        } else {
          setMedicines(demoMedicines)
          setUsingDemoData(true)
        }
        setLoading(false)
      })
      .catch(() => {
        setMedicines(demoMedicines)
        setUsingDemoData(true)
        setLoading(false)
      })
  }

  useEffect(() => { fetchMedicines() }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    const payload = { ...form, price: Number(form.price || 0), stock: Number(form.stock || 0) }

    if (usingDemoData) {
      const nextMedicine = editItem
        ? { ...editItem, ...payload }
        : { id: `demo-medicine-${Date.now()}`, ...payload }

      setMedicines((currentMedicines) => (
        editItem
          ? currentMedicines.map((medicine) => medicine.id === editItem.id ? nextMedicine : medicine)
          : [nextMedicine, ...currentMedicines]
      ))
      setMsg(editItem ? 'Demo medicine updated locally!' : 'Demo medicine added locally!')
      setMsgKind('info')
      setShowForm(false)
      setEditItem(null)
      setForm({ name: '', category: '', price: '', stock: '', unit: 'tablets', description: '' })
      setTimeout(() => setMsg(''), 3000)
      return
    }

    try {
      if (editItem) {
        await axios.put(`${API_BASE_URL}/api/store/medicines/${editItem.id}`, form, h)
        setMsg('Medicine updated!')
      } else {
        await axios.post(`${API_BASE_URL}/api/store/medicines`, form, h)
        setMsg('Medicine added!')
      }
      setMsgKind('success')

      setShowForm(false)
      setEditItem(null)
      setForm({ name: '', category: '', price: '', stock: '', unit: 'tablets', description: '' })
      fetchMedicines()
      setTimeout(() => setMsg(''), 3000)
    } catch {
      setMsg(editItem ? 'Unable to update the medicine right now.' : 'Unable to add the medicine right now.')
      setMsgKind('error')
      setTimeout(() => setMsg(''), 3000)
    }
  }

  const handleEdit = (medicine) => {
    setEditItem(medicine)
    setForm({
      name: medicine.name,
      category: medicine.category,
      price: medicine.price,
      stock: medicine.stock,
      unit: medicine.unit,
      description: medicine.description || '',
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this medicine?')) return

    if (usingDemoData) {
      setMedicines((currentMedicines) => currentMedicines.filter((medicine) => medicine.id !== id))
      setMsg('Demo medicine removed locally!')
      setMsgKind('info')
      setTimeout(() => setMsg(''), 3000)
      return
    }

    try {
      await axios.delete(`${API_BASE_URL}/api/store/medicines/${id}`, h)
      fetchMedicines()
    } catch {
      setMsg('Unable to delete the medicine right now.')
      setMsgKind('error')
      setTimeout(() => setMsg(''), 3000)
    }
  }

  const units = ['tablets', 'capsules', 'syrup', 'injection', 'cream', 'drops', 'sachet']
  const categories = ['Antibiotic', 'Painkiller', 'Vitamin', 'Antacid', 'Antihistamine', 'Diabetes', 'Heart', 'Skin', 'Eye', 'Other']
  const lowStock = medicines.filter((medicine) => medicine.stock < 10)
  const categoryCount = useMemo(() => new Set(medicines.map((medicine) => medicine.category).filter(Boolean)).size, [medicines])
  const totalUnits = useMemo(() => medicines.reduce((sum, medicine) => sum + Number(medicine.stock || 0), 0), [medicines])
  const progressValue = user.name && user.email ? (medicines.length > 0 ? 100 : 82) : 64

  return (
    <PortalPage
      user={user}
      moduleLabel="Medical Store"
      moduleName="MediNova Pharmacy"
      sidebarItems={storeSidebarItems}
      progressValue={progressValue}
      progressLabel="Inventory readiness"
      progressText={`${progressValue}% ready to manage medicines and stock updates.`}
      focusTitle={showForm ? 'Finish the medicine form' : 'Watch low stock closely'}
      focusDescription={
        showForm
          ? 'Saving the current form keeps the existing create and update logic exactly as before.'
          : `${lowStock.length} medicine${lowStock.length === 1 ? '' : 's'} currently flagged for low inventory.`
      }
      avatarFallback="S"
      maxWidth="1800px"
    >
      <PortalHero
        eyebrow="Medicine Inventory"
        title="Inventory management"
        description={`${medicines.length} medicine${medicines.length === 1 ? '' : 's'} currently tracked in the store inventory.`}
        actions={
          <>
            <button
              type="button"
              className="btn-primary"
              style={{ padding: '13px 20px', borderRadius: '16px' }}
              onClick={() => {
                setShowForm(!showForm)
                setEditItem(null)
                setForm({ name: '', category: '', price: '', stock: '', unit: 'tablets', description: '' })
              }}
            >
              {showForm ? 'Close Form' : 'Add Medicine'}
            </button>
            <Link to="/store/orders" style={{ textDecoration: 'none' }}>
              <button className="btn-outline" style={{ padding: '13px 20px', borderRadius: '16px', background: '#FFFFFF' }}>
                View Orders
              </button>
            </Link>
          </>
        }
        aside={
          <>
            <div className="portal-kicker">Inventory Snapshot</div>
            <div style={{ fontSize: '19px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
              {totalUnits} total units
            </div>
            <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.7, marginBottom: '16px' }}>
              Track medicine count, category spread, and restock pressure with the same patient dashboard visual system.
            </div>
            <div className="portal-summary-grid">
              <div className="portal-summary-box">
                <div className="portal-summary-box__value">{categoryCount}</div>
                <div className="portal-summary-box__label">Categories</div>
              </div>
              <div className="portal-summary-box portal-summary-box--plain">
                <div className="portal-summary-box__value">{lowStock.length}</div>
                <div className="portal-summary-box__label">Low stock</div>
              </div>
            </div>
          </>
        }
      />

      <PortalStatGrid
        items={[
          { title: 'Medicines', value: medicines.length, note: 'Current items' },
          { title: 'Low Stock', value: lowStock.length, note: 'Require attention' },
          { title: 'Categories', value: categoryCount, note: 'Active groups' },
          { title: 'Units', value: totalUnits, note: 'Stocked quantity' },
        ]}
      />

      {usingDemoData && (
        <PortalMessage kind="info">
          Demo medicines are visible because the live inventory is empty or unavailable. Add, edit, and delete actions stay local in this mode.
        </PortalMessage>
      )}

      {msg && <PortalMessage kind={msgKind}>{msg}</PortalMessage>}

      <section className="portal-main-grid">
        <div className="portal-stack">
          {showForm && (
            <PortalCard
              title={editItem ? 'Edit medicine' : 'Add new medicine'}
              description="This form keeps the original add and update flow while matching the patient profile form treatment."
              className="fade-up-2"
            >
              <form onSubmit={handleSubmit}>
                <div className="portal-form-grid" style={{ marginBottom: '18px' }}>
                  <PortalField label="Medicine Name">
                    <input
                      className="input"
                      placeholder="e.g. Paracetamol 500mg"
                      value={form.name}
                      onChange={(event) => setForm({ ...form, name: event.target.value })}
                      required
                      style={{ height: '52px', borderRadius: '16px' }}
                    />
                  </PortalField>

                  <PortalField label="Category">
                    <select
                      className="input"
                      value={form.category}
                      onChange={(event) => setForm({ ...form, category: event.target.value })}
                      required
                      style={{ height: '52px', borderRadius: '16px' }}
                    >
                      <option value="">Select category</option>
                      {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                    </select>
                  </PortalField>

                  <PortalField label="Price (INR)">
                    <input
                      className="input"
                      type="number"
                      placeholder="e.g. 50"
                      value={form.price}
                      onChange={(event) => setForm({ ...form, price: event.target.value })}
                      required
                      style={{ height: '52px', borderRadius: '16px' }}
                    />
                  </PortalField>

                  <PortalField label="Stock Quantity">
                    <input
                      className="input"
                      type="number"
                      placeholder="e.g. 100"
                      value={form.stock}
                      onChange={(event) => setForm({ ...form, stock: event.target.value })}
                      required
                      style={{ height: '52px', borderRadius: '16px' }}
                    />
                  </PortalField>

                  <PortalField label="Unit">
                    <select
                      className="input"
                      value={form.unit}
                      onChange={(event) => setForm({ ...form, unit: event.target.value })}
                      style={{ height: '52px', borderRadius: '16px' }}
                    >
                      {units.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
                    </select>
                  </PortalField>

                  <PortalField label="Description">
                    <input
                      className="input"
                      placeholder="Optional description"
                      value={form.description}
                      onChange={(event) => setForm({ ...form, description: event.target.value })}
                      style={{ height: '52px', borderRadius: '16px' }}
                    />
                  </PortalField>
                </div>

                <div className="portal-button-row">
                  <button className="btn-primary" type="submit" style={{ padding: '14px 28px', borderRadius: '16px' }}>
                    {editItem ? 'Update Medicine' : 'Add Medicine'}
                  </button>
                  <button
                    type="button"
                    className="btn-outline"
                    style={{ padding: '14px 24px', borderRadius: '16px' }}
                    onClick={() => {
                      setShowForm(false)
                      setEditItem(null)
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </PortalCard>
          )}

          <PortalCard
            title="Inventory catalogue"
            description="All stock cards keep the existing edit and delete functionality while adopting the patient module card language."
            className="fade-up-3"
          >
            {loading ? (
              <div className="portal-note">Loading medicines...</div>
            ) : medicines.length === 0 ? (
              <PortalEmptyState
                icon="MI"
                title="No medicines yet"
                description="Add your first medicine to start the inventory."
                action={
                  <button className="btn-primary" style={{ borderRadius: '14px' }} onClick={() => setShowForm(true)}>
                    Add Medicine
                  </button>
                }
              />
            ) : (
              <div className="portal-record-grid">
                {medicines.map((medicine) => (
                  <div key={medicine.id} className="portal-record-card">
                    <div className={`portal-record-card__icon${medicine.stock < 10 ? ' portal-record-card__icon--warning' : ''}`}>
                      MI
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div>
                        <div className="portal-record-card__title">{medicine.name}</div>
                        <div className="portal-record-card__meta">{medicine.category}</div>
                      </div>
                      {medicine.stock < 10 && <StatusPill label="Low stock" tone="amber" />}
                    </div>

                    {medicine.description && <div className="portal-record-card__copy">{medicine.description}</div>}

                    <div className="portal-record-card__footer">
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Price</div>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-primary)' }}>INR {medicine.price}</div>
                      </div>

                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textAlign: 'right' }}>Stock</div>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: medicine.stock < 10 ? '#C77800' : 'var(--color-text-primary)' }}>
                          {medicine.stock} <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--color-text-muted)' }}>{medicine.unit}</span>
                        </div>
                      </div>
                    </div>

                    <div className="portal-record-card__actions" style={{ marginTop: '14px' }}>
                      <button className="btn-outline" style={{ flex: 1 }} onClick={() => handleEdit(medicine)}>
                        Edit
                      </button>
                      <button className="btn-danger" style={{ flex: 1 }} onClick={() => handleDelete(medicine.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </PortalCard>
        </div>

        <div className="portal-stack">
          <PortalCard
            eyebrow="Restock watch"
            title="Low stock medicines"
            description="A compact list of medicines falling below the recommended stock threshold."
            className="fade-up-2"
          >
            {lowStock.length > 0 ? (
              <div className="portal-list">
                {lowStock.slice(0, 5).map((medicine) => (
                  <div key={medicine.id} className="portal-row">
                    <div>
                      <div className="portal-row__title">{medicine.name}</div>
                      <div className="portal-row__meta">{medicine.category}</div>
                    </div>
                    <StatusPill label={`${medicine.stock} ${medicine.unit}`} tone="amber" />
                  </div>
                ))}
              </div>
            ) : (
              <PortalEmptyState
                icon="OK"
                title="Stock levels look good"
                description="No current medicines are below the low stock threshold."
              />
            )}
          </PortalCard>

          <PortalCard
            eyebrow="Guidance"
            title="Inventory upkeep"
            description="Use the edit action for existing medicines and the add action for new stock without changing any underlying behavior."
            className="fade-up-3"
            soft
          >
            <div className="portal-note">
              The UI now mirrors the patient dashboard and profile aesthetic, but the create, update, and delete logic remains unchanged.
            </div>
          </PortalCard>
        </div>
      </section>
    </PortalPage>
  )
}

export default MedicineInventory
