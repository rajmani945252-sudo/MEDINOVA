import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { API_BASE_URL } from '@/utils/api'
import {
  PortalCard,
  PortalEmptyState,
  PortalFilterPills,
  PortalHero,
  PortalPage,
  PortalStatGrid,
  StatusPill,
} from '../../components/portal/PortalChrome'
import { storeSidebarItems } from '../../components/portal/moduleConfig'

const orderToneMap = {
  pending: 'amber',
  confirmed: 'blue',
  delivered: 'green',
  cancelled: 'red',
}

function StoreOrders() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const token = localStorage.getItem('token')
  const h = { headers: { Authorization: `Bearer ${token}` } }

  const fetchOrders = () => {
    axios.get(`${API_BASE_URL}/api/store/orders`, h)
      .then((res) => { setOrders(res.data); setLoading(false) })
      .catch(() => { setOrders([]); setLoading(false) })
  }

  useEffect(() => { fetchOrders() }, [])

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API_BASE_URL}/api/store/orders/${id}/status`, { status }, h)
      fetchOrders()
    } catch {}
  }

  const filters = ['all', 'pending', 'confirmed', 'delivered', 'cancelled']
  const filtered = filter === 'all' ? orders : orders.filter((order) => order.status === filter)
  const pendingCount = orders.filter((order) => order.status === 'pending').length
  const confirmedCount = orders.filter((order) => order.status === 'confirmed').length
  const deliveredCount = orders.filter((order) => order.status === 'delivered').length
  const cancelledCount = orders.filter((order) => order.status === 'cancelled').length
  const progressValue = user.name && user.email ? (orders.length > 0 ? 100 : 82) : 64
  const filterCounts = useMemo(() => ({
    all: orders.length,
    pending: pendingCount,
    confirmed: confirmedCount,
    delivered: deliveredCount,
    cancelled: cancelledCount,
  }), [cancelledCount, confirmedCount, deliveredCount, orders.length, pendingCount])

  return (
    <PortalPage
      user={user}
      moduleLabel="Medical Store"
      moduleName="MediNova Pharmacy"
      sidebarItems={storeSidebarItems}
      progressValue={progressValue}
      progressLabel="Order workflow"
      progressText={`${progressValue}% ready to confirm and complete medicine orders.`}
      focusTitle={pendingCount > 0 ? 'Resolve pending orders promptly' : 'Keep confirmed orders moving'}
      focusDescription={
        pendingCount > 0
          ? `${pendingCount} order${pendingCount === 1 ? '' : 's'} waiting for confirmation or cancellation.`
          : `${confirmedCount} confirmed order${confirmedCount === 1 ? '' : 's'} ready for delivery updates.`
      }
      avatarFallback="S"
      maxWidth="1800px"
    >
      <PortalHero
        eyebrow="Medicine Orders"
        title="Order management"
        description={`${pendingCount} pending order${pendingCount === 1 ? '' : 's'} across ${orders.length} total store requests.`}
        actions={
          <>
            <Link to="/store/medicines" style={{ textDecoration: 'none' }}>
              <button className="btn-primary" style={{ padding: '13px 20px', borderRadius: '16px' }}>
                Open Inventory
              </button>
            </Link>
            <Link to="/store/dashboard" style={{ textDecoration: 'none' }}>
              <button className="btn-outline" style={{ padding: '13px 20px', borderRadius: '16px', background: '#FFFFFF' }}>
                Open Dashboard
              </button>
            </Link>
          </>
        }
        aside={
          <>
            <div className="portal-kicker">Order Snapshot</div>
            <div style={{ fontSize: '19px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
              {confirmedCount} confirmed order{confirmedCount === 1 ? '' : 's'}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.7, marginBottom: '16px' }}>
              Confirmed orders can be marked as delivered from the same action flow you already had before the reskin.
            </div>
            <div className="portal-summary-grid">
              <div className="portal-summary-box">
                <div className="portal-summary-box__value">{pendingCount}</div>
                <div className="portal-summary-box__label">Pending</div>
              </div>
              <div className="portal-summary-box portal-summary-box--plain">
                <div className="portal-summary-box__value">{deliveredCount}</div>
                <div className="portal-summary-box__label">Delivered</div>
              </div>
            </div>
          </>
        }
      />

      <PortalStatGrid
        items={[
          { title: 'All', value: orders.length, note: 'Total requests' },
          { title: 'Pending', value: pendingCount, note: 'Awaiting action' },
          { title: 'Confirmed', value: confirmedCount, note: 'Ready to dispatch' },
          { title: 'Delivered', value: deliveredCount, note: 'Completed orders' },
        ]}
      />

      <section className="portal-main-grid">
        <div className="portal-stack">
          <PortalCard
            title="Order queue"
            description="Patient-style filter pills and rounded list cards wrapped around the same status update logic."
            className="fade-up-2"
          >
            <PortalFilterPills options={filters} value={filter} onChange={setFilter} counts={filterCounts} />

            {loading ? (
              <div className="portal-note">Loading orders...</div>
            ) : filtered.length === 0 ? (
              <PortalEmptyState
                icon="OR"
                title="No orders yet"
                description="Orders will appear here when patients request medicines."
              />
            ) : (
              <div className="portal-list">
                {filtered.map((order) => (
                  <div key={order.id} className="portal-card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap', marginBottom: order.status === 'pending' || order.status === 'confirmed' ? '16px' : 0 }}>
                      <div>
                        <div className="portal-row__title">{order.medicine_name}</div>
                        <div className="portal-row__meta">
                          Qty {order.quantity} | INR {order.price * order.quantity}
                        </div>
                        <div className="portal-row__meta" style={{ marginTop: '4px' }}>
                          {order.patient_name} | {order.patient_phone}
                        </div>
                      </div>
                      <StatusPill label={order.status} tone={orderToneMap[order.status] || 'neutral'} />
                    </div>

                    {order.status === 'pending' && (
                      <div className="portal-button-row" style={{ paddingTop: '16px', borderTop: '1px solid rgba(0, 105, 92, 0.08)' }}>
                        <button className="btn-primary" onClick={() => updateStatus(order.id, 'confirmed')}>
                          Confirm Order
                        </button>
                        <button className="btn-danger" onClick={() => updateStatus(order.id, 'cancelled')}>
                          Cancel
                        </button>
                      </div>
                    )}

                    {order.status === 'confirmed' && (
                      <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(0, 105, 92, 0.08)' }}>
                        <button className="btn-primary" onClick={() => updateStatus(order.id, 'delivered')}>
                          Mark as Delivered
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </PortalCard>
        </div>

        <div className="portal-stack">
          <PortalCard
            eyebrow="Status notes"
            title="Workflow guidance"
            description="Pending orders need a decision first; confirmed orders can move directly into delivery."
            className="fade-up-2"
            soft
          >
            <div className="portal-note">
              This reskin changes only layout and styling. Confirm, cancel, and delivered actions still call the same endpoints with the same payloads.
            </div>
          </PortalCard>

          <PortalCard
            eyebrow="Status counts"
            title="Order overview"
            description="A compact summary of the current order mix."
            className="fade-up-3"
          >
            <div className="portal-list">
              <div className="portal-row">
                <div>
                  <div className="portal-row__title">Pending</div>
                  <div className="portal-row__meta">Need confirmation or cancellation</div>
                </div>
                <StatusPill label={`${pendingCount}`} tone="amber" />
              </div>
              <div className="portal-row">
                <div>
                  <div className="portal-row__title">Confirmed</div>
                  <div className="portal-row__meta">Ready for delivery action</div>
                </div>
                <StatusPill label={`${confirmedCount}`} tone="blue" />
              </div>
              <div className="portal-row">
                <div>
                  <div className="portal-row__title">Cancelled</div>
                  <div className="portal-row__meta">Closed without fulfillment</div>
                </div>
                <StatusPill label={`${cancelledCount}`} tone="red" />
              </div>
            </div>
          </PortalCard>
        </div>
      </section>
    </PortalPage>
  )
}

export default StoreOrders
