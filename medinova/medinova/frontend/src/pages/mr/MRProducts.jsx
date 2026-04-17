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
} from '../../components/portal/PortalChrome'
import { mrSidebarItems } from '../../components/portal/moduleConfig'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

function MRProducts() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const [products, setProducts] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', category: '', description: '', dosage: '', price: '' })
  const [msg, setMsg] = useState('')
  const [msgKind, setMsgKind] = useState('success')
  const token = localStorage.getItem('token')
  const h = { headers: { Authorization: `Bearer ${token}` } }

  const fetchProducts = () => {
    axios.get(`${API_BASE_URL}/api/mr/products`, h)
      .then((res) => setProducts(Array.isArray(res.data) ? res.data : []))
      .catch(() => setProducts([]))
  }

  useEffect(() => { fetchProducts() }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      await axios.post(`${API_BASE_URL}/api/mr/products`, form, h)
      setMsg('Product added!')
      setMsgKind('success')
      setShowForm(false)
      setForm({ name: '', category: '', description: '', dosage: '', price: '' })
      fetchProducts()
      setTimeout(() => setMsg(''), 3000)
    } catch {
      setMsg('Unable to add the product right now.')
      setMsgKind('error')
      setTimeout(() => setMsg(''), 3000)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return
    try {
      await axios.delete(`${API_BASE_URL}/api/mr/products/${id}`, h)
      fetchProducts()
    } catch {
      setMsg('Unable to delete the product right now.')
      setMsgKind('error')
      setTimeout(() => setMsg(''), 3000)
    }
  }

  const categories = ['Antibiotic', 'Painkiller', 'Vitamin', 'Cardiac', 'Diabetes', 'Skin', 'Eye', 'Neuro', 'Other']
  const categoryCount = useMemo(() => new Set(products.map((product) => product.category).filter(Boolean)).size, [products])
  const pricedCount = useMemo(() => products.filter((product) => product.price).length, [products])
  const describedCount = useMemo(() => products.filter((product) => product.description || product.dosage).length, [products])
  const progressValue = user.name && user.email ? (products.length > 0 ? 100 : 84) : 64

  return (
    <PortalPage
      user={user}
      moduleLabel="MR Portal"
      moduleName="MediNova Connect"
      sidebarItems={mrSidebarItems}
      progressValue={progressValue}
      progressLabel="Portfolio readiness"
      progressText={`${progressValue}% ready for doctor-facing product discussions.`}
      focusTitle={showForm ? 'Finish the product entry' : 'Keep portfolio details current'}
      focusDescription={
        showForm
          ? 'Complete the product form so the medicine can be included in future doctor meetings.'
          : 'Accurate dosage, pricing, and descriptions make each doctor conversation easier to prepare.'
      }
      avatarFallback="M"
      maxWidth="1800px"
    >
      <PortalHero
        eyebrow="Product Portfolio"
        title="My products"
        description={`${products.length} product${products.length === 1 ? '' : 's'} in your medical representative portfolio.`}
        actions={
          <>
            <button
              type="button"
              className="btn-primary"
              style={{ padding: '13px 20px', borderRadius: '16px' }}
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? 'Close Form' : 'Add Product'}
            </button>
            <Link to="/mr/dashboard" style={{ textDecoration: 'none' }}>
              <button className="btn-outline" style={{ padding: '13px 20px', borderRadius: '16px', background: '#FFFFFF' }}>
                Open Dashboard
              </button>
            </Link>
          </>
        }
        aside={
          <>
            <div className="portal-kicker">Portfolio Summary</div>
            <div style={{ fontSize: '19px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
              {categoryCount} active categor{categoryCount === 1 ? 'y' : 'ies'}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.7, marginBottom: '16px' }}>
              Keep pricing, dosage, and short descriptions consistent so products stay ready for meetings.
            </div>
            <div className="portal-summary-grid">
              <div className="portal-summary-box">
                <div className="portal-summary-box__value">{products.length}</div>
                <div className="portal-summary-box__label">Products</div>
              </div>
              <div className="portal-summary-box portal-summary-box--plain">
                <div className="portal-summary-box__value">{pricedCount}</div>
                <div className="portal-summary-box__label">With price</div>
              </div>
            </div>
          </>
        }
      />

      <PortalStatGrid
        items={[
          { title: 'Products', value: products.length, note: 'Portfolio entries' },
          { title: 'Categories', value: categoryCount, note: 'Distinct lines' },
          { title: 'Priced', value: pricedCount, note: 'Ready for quoting' },
          { title: 'Detailed', value: describedCount, note: 'Have notes or dosage' },
        ]}
      />

      {msg && <PortalMessage kind={msgKind}>{msg}</PortalMessage>}

      <section className="portal-main-grid">
        <div className="portal-stack">
          {showForm ? (
            <PortalCard
              title="Add New Product"
              description="Use the same patient-style form treatment while preserving the existing product submission flow."
              className="fade-up-2"
            >
              <form onSubmit={handleSubmit}>
                <div className="portal-form-grid" style={{ marginBottom: '18px' }}>
                  <PortalField label="Product Name">
                    <input
                      className="input"
                      placeholder="e.g. Azithromycin 500mg"
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

                  <PortalField label="Dosage">
                    <input
                      className="input"
                      placeholder="e.g. 500mg twice daily"
                      value={form.dosage}
                      onChange={(event) => setForm({ ...form, dosage: event.target.value })}
                      style={{ height: '52px', borderRadius: '16px' }}
                    />
                  </PortalField>

                  <PortalField label="Price (INR)">
                    <input
                      className="input"
                      type="number"
                      placeholder="e.g. 120"
                      value={form.price}
                      onChange={(event) => setForm({ ...form, price: event.target.value })}
                      style={{ height: '52px', borderRadius: '16px' }}
                    />
                  </PortalField>

                  <PortalField label="Description" fullWidth>
                    <textarea
                      className="input"
                      rows={4}
                      placeholder="Product details, indications, benefits..."
                      value={form.description}
                      onChange={(event) => setForm({ ...form, description: event.target.value })}
                      style={{ borderRadius: '16px', resize: 'vertical' }}
                    />
                  </PortalField>
                </div>

                <div className="portal-button-row">
                  <button className="btn-primary" type="submit" style={{ padding: '14px 28px', borderRadius: '16px' }}>
                    Add Product
                  </button>
                  <button
                    type="button"
                    className="btn-outline"
                    style={{ padding: '14px 24px', borderRadius: '16px' }}
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </PortalCard>
          ) : (
            <PortalCard
              eyebrow="Portfolio note"
              title="Ready to add another medicine?"
              description="New product entries appear immediately in the same portfolio list after submission."
              className="fade-up-2"
              soft
            >
              <div className="portal-note" style={{ marginBottom: '16px' }}>
                Use clear product names and short descriptions so the portfolio stays easy to scan during meetings.
              </div>
              <button
                type="button"
                className="btn-primary"
                style={{ padding: '13px 20px', borderRadius: '16px' }}
                onClick={() => setShowForm(true)}
              >
                Add Product
              </button>
            </PortalCard>
          )}

          <PortalCard
            title="Portfolio catalogue"
            description="Every existing product keeps the same delete behavior, now wrapped in the patient module card styling."
            className="fade-up-3"
          >
            {products.length === 0 ? (
              <PortalEmptyState
                icon="PP"
                title="No products yet"
                description="Add your medicine portfolio to start sharing product details with doctors."
                action={
                  <button className="btn-primary" style={{ borderRadius: '14px' }} onClick={() => setShowForm(true)}>
                    Add Product
                  </button>
                }
              />
            ) : (
              <div className="portal-record-grid">
                {products.map((product) => (
                  <div key={product.id} className="portal-record-card">
                    <div className="portal-record-card__icon">PP</div>
                    <div className="portal-record-card__title">{product.name}</div>
                    <div className="portal-record-card__meta">{product.category}</div>
                    {product.dosage && <div className="portal-record-card__copy">Dosage: {product.dosage}</div>}
                    {product.description && <div className="portal-record-card__copy" style={{ marginTop: '10px' }}>{product.description}</div>}

                    <div className="portal-record-card__footer">
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Price</div>
                        <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-primary)' }}>
                          {product.price ? `INR ${product.price}` : '-'}
                        </div>
                      </div>

                      <button className="btn-danger" style={{ minWidth: '110px' }} onClick={() => handleDelete(product.id)}>
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
            eyebrow="Summary"
            title="Category snapshot"
            description="A quick view of the categories already represented in your current medicine lineup."
            className="fade-up-2"
          >
            {categoryCount > 0 ? (
              <div className="portal-list">
                {[...new Set(products.map((product) => product.category).filter(Boolean))].slice(0, 6).map((category) => (
                  <div key={category} className="portal-row">
                    <div>
                      <div className="portal-row__title">{category}</div>
                      <div className="portal-row__meta">
                        {products.filter((product) => product.category === category).length} product{products.filter((product) => product.category === category).length === 1 ? '' : 's'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <PortalEmptyState
                icon="CT"
                title="No categories yet"
                description="Categories will populate here as soon as you add the first medicine."
              />
            )}
          </PortalCard>

          <PortalCard
            eyebrow="Guidance"
            title="Portfolio quality"
            description="Styling is aligned with the patient profile cards, while your existing form and delete actions stay unchanged."
            className="fade-up-3"
            soft
          >
            <div className="portal-note">
              Products with dosage details and pricing are easier to use during doctor meetings. Fill those fields when possible.
            </div>
          </PortalCard>
        </div>
      </section>
    </PortalPage>
  )
}

export default MRProducts
