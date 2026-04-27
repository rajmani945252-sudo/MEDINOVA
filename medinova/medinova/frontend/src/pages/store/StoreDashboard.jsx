import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { API_BASE_URL } from '@/utils/api'
import {
  PortalActionTile,
  PortalCard,
  PortalEmptyState,
  PortalHero,
  PortalMessage,
  PortalPage,
  PortalStatGrid,
  StatusPill,
} from '../../components/portal/PortalChrome'
import { storeSidebarItems } from '../../components/portal/moduleConfig'
import { demoMedicines } from '../../utils/demoData'

const orderToneMap = {
  pending: 'amber',
  confirmed: 'blue',
  delivered: 'green',
  cancelled: 'red',
}

function StoreDashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const token = localStorage.getItem('token')

  const [medicines, setMedicines] = useState([])
  const [orders, setOrders] = useState([])
  const [usingDemoMedicines, setUsingDemoMedicines] = useState(false)

  useEffect(() => {
    const h = { headers: { Authorization: `Bearer ${token}` } }

    Promise.allSettled([
      axios.get(`${API_BASE_URL}/api/store/medicines`, h),
      axios.get(`${API_BASE_URL}/api/store/orders`, h),
    ]).then(([medicinesResult, ordersResult]) => {
      if (medicinesResult.status === 'fulfilled') {
        const liveMedicines = Array.isArray(medicinesResult.value.data) ? medicinesResult.value.data : []
        if (liveMedicines.length > 0) {
          setMedicines(liveMedicines)
          setUsingDemoMedicines(false)
        } else {
          setMedicines(demoMedicines)
          setUsingDemoMedicines(true)
        }
      } else {
        setMedicines(demoMedicines)
        setUsingDemoMedicines(true)
      }

      if (ordersResult.status === 'fulfilled') {
        setOrders(Array.isArray(ordersResult.value.data) ? ordersResult.value.data : [])
      } else {
        setOrders([])
      }
    })
  }, [token])

  const lowStock = medicines.filter((medicine) => medicine.stock < 10)
  const pending = orders.filter((order) => order.status === 'pending')
  const totalValue = medicines.reduce((sum, medicine) => sum + (medicine.price * medicine.stock), 0)
  const categories = useMemo(() => new Set(medicines.map((medicine) => medicine.category).filter(Boolean)).size, [medicines])
  const progressValue = user.name && user.email ? (medicines.length > 0 || orders.length > 0 ? 100 : 82) : 64

  return (
    <PortalPage
      user={user}
      moduleLabel="Medical Store"
      moduleName="MediNova Pharmacy"
      sidebarItems={storeSidebarItems}
      progressValue={progressValue}
      progressLabel="Store readiness"
      progressText={`${progressValue}% ready for inventory and order operations.`}
      focusTitle={lowStock.length > 0 ? 'Restock low inventory soon' : 'Keep order flow moving'}
      focusDescription={
        lowStock.length > 0
          ? `${lowStock.length} medicine${lowStock.length === 1 ? '' : 's'} currently flagged as low stock.`
          : `${pending.length} pending order${pending.length === 1 ? '' : 's'} waiting for store action.`
      }
      avatarFallback="S"
      maxWidth="1800px"
    >
      <PortalHero
        eyebrow="Medical Store"
        title={user.name || 'Store dashboard'}
        description="Manage medicines, review order flow, and keep pharmacy operations aligned with the same patient dashboard styling."
        actions={
          <>
            <Link to="/store/medicines" style={{ textDecoration: 'none' }}>
              <button className="btn-primary" style={{ padding: '13px 20px', borderRadius: '16px' }}>
                Open Inventory
              </button>
            </Link>
            <Link to="/store/orders" style={{ textDecoration: 'none' }}>
              <button className="btn-outline" style={{ padding: '13px 20px', borderRadius: '16px', background: '#FFFFFF' }}>
                Manage Orders
              </button>
            </Link>
          </>
        }
        aside={
          <>
            <div className="portal-kicker">Store Snapshot</div>
            <div style={{ fontSize: '19px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
              INR {Math.round(totalValue)}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.7, marginBottom: '16px' }}>
              Total stock value across the current medicine inventory.
            </div>
            <div className="portal-summary-grid">
              <div className="portal-summary-box">
                <div className="portal-summary-box__value">{pending.length}</div>
                <div className="portal-summary-box__label">Pending orders</div>
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
          { title: 'Medicines', value: medicines.length, note: 'Inventory count' },
          { title: 'Low Stock', value: lowStock.length, note: 'Need replenishment' },
          { title: 'Pending', value: pending.length, note: 'Open orders' },
          { title: 'Categories', value: categories, note: 'Active medicine groups' },
        ]}
      />

      {usingDemoMedicines && (
        <PortalMessage kind="info">
          Demo medicines are visible because the live inventory is empty or unavailable.
        </PortalMessage>
      )}

      <section className="portal-main-grid">
        <div className="portal-stack">
          <PortalCard
            title="Quick Actions"
            description="Move between inventory and order workflows using the same rounded patient action cards."
            className="fade-up-2"
          >
            <div className="portal-action-grid">
              <PortalActionTile
                to="/store/medicines"
                code="MI"
                title="Medicine Inventory"
                description="Add, update, and review all stocked medicines without touching the existing inventory logic."
              />
              <PortalActionTile
                to="/store/orders"
                code="OR"
                title="Orders"
                description="Confirm, cancel, and deliver patient orders from the store order queue."
              />
            </div>
          </PortalCard>

          <PortalCard
            eyebrow="Inventory note"
            title="Stock movement"
            description="Keeping price, quantity, and unit details current makes order handling and restocking much easier."
            className="fade-up-3"
            soft
          >
            <div className="portal-note">
              Medicines with stock below ten units are highlighted in the same patient-style surface treatment used throughout this reskin.
            </div>
          </PortalCard>
        </div>

        <div className="portal-stack">
          <PortalCard
            eyebrow="Low stock"
            title="Restock alerts"
            description="Medicines that need attention soon."
            className="fade-up-2"
          >
            {lowStock.length > 0 ? (
              <div className="portal-list">
                {lowStock.slice(0, 4).map((medicine) => (
                  <div key={medicine.id} className="portal-row">
                    <div>
                      <div className="portal-row__title">{medicine.name}</div>
                      <div className="portal-row__meta">{medicine.category}</div>
                    </div>
                    <StatusPill label={`${medicine.stock} ${medicine.unit || 'units'}`} tone="amber" />
                  </div>
                ))}
              </div>
            ) : (
              <PortalEmptyState
                icon="OK"
                title="No low stock alerts"
                description="Inventory levels are currently healthy across the medicines in stock."
              />
            )}
          </PortalCard>

          <PortalCard
            eyebrow="Activity"
            title="Recent orders"
            description="A quick order preview using the patient list styling."
            action={
              <Link to="/store/orders" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 800, fontSize: '13px' }}>
                View all
              </Link>
            }
            className="fade-up-3"
          >
            {orders.length > 0 ? (
              <div className="portal-list">
                {orders.slice(0, 4).map((order) => (
                  <div key={order.id} className="portal-row">
                    <div>
                      <div className="portal-row__title">{order.medicine_name}</div>
                      <div className="portal-row__meta">
                        Qty {order.quantity} | {order.patient_name} | INR {order.price * order.quantity}
                      </div>
                    </div>
                    <StatusPill label={order.status} tone={orderToneMap[order.status] || 'neutral'} />
                  </div>
                ))}
              </div>
            ) : (
              <PortalEmptyState
                icon="OR"
                title="No orders yet"
                description="Orders will appear here when patients begin requesting medicines."
              />
            )}
          </PortalCard>
        </div>
      </section>
    </PortalPage>
  )
}

export default StoreDashboard
