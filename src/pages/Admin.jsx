import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'

function ReviewCard({ review: r, onDelete, onReply }) {
  const [reply, setReply] = useState(r.admin_reply || '')
  const [editing, setEditing] = useState(false)
  return (
    <div style={{ background: 'var(--dark)', border: '1px solid rgba(201,168,76,0.2)', padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.8rem' }}>
        <div>
          <p style={{ color: 'var(--white)', fontWeight: '500' }}>{r.customer_name || 'Anonymous'}</p>
          <p style={{ color: 'var(--gray)', fontSize: '0.8rem' }}>{r.service || ''} &nbsp;·&nbsp; {new Date(r.created_at).toLocaleDateString()}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <span style={{ color: '#FF9800', fontSize: '1rem' }}>{'★'.repeat(r.rating || 0)}{'☆'.repeat(5 - (r.rating || 0))}</span>
          <button onClick={() => onDelete(r.id)} style={{ background: 'rgba(244,67,54,0.15)', color: '#f44336', border: '1px solid #f44336', padding: '0.3rem 0.6rem', fontSize: '0.7rem', cursor: 'pointer' }}>🗑</button>
        </div>
      </div>
      <p style={{ color: 'var(--gray)', fontSize: '0.88rem', lineHeight: '1.6', marginBottom: '1rem' }}>{r.comment}</p>
      {r.admin_reply && !editing && (
        <div style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', padding: '0.8rem 1rem', marginBottom: '0.8rem' }}>
          <p style={{ color: 'var(--gold)', fontSize: '0.75rem', letterSpacing: '1px', marginBottom: '0.3rem' }}>ADMIN REPLY</p>
          <p style={{ color: 'var(--gray)', fontSize: '0.85rem' }}>{r.admin_reply}</p>
        </div>
      )}
      {editing ? (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input value={reply} onChange={e => setReply(e.target.value)} placeholder="Write a reply..." style={{ flex: 1, background: 'var(--dark2)', border: '1px solid rgba(201,168,76,0.3)', color: 'var(--white)', padding: '0.6rem 0.8rem', fontFamily: 'var(--font-body)', fontSize: '0.85rem', outline: 'none' }} />
          <button onClick={() => { onReply(r.id, reply); setEditing(false) }} style={{ background: 'var(--gold)', color: 'var(--black)', border: 'none', padding: '0.6rem 1rem', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'var(--font-body)' }}>Save</button>
          <button onClick={() => setEditing(false)} style={{ background: 'transparent', color: 'var(--gray)', border: '1px solid var(--gray)', padding: '0.6rem 1rem', cursor: 'pointer', fontSize: '0.8rem' }}>Cancel</button>
        </div>
      ) : (
        <button onClick={() => setEditing(true)} style={{ background: 'rgba(201,168,76,0.1)', color: 'var(--gold)', border: '1px solid var(--gold)', padding: '0.4rem 1rem', fontSize: '0.75rem', cursor: 'pointer' }}>
          {r.admin_reply ? '✏️ Edit Reply' : '💬 Reply'}
        </button>
      )}
    </div>
  )
}

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL?.trim().toLowerCase()

export default function Admin({ user }) {
  const [bookings, setBookings] = useState([])
  const [customers, setCustomers] = useState([])
  const [promos, setPromos] = useState([])
  const [services, setServices] = useState([])
  const [payments, setPayments] = useState([])
  const [tab, setTab] = useState('bookings')
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterDate, setFilterDate] = useState('')
  const [editBooking, setEditBooking] = useState(null)
  const [editService, setEditService] = useState(null)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [newPromo, setNewPromo] = useState({ tag: '', title: '', description: '', code: '', expiry: '' })
  const [newService, setNewService] = useState({ name: '', description: '', price: '', duration: '', category: '', activities: '', badge: '', suv_surcharge: '' })
  const [newPayment, setNewPayment] = useState({ booking_id: '', customer_name: '', customer_email: '', amount: '', method: 'cash', status: 'paid' })
  const [promoMsg, setPromoMsg] = useState('')
  const [serviceMsg, setServiceMsg] = useState('')
  const [paymentMsg, setPaymentMsg] = useState('')
  const [staff, setStaff] = useState([])
  const [inventory, setInventory] = useState([])
  const [reviews, setReviews] = useState([])
  const [newStaff, setNewStaff] = useState({ name: '', email: '', phone: '', role: 'worker' })
  const [staffMsg, setStaffMsg] = useState('')
  const [newItem, setNewItem] = useState({ name: '', quantity: '', unit: '', low_stock_alert: '', supplier: '' })
  const [inventoryMsg, setInventoryMsg] = useState('')
  const [editInventory, setEditInventory] = useState(null)
  const [contactMessages, setContactMessages] = useState([])
  const [gallery, setGallery] = useState([])
  const [newGalleryItem, setNewGalleryItem] = useState({ title: '', service: '', caption: '', before_url: '', after_url: '' })
  const [galleryMsg, setGalleryMsg] = useState('')
  const [galleryUploading, setGalleryUploading] = useState(false)
  const [settings, setSettings] = useState({
    phone: '+250 792 575 132', whatsapp: '0792575132', email: 'idetaildynastyrw@gmail.com', location: 'Kigali, Rwanda', business_hours: '',
    enable_reviews: true, enable_gallery: true, enable_promos: true,
    enable_whatsapp: true, enable_photo_upload: false,
    enable_price_calculator: false, enable_dashboard: true
  })
  const [settingsMsg, setSettingsMsg] = useState('')
  const navigate = useNavigate()

  const isAdmin = user?.email?.trim().toLowerCase() === ADMIN_EMAIL

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const [{ data: b }, { data: p }, { data: pr }, { data: sv }, { data: pm }, { data: st }, { data: inv }, { data: rev }, { data: cfg }, { data: msgs }, { data: gal }] = await Promise.all([
      supabase.from('bookings').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('promos').select('*').order('created_at', { ascending: false }),
      supabase.from('services').select('*').order('created_at', { ascending: false }),
      supabase.from('payments').select('*').order('created_at', { ascending: false }),
      supabase.from('staff').select('*').order('created_at', { ascending: false }),
      supabase.from('inventory').select('*').order('name'),
      supabase.from('reviews').select('*').order('created_at', { ascending: false }),
      supabase.from('settings').select('*').limit(1),
      supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
      supabase.from('gallery').select('*').order('created_at', { ascending: false }),
    ])
    setBookings(b || [])
    setCustomers(p || [])
    setPromos(pr || [])
    setServices(sv || [])
    setPayments(pm || [])
    setStaff(st || [])
    setInventory(inv || [])
    setReviews(rev || [])
    if (cfg && cfg.length > 0) setSettings(cfg[0])
    setContactMessages(msgs || [])
    setGallery(gal || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!user) return
    if (!isAdmin) { navigate('/'); return }
    const loadData = async () => { await fetchAll() }
    loadData()
  }, [user, isAdmin, navigate, fetchAll])

  // BOOKING ACTIONS
  const updateBookingStatus = async (id, status) => {
    await supabase.from('bookings').update({ status }).eq('id', id)
    await fetchAll()
  }

  const deleteBooking = async (id) => {
    if (!window.confirm('Delete this booking?')) return
    await supabase.from('bookings').delete().eq('id', id)
    await fetchAll()
  }

  const saveEditBooking = async () => {
    await supabase.from('bookings').update({
      name: editBooking.name,
      email: editBooking.email,
      phone: editBooking.phone,
      service: editBooking.service,
      date: editBooking.date,
      time: editBooking.time,
      car_model: editBooking.car_model,
      admin_notes: editBooking.admin_notes,
      status: editBooking.status,
      payment_status: editBooking.payment_status,
      amount: editBooking.amount,
    }).eq('id', editBooking.id)
    setEditBooking(null)
    await fetchAll()
  }

  // SERVICE ACTIONS
  const saveEditService = async () => {
    await supabase.from('services').update({
      name: editService.name,
      description: editService.description,
      price: parseFloat(editService.price),
      duration: editService.duration,
      category: editService.category,
      active: editService.active,
      activities: editService.activities || '',
    }).eq('id', editService.id)
    setEditService(null)
    await fetchAll()
  }

  const deleteService = async (id) => {
    if (!window.confirm('Delete this service?')) return
    await supabase.from('services').delete().eq('id', id)
    await fetchAll()
  }

  const addService = async (e) => {
    e.preventDefault()
    if (!newService.name || !newService.price) { setServiceMsg('Name and price are required.'); return }
    await supabase.from('services').insert({ ...newService, price: parseFloat(newService.price), active: true, activities: newService.activities || '', badge: newService.badge || '', suv_surcharge: parseInt(newService.suv_surcharge) || 0 })
    setServiceMsg('Service added! ✅')
    setNewService({ name: '', description: '', price: '', duration: '', category: '', activities: '', badge: '', suv_surcharge: '' })
    await fetchAll()
    setTimeout(() => setServiceMsg(''), 3000)
  }

  // PAYMENT ACTIONS
  const addPayment = async (e) => {
    e.preventDefault()
    if (!newPayment.customer_name || !newPayment.amount) { setPaymentMsg('Customer name and amount required.'); return }
    await supabase.from('payments').insert({ ...newPayment, amount: parseFloat(newPayment.amount) })
    setPaymentMsg('Payment recorded! ✅')
    setNewPayment({ booking_id: '', customer_name: '', customer_email: '', amount: '', method: 'cash', status: 'paid' })
    await fetchAll()
    setTimeout(() => setPaymentMsg(''), 3000)
  }

  const updatePaymentStatus = async (id, status) => {
    await supabase.from('payments').update({ status }).eq('id', id)
    await fetchAll()
  }

  const deletePayment = async (id) => {
    if (!window.confirm('Delete this payment?')) return
    await supabase.from('payments').delete().eq('id', id)
    await fetchAll()
  }

  // PROMO ACTIONS
  const addPromo = async (e) => {
    e.preventDefault()
    if (!newPromo.tag || !newPromo.title || !newPromo.description || !newPromo.code || !newPromo.expiry) {
      setPromoMsg('Please fill in all fields.'); return
    }
    await supabase.from('promos').insert({ ...newPromo, active: true })
    setPromoMsg('Promo added! ✅')
    setNewPromo({ tag: '', title: '', description: '', code: '', expiry: '' })
    await fetchAll()
    setTimeout(() => setPromoMsg(''), 3000)
  }

  const deletePromo = async (id) => {
    await supabase.from('promos').delete().eq('id', id)
    await fetchAll()
  }

  // STAFF ACTIONS
  const addStaff = async (e) => {
    e.preventDefault()
    if (!newStaff.name || !newStaff.email) { setStaffMsg('Name and email are required.'); return }
    await supabase.from('staff').insert({ ...newStaff, jobs_completed: 0, active: true })
    setStaffMsg('Staff member added! ✅')
    setNewStaff({ name: '', email: '', phone: '', role: 'worker' })
    await fetchAll()
    setTimeout(() => setStaffMsg(''), 3000)
  }

  const deleteStaff = async (id) => {
    if (!window.confirm('Remove this staff member?')) return
    await supabase.from('staff').delete().eq('id', id)
    await fetchAll()
  }

  const toggleStaffActive = async (id, active) => {
    await supabase.from('staff').update({ active: !active }).eq('id', id)
    await fetchAll()
  }

  // INVENTORY ACTIONS
  const addInventoryItem = async (e) => {
    e.preventDefault()
    if (!newItem.name || !newItem.quantity) { setInventoryMsg('Name and quantity are required.'); return }
    await supabase.from('inventory').insert({ ...newItem, quantity: parseInt(newItem.quantity), low_stock_alert: parseInt(newItem.low_stock_alert) || 5 })
    setInventoryMsg('Item added! ✅')
    setNewItem({ name: '', quantity: '', unit: '', low_stock_alert: '', supplier: '' })
    await fetchAll()
    setTimeout(() => setInventoryMsg(''), 3000)
  }

  const saveEditInventory = async () => {
    await supabase.from('inventory').update({
      name: editInventory.name,
      quantity: parseInt(editInventory.quantity),
      unit: editInventory.unit,
      low_stock_alert: parseInt(editInventory.low_stock_alert) || 5,
      supplier: editInventory.supplier,
    }).eq('id', editInventory.id)
    setEditInventory(null)
    await fetchAll()
  }

  const deleteInventoryItem = async (id) => {
    if (!window.confirm('Delete this item?')) return
    await supabase.from('inventory').delete().eq('id', id)
    await fetchAll()
  }

  // CSV EXPORT
  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Service', 'Date', 'Time', 'Car Model', 'Status', 'Payment Status', 'Amount', 'Notes']
    const rows = bookings.map(b => [
      b.name, b.email, b.phone || '', b.service, b.date, b.time,
      b.car_model || '', b.status, b.payment_status || 'unpaid',
      b.amount || '', b.notes || ''
    ])
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // GALLERY ACTIONS
  const uploadGalleryImage = async (file, type) => {
    if (!file) return null
    setGalleryUploading(true)
    const ext = file.name.split('.').pop()
    const path = `gallery/${Date.now()}-${type}.${ext}`
    const { error } = await supabase.storage.from('gallery').upload(path, file, { upsert: true })
    setGalleryUploading(false)
    if (error) { setGalleryMsg('Upload failed: ' + error.message); return null }
    const { data } = supabase.storage.from('gallery').getPublicUrl(path)
    return data.publicUrl
  }

  const addGalleryItem = async (e) => {
    e.preventDefault()
    if (!newGalleryItem.before_url && !newGalleryItem.after_url) { setGalleryMsg('Please provide at least one image URL or upload a file.'); return }
    await supabase.from('gallery').insert({ ...newGalleryItem })
    setGalleryMsg('Gallery item added! ✅')
    setNewGalleryItem({ title: '', service: '', caption: '', before_url: '', after_url: '' })
    await fetchAll()
    setTimeout(() => setGalleryMsg(''), 3000)
  }

  const deleteGalleryItem = async (id) => {
    if (!window.confirm('Delete this gallery item?')) return
    await supabase.from('gallery').delete().eq('id', id)
    await fetchAll()
  }

  // REVIEWS ACTIONS
  const deleteReview = async (id) => {
    if (!window.confirm('Delete this review?')) return
    await supabase.from('reviews').delete().eq('id', id)
    await fetchAll()
  }

  const replyToReview = async (id, reply) => {
    await supabase.from('reviews').update({ admin_reply: reply }).eq('id', id)
    await fetchAll()
  }

  const deleteContactMessage = async (id) => {
    await supabase.from('contact_messages').delete().eq('id', id)
    await fetchAll()
  }

  // SETTINGS ACTIONS
  const saveSettings = async (e) => {
    e.preventDefault()
    if (settings.id) {
      await supabase.from('settings').update({
        phone: settings.phone,
        whatsapp: settings.whatsapp,
        email: settings.email,
        location: settings.location,
        business_hours: settings.business_hours,
        enable_reviews: settings.enable_reviews,
        enable_gallery: settings.enable_gallery,
        enable_promos: settings.enable_promos,
        enable_whatsapp: settings.enable_whatsapp,
        enable_photo_upload: settings.enable_photo_upload,
        enable_price_calculator: settings.enable_price_calculator,
        enable_dashboard: settings.enable_dashboard,
      }).eq('id', settings.id)
    } else {
      await supabase.from('settings').insert({
        phone: settings.phone,
        whatsapp: settings.whatsapp,
        email: settings.email,
        location: settings.location,
        business_hours: settings.business_hours,
        enable_reviews: settings.enable_reviews,
        enable_gallery: settings.enable_gallery,
        enable_promos: settings.enable_promos,
        enable_whatsapp: settings.enable_whatsapp,
        enable_photo_upload: settings.enable_photo_upload,
        enable_price_calculator: settings.enable_price_calculator,
        enable_dashboard: settings.enable_dashboard,
      })
    }
    setSettingsMsg('Settings saved! ✅')
    await fetchAll()
    setTimeout(() => setSettingsMsg(''), 3000)
  }

  // HELPERS
  const statusColor = (status) => {
    if (status === 'confirmed') return '#4CAF50'
    if (status === 'completed') return '#2196F3'
    if (status === 'cancelled') return '#f44336'
    if (status === 'no-show') return '#FF9800'
    return 'var(--gold)'
  }

  const filteredBookings = bookings.filter(b => {
    const matchStatus = filterStatus === 'all' || b.status === filterStatus
    const matchDate = !filterDate || b.date === filterDate
    return matchStatus && matchDate
  })

  const totalRevenue = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + (p.amount || 0), 0)
  const pendingRevenue = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + (p.amount || 0), 0)

  const customerBookings = (email) => bookings.filter(b => b.email === email)

  // REPORTS HELPERS
  const topServices = services.map(s => ({
    name: s.name,
    count: bookings.filter(b => b.service === s.name).length
  })).sort((a, b) => b.count - a.count).slice(0, 5)

  const revenueByMonth = payments.filter(p => p.status === 'paid').reduce((acc, p) => {
    const month = new Date(p.created_at).toLocaleString('default', { month: 'short', year: '2-digit' })
    acc[month] = (acc[month] || 0) + p.amount
    return acc
  }, {})

  const lowStockItems = inventory.filter(i => i.quantity <= (i.low_stock_alert || 5))

  const inputStyle = {
    background: 'var(--dark2)', border: '1px solid rgba(201,168,76,0.2)',
    color: 'var(--white)', padding: '0.7rem 1rem',
    fontFamily: 'var(--font-body)', fontSize: '0.85rem',
    outline: 'none', width: '100%'
  }

  const btnStyle = (color = 'var(--gold)') => ({
    background: color === 'var(--gold)' ? 'var(--gold)' : `rgba(${color},0.15)`,
    color: color === 'var(--gold)' ? 'var(--black)' : `rgb(${color})`,
    border: `1px solid ${color === 'var(--gold)' ? 'var(--gold)' : `rgb(${color})`}`,
    padding: '0.4rem 0.9rem', fontSize: '0.75rem',
    cursor: 'pointer', letterSpacing: '1px', fontFamily: 'var(--font-body)'
  })

  if (!user) return (
    <div style={{ minHeight: '100vh', background: 'var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--gold)', letterSpacing: '3px' }}>LOADING...</p>
    </div>
  )

  if (!isAdmin) return null

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)', paddingTop: '5rem' }}>

      {/* HEADER */}
      <div style={{ background: 'var(--dark)', borderBottom: '1px solid rgba(201,168,76,0.2)', padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--gold)', fontSize: '0.75rem', letterSpacing: '4px', textTransform: 'uppercase' }}>Admin Panel</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', marginTop: '0.3rem' }}>iDetail Dynasty</h1>
      </div>

      {/* STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        {[
          { label: 'Total Bookings', value: bookings.length, icon: '📅' },
          { label: 'Pending', value: bookings.filter(b => b.status === 'pending').length, icon: '⏳' },
          { label: 'Confirmed', value: bookings.filter(b => b.status === 'confirmed').length, icon: '✅' },
          { label: 'Completed', value: bookings.filter(b => b.status === 'completed').length, icon: '🏆' },
          { label: 'Customers', value: customers.length, icon: '👥' },
          { label: 'Revenue', value: `RWF ${totalRevenue}`, icon: '💰' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'var(--dark)', border: '1px solid rgba(201,168,76,0.2)', padding: '1.2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>{s.icon}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--gold)' }}>{s.value}</div>
            <div style={{ color: 'var(--gray)', fontSize: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* TABS */}
      <div style={{ padding: '0 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '2rem', flexWrap: 'wrap', background: 'var(--dark)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '50px', padding: '0.4rem' }}>
          {['bookings', 'customers', 'services', 'payments', 'promos', 'staff', 'inventory', 'gallery', 'reports', 'reviews', 'settings'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              background: tab === t ? 'var(--gold)' : 'transparent',
              border: 'none',
              color: tab === t ? 'var(--black)' : 'var(--gray)',
              fontFamily: 'var(--font-body)', fontSize: '0.75rem',
              letterSpacing: '1.5px', textTransform: 'uppercase',
              cursor: 'pointer', padding: '0.55rem 1.1rem',
              borderRadius: '50px',
              fontWeight: tab === t ? '500' : '300',
              transition: 'all 0.25s',
              whiteSpace: 'nowrap',
            }}>{t}</button>
          ))}
        </div>

        {loading ? (
          <p style={{ color: 'var(--gray)', textAlign: 'center', padding: '3rem' }}>Loading...</p>
        ) : (
          <>

            {/* =================== BOOKINGS TAB =================== */}
            {tab === 'bookings' && (
              <div>
                {/* FILTERS */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                  <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="no-show">No Show</option>
                  </select>
                  <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} style={{ ...inputStyle, width: 'auto' }} />
                  {(filterStatus !== 'all' || filterDate) && (
                    <button onClick={() => { setFilterStatus('all'); setFilterDate('') }} style={{ ...btnStyle(), padding: '0.4rem 1rem' }}>
                      Clear Filters
                    </button>
                  )}
                  <span style={{ color: 'var(--gray)', fontSize: '0.85rem', alignSelf: 'center' }}>
                    {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''}
                  </span>
                  <button onClick={exportCSV} style={{ ...btnStyle(), marginLeft: 'auto', padding: '0.4rem 1.2rem' }}>⬇ Export CSV</button>
                </div>

                {/* EDIT BOOKING MODAL */}
                {editBooking && (
                  <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000, padding: '1rem'
                  }}>
                    <div style={{ background: 'var(--dark)', border: '1px solid rgba(201,168,76,0.3)', padding: '2rem', width: '100%', maxWidth: '550px', maxHeight: '90vh', overflowY: 'auto' }}>
                      <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)', fontSize: '1.5rem', marginBottom: '1.5rem' }}>Edit Booking</h3>
                      <div className="form-grid">
                        {[
                          { label: 'Name', key: 'name' },
                          { label: 'Email', key: 'email' },
                          { label: 'Phone', key: 'phone' },
                          { label: 'Car Model', key: 'car_model' },
                          { label: 'Date', key: 'date', type: 'date' },
                        ].map(f => (
                          <div className="form-group" key={f.key}>
                            <label>{f.label}</label>
                            <input type={f.type || 'text'} value={editBooking[f.key] || ''} onChange={e => setEditBooking({ ...editBooking, [f.key]: e.target.value })} />
                          </div>
                        ))}
                        <div className="form-group">
                          <label>Time</label>
                          <select value={editBooking.time || ''} onChange={e => setEditBooking({ ...editBooking, time: e.target.value })}>
                            {['08:00 AM','09:00 AM','10:00 AM','11:00 AM','12:00 PM','01:00 PM','02:00 PM','03:00 PM','04:00 PM'].map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Status</label>
                          <select value={editBooking.status} onChange={e => setEditBooking({ ...editBooking, status: e.target.value })}>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="no-show">No Show</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Payment Status</label>
                          <select value={editBooking.payment_status || 'unpaid'} onChange={e => setEditBooking({ ...editBooking, payment_status: e.target.value })}>
                            <option value="unpaid">Unpaid</option>
                            <option value="paid">Paid</option>
                            <option value="partial">Partial</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Amount (RWF)</label>
                          <input type="number" value={editBooking.amount || ''} onChange={e => setEditBooking({ ...editBooking, amount: e.target.value })} />
                        </div>
                        <div className="form-group full">
                          <label>Service</label>
                          <select value={editBooking.service} onChange={e => setEditBooking({ ...editBooking, service: e.target.value })}>
                            {services.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                          </select>
                        </div>
                        <div className="form-group full">
                          <label>Admin Notes</label>
                          <textarea value={editBooking.admin_notes || ''} onChange={e => setEditBooking({ ...editBooking, admin_notes: e.target.value })} placeholder="Internal notes about this booking..." />
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                        <button onClick={saveEditBooking} style={{ flex: 1, padding: '0.9rem', background: 'var(--gold)', color: 'var(--black)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', letterSpacing: '1px' }}>
                          Save Changes
                        </button>
                        <button onClick={() => setEditBooking(null)} style={{ flex: 1, padding: '0.9rem', background: 'transparent', color: 'var(--gray)', border: '1px solid var(--gray)', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* BOOKINGS TABLE */}
                {filteredBookings.length === 0 ? (
                  <p style={{ color: 'var(--gray)', textAlign: 'center', padding: '3rem' }}>No bookings found.</p>
                ) : (
                  <div className="admin-table-wrap">
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(201,168,76,0.3)' }}>
                          {['Name', 'Email', 'Service', 'Date', 'Time', 'Car', 'Status', 'Payment', 'Notes', 'Actions'].map(h => (
                            <th key={h} style={{ padding: '0.8rem', textAlign: 'left', color: 'var(--gold)', fontSize: '0.7rem', letterSpacing: '1.5px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBookings.map(b => (
                          <tr key={b.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '0.8rem', color: 'var(--white)', whiteSpace: 'nowrap' }}>{b.name}</td>
                            <td style={{ padding: '0.8rem', color: 'var(--gray)', fontSize: '0.8rem' }}>{b.email}</td>
                            <td style={{ padding: '0.8rem', color: 'var(--white)', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.service}</td>
                            <td style={{ padding: '0.8rem', color: 'var(--white)', whiteSpace: 'nowrap' }}>{b.date}</td>
                            <td style={{ padding: '0.8rem', color: 'var(--white)', whiteSpace: 'nowrap' }}>{b.time}</td>
                            <td style={{ padding: '0.8rem', color: 'var(--gray)' }}>{b.car_model || '—'}</td>
                            <td style={{ padding: '0.8rem' }}>
                              <select value={b.status} onChange={e => updateBookingStatus(b.id, e.target.value)}
                                style={{ background: 'var(--dark2)', color: statusColor(b.status), border: `1px solid ${statusColor(b.status)}`, padding: '0.2rem 0.4rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="no-show">No Show</option>
                              </select>
                            </td>
                            <td style={{ padding: '0.8rem' }}>
                              <span style={{ color: b.payment_status === 'paid' ? '#4CAF50' : b.payment_status === 'partial' ? '#FF9800' : 'var(--gray)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                                {b.payment_status || 'unpaid'}
                              </span>
                            </td>
                            <td style={{ padding: '0.8rem', color: 'var(--gray)', fontSize: '0.78rem', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {b.admin_notes || '—'}
                            </td>
                            <td style={{ padding: '0.8rem' }}>
                              <div style={{ display: 'flex', gap: '0.4rem' }}>
                                <button onClick={() => setEditBooking(b)} style={{ background: 'rgba(201,168,76,0.15)', color: 'var(--gold)', border: '1px solid var(--gold)', padding: '0.3rem 0.5rem', fontSize: '0.7rem', cursor: 'pointer' }}>✏️</button>
                                <button onClick={() => deleteBooking(b.id)} style={{ background: 'rgba(244,67,54,0.15)', color: '#f44336', border: '1px solid #f44336', padding: '0.3rem 0.5rem', fontSize: '0.7rem', cursor: 'pointer' }}>🗑</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* =================== CUSTOMERS TAB =================== */}
            {tab === 'customers' && (
              <div>
                {selectedCustomer ? (
                  <div>
                    <button onClick={() => setSelectedCustomer(null)} style={{ ...btnStyle(), marginBottom: '1.5rem' }}>← Back to Customers</button>
                    <div style={{ background: 'var(--dark)', border: '1px solid rgba(201,168,76,0.2)', padding: '2rem', marginBottom: '1.5rem' }}>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--gold)', marginBottom: '0.5rem' }}>{selectedCustomer.name}</h3>
                      <p style={{ color: 'var(--gray)', marginBottom: '0.3rem' }}>📧 {selectedCustomer.email || '—'}</p>
                      <p style={{ color: 'var(--gray)', marginBottom: '0.3rem' }}>📞 {selectedCustomer.phone || 'No phone'}</p>
                      <p style={{ color: 'var(--gray)', marginBottom: '0.3rem' }}>📅 Joined: {new Date(selectedCustomer.created_at).toLocaleDateString()}</p>
                      <p style={{ color: 'var(--gold)', marginTop: '0.5rem' }}>🔁 {customerBookings(selectedCustomer.email || '').length} total bookings</p>
                    </div>
                    <h4 style={{ color: 'var(--gold)', letterSpacing: '2px', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '1rem' }}>Service History</h4>
                    {customerBookings(selectedCustomer.email || '').length === 0 ? (
                      <p style={{ color: 'var(--gray)' }}>No bookings found for this customer.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {customerBookings(selectedCustomer.email || '').map(b => (
                          <div key={b.id} style={{ background: 'var(--dark)', border: '1px solid rgba(201,168,76,0.1)', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <div>
                              <p style={{ color: 'var(--white)', fontWeight: '500' }}>{b.service}</p>
                              <p style={{ color: 'var(--gray)', fontSize: '0.82rem' }}>{b.date} at {b.time} — {b.car_model || 'No car specified'}</p>
                              {b.admin_notes && <p style={{ color: 'var(--gold)', fontSize: '0.78rem', marginTop: '0.3rem' }}>📝 {b.admin_notes}</p>}
                            </div>
                            <span style={{ color: statusColor(b.status), fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', border: `1px solid ${statusColor(b.status)}`, padding: '0.2rem 0.6rem' }}>{b.status}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    {/* REGISTERED CUSTOMERS */}
                    <h4 style={{ color: 'var(--gold)', letterSpacing: '2px', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '1rem' }}>Registered Customers ({customers.length})</h4>
                    {customers.length === 0 ? (
                      <p style={{ color: 'var(--gray)', marginBottom: '2rem' }}>No registered customers yet.</p>
                    ) : (
                      <div style={{ overflowX: 'auto', marginBottom: '3rem' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid rgba(201,168,76,0.3)' }}>
                              {['Name', 'Email', 'Phone', 'Bookings', 'Joined', 'Actions'].map(h => (
                                <th key={h} style={{ padding: '0.8rem 1rem', textAlign: 'left', color: 'var(--gold)', fontSize: '0.75rem', letterSpacing: '1.5px', textTransform: 'uppercase' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {customers.map(c => (
                              <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '0.8rem 1rem', color: 'var(--white)' }}>{c.name}</td>
                                <td style={{ padding: '0.8rem 1rem', color: 'var(--gray)' }}>{c.email || '—'}</td>
                                <td style={{ padding: '0.8rem 1rem', color: 'var(--gray)' }}>{c.phone || '—'}</td>
                                <td style={{ padding: '0.8rem 1rem', color: 'var(--gold)' }}>{customerBookings(c.email || '').length}</td>
                                <td style={{ padding: '0.8rem 1rem', color: 'var(--gray)' }}>{new Date(c.created_at).toLocaleDateString()}</td>
                                <td style={{ padding: '0.8rem 1rem' }}>
                                  <button onClick={() => setSelectedCustomer(c)} style={{ background: 'rgba(201,168,76,0.15)', color: 'var(--gold)', border: '1px solid var(--gold)', padding: '0.3rem 0.8rem', fontSize: '0.75rem', cursor: 'pointer' }}>View History</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* CONTACT MESSAGES */}
                    <h4 style={{ color: 'var(--gold)', letterSpacing: '2px', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '1rem' }}>Contact Form Messages ({contactMessages.length})</h4>
                    {contactMessages.length === 0 ? (
                      <p style={{ color: 'var(--gray)' }}>No messages received yet.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {contactMessages.map(m => (
                          <div key={m.id} style={{ background: 'var(--dark)', border: '1px solid rgba(201,168,76,0.15)', padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.8rem' }}>
                              <div>
                                <p style={{ color: 'var(--white)', fontWeight: '500' }}>{m.name}</p>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                                  <a href={`mailto:${m.email}`} style={{ color: 'var(--gold)', fontSize: '0.82rem', textDecoration: 'none' }}>✉️ {m.email}</a>
                                  {m.phone && <a href={`tel:${m.phone}`} style={{ color: 'var(--gold)', fontSize: '0.82rem', textDecoration: 'none' }}>📞 {m.phone}</a>}
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                <span style={{ color: 'var(--gray)', fontSize: '0.75rem' }}>{new Date(m.created_at).toLocaleDateString()}</span>
                                <button onClick={() => deleteContactMessage(m.id)} style={{ background: 'rgba(244,67,54,0.15)', color: '#f44336', border: '1px solid #f44336', padding: '0.3rem 0.6rem', fontSize: '0.7rem', cursor: 'pointer' }}>🗑</button>
                              </div>
                            </div>
                            <p style={{ color: 'var(--gray)', fontSize: '0.88rem', lineHeight: '1.6', background: 'var(--dark2)', padding: '0.8rem 1rem' }}>{m.message}</p>
                            <a href={`mailto:${m.email}?subject=Re: Your enquiry to iDetail Dynasty`} style={{ display: 'inline-block', marginTop: '0.8rem', background: 'rgba(201,168,76,0.1)', color: 'var(--gold)', border: '1px solid var(--gold)', padding: '0.4rem 1rem', fontSize: '0.75rem', textDecoration: 'none', letterSpacing: '1px' }}>Reply via Email</a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* =================== SERVICES TAB =================== */}
            {tab === 'services' && (
              <div>
                {/* EDIT SERVICE MODAL */}
                {editService && (
                  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                    <div style={{ background: 'var(--dark)', border: '1px solid rgba(201,168,76,0.3)', padding: '2rem', width: '100%', maxWidth: '500px' }}>
                      <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)', fontSize: '1.5rem', marginBottom: '1.5rem' }}>Edit Service</h3>
                      <div className="form-grid">
                        <div className="form-group full">
                          <label>Service Name</label>
                          <input value={editService.name} onChange={e => setEditService({ ...editService, name: e.target.value })} />
                        </div>
                        <div className="form-group full">
                          <label>Description</label>
                          <textarea value={editService.description || ''} onChange={e => setEditService({ ...editService, description: e.target.value })} />
                        </div>
                        <div className="form-group full">
                          <label>Activities (one per line)</label>
                          <textarea value={editService.activities || ''} onChange={e => setEditService({ ...editService, activities: e.target.value })} placeholder="e.g.&#10;Exterior hand wash&#10;Tire dressing&#10;Window cleaning" style={{ minHeight: '100px' }} />
                        </div>
                        <div className="form-group">
                          <label>Price (RWF)</label>
                          <input type="number" value={editService.price} onChange={e => setEditService({ ...editService, price: e.target.value })} />
                        </div>
                        <div className="form-group">
                          <label>Duration</label>
                          <input value={editService.duration || ''} onChange={e => setEditService({ ...editService, duration: e.target.value })} placeholder="e.g. 1 hour" />
                        </div>
                        <div className="form-group">
                          <label>Category</label>
                          <select value={editService.category || ''} onChange={e => setEditService({ ...editService, category: e.target.value })}>
                            <option value="exterior">Exterior</option>
                            <option value="interior">Interior</option>
                            <option value="combo">Combo</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Status</label>
                          <select value={editService.active ? 'active' : 'inactive'} onChange={e => setEditService({ ...editService, active: e.target.value === 'active' })}>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Badge <span style={{color:'var(--gray)',fontWeight:300}}>(e.g. Most Popular)</span></label>
                          <input value={editService.badge || ''} onChange={e => setEditService({ ...editService, badge: e.target.value })} placeholder="Most Popular" />
                        </div>
                        <div className="form-group">
                          <label>SUV Surcharge (RWF)</label>
                          <input type="number" value={editService.suv_surcharge || ''} onChange={e => setEditService({ ...editService, suv_surcharge: e.target.value })} placeholder="5000" />
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                        <button onClick={saveEditService} style={{ flex: 1, padding: '0.9rem', background: 'var(--gold)', color: 'var(--black)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', letterSpacing: '1px' }}>Save Changes</button>
                        <button onClick={() => setEditService(null)} style={{ flex: 1, padding: '0.9rem', background: 'transparent', color: 'var(--gray)', border: '1px solid var(--gray)', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Cancel</button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ADD NEW SERVICE */}
                <div style={{ background: 'var(--dark)', border: '1px solid rgba(201,168,76,0.2)', padding: '2rem', marginBottom: '2rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--gold)', marginBottom: '1.5rem' }}>Add New Service</h3>
                  {serviceMsg && <div style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid var(--gold)', color: 'var(--gold)', padding: '0.8rem', marginBottom: '1rem', fontSize: '0.85rem' }}>{serviceMsg}</div>}
                  <form onSubmit={addService}>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Service Name *</label>
                        <input value={newService.name} onChange={e => setNewService({ ...newService, name: e.target.value })} placeholder="e.g. Engine Bay Cleaning" />
                      </div>
                      <div className="form-group">
                        <label>Price (RWF) *</label>
                        <input type="number" value={newService.price} onChange={e => setNewService({ ...newService, price: e.target.value })} placeholder="50" />
                      </div>
                      <div className="form-group">
                        <label>Duration</label>
                        <input value={newService.duration} onChange={e => setNewService({ ...newService, duration: e.target.value })} placeholder="e.g. 1 hour" />
                      </div>
                      <div className="form-group">
                        <label>Category</label>
                        <select value={newService.category} onChange={e => setNewService({ ...newService, category: e.target.value })}>
                          <option value="">Select category</option>
                          <option value="exterior">Exterior</option>
                          <option value="interior">Interior</option>
                          <option value="combo">Combo</option>
                        </select>
                      </div>
                      <div className="form-group full">
                        <label>Description</label>
                        <textarea value={newService.description} onChange={e => setNewService({ ...newService, description: e.target.value })} placeholder="Describe the service..." />
                      </div>
                      <div className="form-group">
                        <label>Badge <span style={{color:'var(--gray)',fontWeight:300}}>(e.g. Most Popular)</span></label>
                        <input value={newService.badge} onChange={e => setNewService({ ...newService, badge: e.target.value })} placeholder="Most Popular" />
                      </div>
                      <div className="form-group">
                        <label>SUV Surcharge (RWF)</label>
                        <input type="number" value={newService.suv_surcharge} onChange={e => setNewService({ ...newService, suv_surcharge: e.target.value })} placeholder="5000" />
                      </div>
                      <div className="form-group full">
                        <label>Activities (one per line)</label>
                        <textarea value={newService.activities} onChange={e => setNewService({ ...newService, activities: e.target.value })} placeholder="e.g.&#10;Exterior hand wash&#10;Tire dressing&#10;Window cleaning" style={{ minHeight: '100px' }} />
                      </div>
                      <div className="form-submit">
                        <button type="submit">Add Service</button>
                      </div>
                    </div>
                  </form>
                </div>

                {/* SERVICES LIST */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                  {services.map(s => (
                    <div key={s.id} style={{ background: 'var(--dark)', border: `1px solid ${s.active ? 'rgba(201,168,76,0.2)' : 'rgba(255,255,255,0.05)'}`, padding: '1.5rem', position: 'relative' }}>
                      {!s.active && (
                        <span style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(244,67,54,0.2)', color: '#f44336', fontSize: '0.7rem', padding: '0.2rem 0.5rem', letterSpacing: '1px' }}>INACTIVE</span>
                      )}
                      <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: s.active ? 'var(--white)' : 'var(--gray)', marginBottom: '0.5rem' }}>{s.name}</h4>
                      <p style={{ color: 'var(--gray)', fontSize: '0.82rem', marginBottom: '0.8rem' }}>{s.description}</p>
                      {s.activities && s.activities.trim() && (
                        <ul style={{ padding: 0, listStyle: 'none', marginBottom: '0.8rem' }}>
                          {s.activities.split('\n').filter(a => a.trim()).slice(0, 4).map((a, i) => (
                            <li key={i} style={{ color: 'var(--gray)', fontSize: '0.78rem', padding: '0.2rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ color: 'var(--gold)', fontSize: '0.55rem' }}>&#10022;</span>{a.trim()}
                            </li>
                          ))}
                          {s.activities.split('\n').filter(a => a.trim()).length > 4 && (
                            <li style={{ color: 'var(--gold)', fontSize: '0.75rem', marginTop: '0.2rem' }}>+{s.activities.split('\n').filter(a => a.trim()).length - 4} more</li>
                          )}
                        </ul>
                      )}
                      {(!s.activities || !s.activities.trim()) && (
                        <p style={{ color: 'rgba(201,168,76,0.4)', fontSize: '0.75rem', marginBottom: '0.8rem', fontStyle: 'italic' }}>No activities listed — click Edit to add</p>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ color: 'var(--gold)', fontWeight: '500' }}>RWF {s.price}</span>
                        <span style={{ color: 'var(--gray)', fontSize: '0.8rem' }}>⏱ {s.duration}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => setEditService(s)} style={{ flex: 1, background: 'rgba(201,168,76,0.1)', color: 'var(--gold)', border: '1px solid var(--gold)', padding: '0.4rem', fontSize: '0.75rem', cursor: 'pointer' }}>✏️ Edit</button>
                        <button onClick={() => deleteService(s.id)} style={{ flex: 1, background: 'rgba(244,67,54,0.1)', color: '#f44336', border: '1px solid #f44336', padding: '0.4rem', fontSize: '0.75rem', cursor: 'pointer' }}>🗑 Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* =================== PAYMENTS TAB =================== */}
            {tab === 'payments' && (
              <div>
                {/* REVENUE SUMMARY */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                  {[
                    { label: 'Total Revenue', value: `RWF ${totalRevenue}`, color: '#4CAF50' },
                    { label: 'Pending', value: `RWF ${pendingRevenue}`, color: '#FF9800' },
                    { label: 'Transactions', value: payments.length, color: 'var(--gold)' },
                  ].map((s, i) => (
                    <div key={i} style={{ background: 'var(--dark)', border: `1px solid ${s.color}30`, padding: '1.5rem', textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: s.color }}>{s.value}</div>
                      <div style={{ color: 'var(--gray)', fontSize: '0.8rem', letterSpacing: '1px', textTransform: 'uppercase' }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* ADD PAYMENT */}
                <div style={{ background: 'var(--dark)', border: '1px solid rgba(201,168,76,0.2)', padding: '2rem', marginBottom: '2rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--gold)', marginBottom: '1.5rem' }}>Record Payment</h3>
                  {paymentMsg && <div style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid var(--gold)', color: 'var(--gold)', padding: '0.8rem', marginBottom: '1rem', fontSize: '0.85rem' }}>{paymentMsg}</div>}
                  <form onSubmit={addPayment}>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Customer Name *</label>
                        <input value={newPayment.customer_name} onChange={e => setNewPayment({ ...newPayment, customer_name: e.target.value })} placeholder="John Doe" />
                      </div>
                      <div className="form-group">
                        <label>Customer Email</label>
                        <input value={newPayment.customer_email} onChange={e => setNewPayment({ ...newPayment, customer_email: e.target.value })} placeholder="john@email.com" />
                      </div>
                      <div className="form-group">
                        <label>Amount (RWF) *</label>
                        <input type="number" value={newPayment.amount} onChange={e => setNewPayment({ ...newPayment, amount: e.target.value })} placeholder="50" />
                      </div>
                      <div className="form-group">
                        <label>Payment Method</label>
                        <select value={newPayment.method} onChange={e => setNewPayment({ ...newPayment, method: e.target.value })}>
                          <option value="cash">Cash</option>
                          <option value="card">Card</option>
                          <option value="mobile_money">Mobile Money</option>
                          <option value="bank_transfer">Bank Transfer</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Linked Booking</label>
                        <select value={newPayment.booking_id} onChange={e => setNewPayment({ ...newPayment, booking_id: e.target.value })}>
                          <option value="">— Select booking (optional) —</option>
                          {bookings.map(b => (
                            <option key={b.id} value={b.id}>{b.name} — {b.service} — {b.date}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Status</label>
                        <select value={newPayment.status} onChange={e => setNewPayment({ ...newPayment, status: e.target.value })}>
                          <option value="paid">Paid</option>
                          <option value="pending">Pending</option>
                          <option value="partial">Partial</option>
                        </select>
                      </div>
                      <div className="form-submit">
                        <button type="submit">Record Payment</button>
                      </div>
                    </div>
                  </form>
                </div>

                {/* PAYMENTS TABLE */}
                {payments.length === 0 ? (
                  <p style={{ color: 'var(--gray)', textAlign: 'center', padding: '3rem' }}>No payments recorded yet.</p>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(201,168,76,0.3)' }}>
                          {['Customer', 'Email', 'Amount', 'Method', 'Status', 'Date', 'Actions'].map(h => (
                            <th key={h} style={{ padding: '0.8rem 1rem', textAlign: 'left', color: 'var(--gold)', fontSize: '0.75rem', letterSpacing: '1.5px', textTransform: 'uppercase' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map(p => (
                          <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '0.8rem 1rem', color: 'var(--white)' }}>{p.customer_name}</td>
                            <td style={{ padding: '0.8rem 1rem', color: 'var(--gray)' }}>{p.customer_email || '—'}</td>
                            <td style={{ padding: '0.8rem 1rem', color: 'var(--gold)', fontWeight: '500' }}>RWF {p.amount}</td>
                            <td style={{ padding: '0.8rem 1rem', color: 'var(--gray)', textTransform: 'capitalize' }}>{p.method}</td>
                            <td style={{ padding: '0.8rem 1rem' }}>
                              <select value={p.status} onChange={e => updatePaymentStatus(p.id, e.target.value)}
                                style={{ background: 'var(--dark2)', color: p.status === 'paid' ? '#4CAF50' : p.status === 'partial' ? '#FF9800' : 'var(--gray)', border: '1px solid rgba(201,168,76,0.2)', padding: '0.2rem 0.4rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                                <option value="paid">Paid</option>
                                <option value="pending">Pending</option>
                                <option value="partial">Partial</option>
                              </select>
                            </td>
                            <td style={{ padding: '0.8rem 1rem', color: 'var(--gray)' }}>{new Date(p.created_at).toLocaleDateString()}</td>
                            <td style={{ padding: '0.8rem 1rem' }}>
                              <button onClick={() => deletePayment(p.id)} style={{ background: 'rgba(244,67,54,0.15)', color: '#f44336', border: '1px solid #f44336', padding: '0.3rem 0.6rem', fontSize: '0.7rem', cursor: 'pointer' }}>🗑</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* =================== PROMOS TAB =================== */}
            {tab === 'promos' && (
              <div>
                <div style={{ background: 'var(--dark)', border: '1px solid rgba(201,168,76,0.2)', padding: '2rem', marginBottom: '2rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--gold)', marginBottom: '1.5rem' }}>Add New Promo</h3>
                  {promoMsg && <div style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid var(--gold)', color: 'var(--gold)', padding: '0.8rem', marginBottom: '1rem', fontSize: '0.85rem' }}>{promoMsg}</div>}
                  <form onSubmit={addPromo}>
                    <div className="form-grid">
                      <div className="form-group"><label>Tag</label><input value={newPromo.tag} onChange={e => setNewPromo({ ...newPromo, tag: e.target.value })} placeholder="Limited Time" /></div>
                      <div className="form-group"><label>Promo Code</label><input value={newPromo.code} onChange={e => setNewPromo({ ...newPromo, code: e.target.value })} placeholder="SAVE20" /></div>
                      <div className="form-group full"><label>Title</label><input value={newPromo.title} onChange={e => setNewPromo({ ...newPromo, title: e.target.value })} placeholder="Grand Opening Special" /></div>
                      <div className="form-group full"><label>Description</label><textarea value={newPromo.description} onChange={e => setNewPromo({ ...newPromo, description: e.target.value })} placeholder="Describe the promo..." /></div>
                      <div className="form-group full"><label>Expiry</label><input value={newPromo.expiry} onChange={e => setNewPromo({ ...newPromo, expiry: e.target.value })} placeholder="e.g. Expires April 30, 2026" /></div>
                      <div className="form-submit"><button type="submit">Add Promo</button></div>
                    </div>
                  </form>
                </div>
                <div className="promos-grid">
                  {promos.length === 0 ? (
                    <p style={{ color: 'var(--gray)' }}>No promos yet.</p>
                  ) : promos.map(p => (
                    <div className="promo-card" key={p.id}>
                      <span className="promo-tag">{p.tag}</span>
                      <h3 className="promo-title">{p.title}</h3>
                      <p className="promo-desc">{p.description}</p>
                      <div style={{ background: 'rgba(201,168,76,0.08)', border: '1px dashed rgba(201,168,76,0.4)', padding: '0.6rem 1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--gold)', letterSpacing: '2px', fontSize: '0.9rem' }}>{p.code}</span>
                      </div>
                      <p className="promo-expiry">⏳ {p.expiry}</p>
                      <button onClick={() => deletePromo(p.id)} style={{ marginTop: '1rem', background: 'rgba(244,67,54,0.1)', color: '#f44336', border: '1px solid #f44336', padding: '0.4rem 1rem', fontSize: '0.75rem', cursor: 'pointer' }}>Delete</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* =================== STAFF TAB =================== */}
            {tab === 'staff' && (
              <div>
                <div style={{ background: 'var(--dark)', border: '1px solid rgba(201,168,76,0.2)', padding: '2rem', marginBottom: '2rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--gold)', marginBottom: '1.5rem' }}>Add Staff Member</h3>
                  {staffMsg && <div style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid var(--gold)', color: 'var(--gold)', padding: '0.8rem', marginBottom: '1rem', fontSize: '0.85rem' }}>{staffMsg}</div>}
                  <form onSubmit={addStaff}>
                    <div className="form-grid">
                      <div className="form-group"><label>Full Name *</label><input value={newStaff.name} onChange={e => setNewStaff({ ...newStaff, name: e.target.value })} placeholder="e.g. John Doe" /></div>
                      <div className="form-group"><label>Email *</label><input type="email" value={newStaff.email} onChange={e => setNewStaff({ ...newStaff, email: e.target.value })} placeholder="john@email.com" /></div>
                      <div className="form-group"><label>Phone</label><input value={newStaff.phone} onChange={e => setNewStaff({ ...newStaff, phone: e.target.value })} placeholder="+250 000 000 000" /></div>
                      <div className="form-group">
                        <label>Role</label>
                        <select value={newStaff.role} onChange={e => setNewStaff({ ...newStaff, role: e.target.value })}>
                          <option value="worker">Worker</option>
                          <option value="manager">Manager</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      <div className="form-submit"><button type="submit">Add Staff</button></div>
                    </div>
                  </form>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                  {staff.length === 0 ? (
                    <p style={{ color: 'var(--gray)' }}>No staff added yet.</p>
                  ) : staff.map(s => (
                    <div key={s.id} style={{ background: 'var(--dark)', border: `1px solid ${s.active ? 'rgba(201,168,76,0.2)' : 'rgba(255,255,255,0.05)'}`, padding: '1.5rem', position: 'relative' }}>
                      {!s.active && <span style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(244,67,54,0.2)', color: '#f44336', fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>INACTIVE</span>}
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👤</div>
                      <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--white)', marginBottom: '0.3rem' }}>{s.name}</h4>
                      <p style={{ color: 'var(--gray)', fontSize: '0.82rem', marginBottom: '0.2rem' }}>{s.email}</p>
                      <p style={{ color: 'var(--gray)', fontSize: '0.82rem', marginBottom: '0.8rem' }}>{s.phone || '—'}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ background: 'rgba(201,168,76,0.15)', color: 'var(--gold)', padding: '0.2rem 0.6rem', fontSize: '0.72rem', letterSpacing: '1px', textTransform: 'uppercase' }}>{s.role}</span>
                        <span style={{ color: 'var(--gray)', fontSize: '0.8rem' }}>✅ {s.jobs_completed || 0} jobs</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => toggleStaffActive(s.id, s.active)} style={{ flex: 1, background: s.active ? 'rgba(244,67,54,0.1)' : 'rgba(76,175,80,0.1)', color: s.active ? '#f44336' : '#4CAF50', border: `1px solid ${s.active ? '#f44336' : '#4CAF50'}`, padding: '0.4rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                          {s.active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button onClick={() => deleteStaff(s.id)} style={{ flex: 1, background: 'rgba(244,67,54,0.1)', color: '#f44336', border: '1px solid #f44336', padding: '0.4rem', fontSize: '0.75rem', cursor: 'pointer' }}>🗑 Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* =================== INVENTORY TAB =================== */}
            {tab === 'inventory' && (
              <div>
                {lowStockItems.length > 0 && (
                  <div style={{ background: 'rgba(244,67,54,0.1)', border: '1px solid #f44336', padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                    <span style={{ color: '#f44336', fontSize: '0.85rem' }}>{lowStockItems.length} item{lowStockItems.length > 1 ? 's' : ''} low on stock: {lowStockItems.map(i => i.name).join(', ')}</span>
                  </div>
                )}
                {editInventory && (
                  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                    <div style={{ background: 'var(--dark)', border: '1px solid rgba(201,168,76,0.3)', padding: '2rem', width: '100%', maxWidth: '480px' }}>
                      <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)', fontSize: '1.5rem', marginBottom: '1.5rem' }}>Edit Item</h3>
                      <div className="form-grid">
                        <div className="form-group full"><label>Item Name</label><input value={editInventory.name} onChange={e => setEditInventory({ ...editInventory, name: e.target.value })} /></div>
                        <div className="form-group"><label>Quantity</label><input type="number" value={editInventory.quantity} onChange={e => setEditInventory({ ...editInventory, quantity: e.target.value })} /></div>
                        <div className="form-group"><label>Unit</label><input value={editInventory.unit || ''} onChange={e => setEditInventory({ ...editInventory, unit: e.target.value })} placeholder="e.g. bottles, pcs" /></div>
                        <div className="form-group"><label>Low Stock Alert</label><input type="number" value={editInventory.low_stock_alert || ''} onChange={e => setEditInventory({ ...editInventory, low_stock_alert: e.target.value })} placeholder="5" /></div>
                        <div className="form-group"><label>Supplier</label><input value={editInventory.supplier || ''} onChange={e => setEditInventory({ ...editInventory, supplier: e.target.value })} placeholder="Supplier name" /></div>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                        <button onClick={saveEditInventory} style={{ flex: 1, padding: '0.9rem', background: 'var(--gold)', color: 'var(--black)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', letterSpacing: '1px' }}>Save</button>
                        <button onClick={() => setEditInventory(null)} style={{ flex: 1, padding: '0.9rem', background: 'transparent', color: 'var(--gray)', border: '1px solid var(--gray)', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Cancel</button>
                      </div>
                    </div>
                  </div>
                )}
                <div style={{ background: 'var(--dark)', border: '1px solid rgba(201,168,76,0.2)', padding: '2rem', marginBottom: '2rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--gold)', marginBottom: '1.5rem' }}>Add Inventory Item</h3>
                  {inventoryMsg && <div style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid var(--gold)', color: 'var(--gold)', padding: '0.8rem', marginBottom: '1rem', fontSize: '0.85rem' }}>{inventoryMsg}</div>}
                  <form onSubmit={addInventoryItem}>
                    <div className="form-grid">
                      <div className="form-group"><label>Item Name *</label><input value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} placeholder="e.g. Car Shampoo" /></div>
                      <div className="form-group"><label>Quantity *</label><input type="number" value={newItem.quantity} onChange={e => setNewItem({ ...newItem, quantity: e.target.value })} placeholder="10" /></div>
                      <div className="form-group"><label>Unit</label><input value={newItem.unit} onChange={e => setNewItem({ ...newItem, unit: e.target.value })} placeholder="bottles / pcs / kg" /></div>
                      <div className="form-group"><label>Low Stock Alert</label><input type="number" value={newItem.low_stock_alert} onChange={e => setNewItem({ ...newItem, low_stock_alert: e.target.value })} placeholder="5" /></div>
                      <div className="form-group full"><label>Supplier</label><input value={newItem.supplier} onChange={e => setNewItem({ ...newItem, supplier: e.target.value })} placeholder="Supplier name" /></div>
                      <div className="form-submit"><button type="submit">Add Item</button></div>
                    </div>
                  </form>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(201,168,76,0.3)' }}>
                        {['Item', 'Qty', 'Unit', 'Low Alert', 'Supplier', 'Status', 'Actions'].map(h => (
                          <th key={h} style={{ padding: '0.8rem 1rem', textAlign: 'left', color: 'var(--gold)', fontSize: '0.75rem', letterSpacing: '1.5px', textTransform: 'uppercase' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {inventory.map(i => (
                        <tr key={i.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '0.8rem 1rem', color: 'var(--white)' }}>{i.name}</td>
                          <td style={{ padding: '0.8rem 1rem', color: i.quantity <= (i.low_stock_alert || 5) ? '#f44336' : 'var(--gold)', fontWeight: '500' }}>{i.quantity}</td>
                          <td style={{ padding: '0.8rem 1rem', color: 'var(--gray)' }}>{i.unit || '—'}</td>
                          <td style={{ padding: '0.8rem 1rem', color: 'var(--gray)' }}>{i.low_stock_alert || 5}</td>
                          <td style={{ padding: '0.8rem 1rem', color: 'var(--gray)' }}>{i.supplier || '—'}</td>
                          <td style={{ padding: '0.8rem 1rem' }}>
                            <span style={{ color: i.quantity <= (i.low_stock_alert || 5) ? '#f44336' : '#4CAF50', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                              {i.quantity <= (i.low_stock_alert || 5) ? '⚠ Low' : '✓ OK'}
                            </span>
                          </td>
                          <td style={{ padding: '0.8rem 1rem' }}>
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                              <button onClick={() => setEditInventory(i)} style={{ background: 'rgba(201,168,76,0.15)', color: 'var(--gold)', border: '1px solid var(--gold)', padding: '0.3rem 0.5rem', fontSize: '0.7rem', cursor: 'pointer' }}>✏️</button>
                              <button onClick={() => deleteInventoryItem(i.id)} style={{ background: 'rgba(244,67,54,0.15)', color: '#f44336', border: '1px solid #f44336', padding: '0.3rem 0.5rem', fontSize: '0.7rem', cursor: 'pointer' }}>🗑</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {inventory.length === 0 && <p style={{ color: 'var(--gray)', textAlign: 'center', padding: '3rem' }}>No inventory items yet.</p>}
                </div>
              </div>
            )}

            {/* =================== GALLERY TAB =================== */}
            {tab === 'gallery' && (
              <div>
                <div style={{ background: 'var(--dark)', border: '1px solid rgba(201,168,76,0.2)', padding: '2rem', marginBottom: '2rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--gold)', marginBottom: '1.5rem' }}>Add Gallery Item</h3>
                  {galleryMsg && <div style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid var(--gold)', color: 'var(--gold)', padding: '0.8rem', marginBottom: '1rem', fontSize: '0.85rem' }}>{galleryMsg}</div>}
                  <form onSubmit={addGalleryItem}>
                    <div className="form-grid">
                      <div className="form-group"><label>Title</label><input value={newGalleryItem.title} onChange={e => setNewGalleryItem({ ...newGalleryItem, title: e.target.value })} placeholder="e.g. Full Detail Transformation" /></div>
                      <div className="form-group"><label>Service</label><input value={newGalleryItem.service} onChange={e => setNewGalleryItem({ ...newGalleryItem, service: e.target.value })} placeholder="e.g. Premium Detail" /></div>
                      <div className="form-group full"><label>Caption</label><textarea value={newGalleryItem.caption} onChange={e => setNewGalleryItem({ ...newGalleryItem, caption: e.target.value })} placeholder="Optional description..." style={{ minHeight: '60px' }} /></div>
                      <div className="form-group full">
                        <label>Before Image</label>
                        <input value={newGalleryItem.before_url} onChange={e => setNewGalleryItem({ ...newGalleryItem, before_url: e.target.value })} placeholder="Paste URL or upload below" />
                        <input type="file" accept="image/*" style={{ marginTop: '0.5rem', background: 'var(--dark2)', border: '1px solid rgba(201,168,76,0.2)', color: 'var(--gray)', padding: '0.5rem', width: '100%', fontSize: '0.82rem' }}
                          onChange={async e => {
                            const url = await uploadGalleryImage(e.target.files[0], 'before')
                            if (url) setNewGalleryItem(prev => ({ ...prev, before_url: url }))
                          }}
                        />
                      </div>
                      <div className="form-group full">
                        <label>After Image</label>
                        <input value={newGalleryItem.after_url} onChange={e => setNewGalleryItem({ ...newGalleryItem, after_url: e.target.value })} placeholder="Paste URL or upload below" />
                        <input type="file" accept="image/*" style={{ marginTop: '0.5rem', background: 'var(--dark2)', border: '1px solid rgba(201,168,76,0.2)', color: 'var(--gray)', padding: '0.5rem', width: '100%', fontSize: '0.82rem' }}
                          onChange={async e => {
                            const url = await uploadGalleryImage(e.target.files[0], 'after')
                            if (url) setNewGalleryItem(prev => ({ ...prev, after_url: url }))
                          }}
                        />
                      </div>
                      <div className="form-submit">
                        <button type="submit" disabled={galleryUploading} style={{ opacity: galleryUploading ? 0.6 : 1 }}>
                          {galleryUploading ? 'Uploading...' : 'Add to Gallery'}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
                {gallery.length === 0 ? (
                  <p style={{ color: 'var(--gray)', textAlign: 'center', padding: '3rem' }}>No gallery items yet.</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                    {gallery.map(item => (
                      <div key={item.id} style={{ background: 'var(--dark)', border: '1px solid rgba(201,168,76,0.15)', overflow: 'hidden' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px' }}>
                          {item.before_url && (
                            <div style={{ position: 'relative' }}>
                              <img src={item.before_url} alt="Before" style={{ width: '100%', height: '150px', objectFit: 'cover', display: 'block' }} />
                              <span style={{ position: 'absolute', bottom: '0.5rem', left: '0.5rem', background: 'rgba(0,0,0,0.7)', color: 'var(--gray)', fontSize: '0.7rem', padding: '0.2rem 0.5rem', letterSpacing: '1px' }}>BEFORE</span>
                            </div>
                          )}
                          {item.after_url && (
                            <div style={{ position: 'relative' }}>
                              <img src={item.after_url} alt="After" style={{ width: '100%', height: '150px', objectFit: 'cover', display: 'block' }} />
                              <span style={{ position: 'absolute', bottom: '0.5rem', left: '0.5rem', background: 'rgba(201,168,76,0.8)', color: 'var(--black)', fontSize: '0.7rem', padding: '0.2rem 0.5rem', letterSpacing: '1px' }}>AFTER</span>
                            </div>
                          )}
                        </div>
                        <div style={{ padding: '1rem 1.2rem' }}>
                          <p style={{ color: 'var(--white)', fontWeight: '500', marginBottom: '0.2rem' }}>{item.title || 'Detail Job'}</p>
                          {item.service && <p style={{ color: 'var(--gold)', fontSize: '0.8rem' }}>{item.service}</p>}
                          {item.caption && <p style={{ color: 'var(--gray)', fontSize: '0.82rem', marginTop: '0.3rem' }}>{item.caption}</p>}
                          <button onClick={() => deleteGalleryItem(item.id)} style={{ marginTop: '0.8rem', background: 'rgba(244,67,54,0.1)', color: '#f44336', border: '1px solid #f44336', padding: '0.4rem 1rem', fontSize: '0.75rem', cursor: 'pointer', width: '100%' }}>🗑 Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* =================== REPORTS TAB =================== */}
            {tab === 'reports' && (
              <div>
                {/* REVENUE OVERVIEW */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                  {[
                    { label: 'Total Revenue', value: `RWF ${totalRevenue.toLocaleString()}`, color: '#4CAF50' },
                    { label: 'Pending Revenue', value: `RWF ${pendingRevenue.toLocaleString()}`, color: '#FF9800' },
                    { label: 'Total Bookings', value: bookings.length, color: 'var(--gold)' },
                    { label: 'Completed Jobs', value: bookings.filter(b => b.status === 'completed').length, color: '#2196F3' },
                    { label: 'Cancellations', value: bookings.filter(b => b.status === 'cancelled').length, color: '#f44336' },
                    { label: 'No Shows', value: bookings.filter(b => b.status === 'no-show').length, color: '#9E9E9E' },
                  ].map((s, i) => (
                    <div key={i} style={{ background: 'var(--dark)', border: `1px solid ${s.color}40`, padding: '1.5rem', textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: s.color }}>{s.value}</div>
                      <div style={{ color: 'var(--gray)', fontSize: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '0.3rem' }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                  {/* TOP SERVICES */}
                  <div style={{ background: 'var(--dark)', border: '1px solid rgba(201,168,76,0.2)', padding: '1.5rem' }}>
                    <h4 style={{ color: 'var(--gold)', letterSpacing: '2px', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '1.2rem' }}>🏆 Most Popular Services</h4>
                    {topServices.length === 0 ? <p style={{ color: 'var(--gray)', fontSize: '0.85rem' }}>No data yet.</p> : topServices.map((s, i) => (
                      <div key={i} style={{ marginBottom: '0.8rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                          <span style={{ color: 'var(--white)', fontSize: '0.85rem' }}>{s.name}</span>
                          <span style={{ color: 'var(--gold)', fontSize: '0.85rem' }}>{s.count} bookings</span>
                        </div>
                        <div style={{ background: 'var(--dark2)', height: '4px', borderRadius: '2px' }}>
                          <div style={{ background: 'var(--gold)', height: '100%', width: `${topServices[0].count ? (s.count / topServices[0].count) * 100 : 0}%`, borderRadius: '2px', transition: 'width 0.5s' }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* REVENUE BY MONTH */}
                  <div style={{ background: 'var(--dark)', border: '1px solid rgba(201,168,76,0.2)', padding: '1.5rem' }}>
                    <h4 style={{ color: 'var(--gold)', letterSpacing: '2px', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '1.2rem' }}>📅 Revenue by Month</h4>
                    {Object.keys(revenueByMonth).length === 0 ? <p style={{ color: 'var(--gray)', fontSize: '0.85rem' }}>No payment data yet.</p> : Object.entries(revenueByMonth).map(([month, amount]) => (
                      <div key={month} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ color: 'var(--gray)', fontSize: '0.85rem' }}>{month}</span>
                        <span style={{ color: '#4CAF50', fontSize: '0.85rem', fontWeight: '500' }}>RWF {amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* BOOKING STATUS BREAKDOWN */}
                <div style={{ background: 'var(--dark)', border: '1px solid rgba(201,168,76,0.2)', padding: '1.5rem' }}>
                  <h4 style={{ color: 'var(--gold)', letterSpacing: '2px', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '1.2rem' }}>📊 Booking Status Breakdown</h4>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    {[['pending', 'var(--gold)'], ['confirmed', '#4CAF50'], ['completed', '#2196F3'], ['cancelled', '#f44336'], ['no-show', '#FF9800']].map(([status, color]) => {
                      const count = bookings.filter(b => b.status === status).length
                      const pct = bookings.length ? Math.round((count / bookings.length) * 100) : 0
                      return (
                        <div key={status} style={{ flex: 1, minWidth: '120px', background: 'var(--dark2)', padding: '1rem', textAlign: 'center', border: `1px solid ${color}30` }}>
                          <div style={{ color, fontSize: '1.5rem', fontFamily: 'var(--font-display)' }}>{pct}%</div>
                          <div style={{ color: 'var(--gray)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{status}</div>
                          <div style={{ color, fontSize: '0.85rem', marginTop: '0.2rem' }}>{count} jobs</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* =================== REVIEWS TAB =================== */}
            {tab === 'reviews' && (
              <div>
                {/* STATS */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                  {[
                    { label: 'Total Reviews', value: reviews.length, color: 'var(--gold)' },
                    { label: 'Avg Rating', value: reviews.length ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1) + ' ⭐' : '—', color: '#FF9800' },
                    { label: '5 Star', value: reviews.filter(r => r.rating === 5).length, color: '#4CAF50' },
                    { label: '1-2 Star', value: reviews.filter(r => r.rating <= 2).length, color: '#f44336' },
                    { label: 'Unanswered', value: reviews.filter(r => !r.admin_reply).length, color: '#9E9E9E' },
                  ].map((s, i) => (
                    <div key={i} style={{ background: 'var(--dark)', border: `1px solid ${s.color}40`, padding: '1.2rem', textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: s.color }}>{s.value}</div>
                      <div style={{ color: 'var(--gray)', fontSize: '0.72rem', letterSpacing: '1px', textTransform: 'uppercase' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                {reviews.length === 0 ? (
                  <p style={{ color: 'var(--gray)', textAlign: 'center', padding: '3rem' }}>No reviews submitted yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {reviews.map(r => (
                      <ReviewCard key={r.id} review={r} onDelete={deleteReview} onReply={replyToReview} />
                    ))}
                  </div>
                )}
              </div>
            )}
            {/* =================== SETTINGS TAB =================== */}
            {tab === 'settings' && (
              <div style={{ maxWidth: '600px' }}>
                <p className="section-label">Business Info</p>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--white)', marginBottom: '0.5rem' }}>Contact Settings</h3>
                <p style={{ color: 'var(--gray)', fontSize: '0.85rem', marginBottom: '2rem' }}>Changes here reflect immediately on the website — Contact page, WhatsApp button, and footer.</p>
                {settingsMsg && <div style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid var(--gold)', color: 'var(--gold)', padding: '0.8rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>{settingsMsg}</div>}
                <form onSubmit={saveSettings}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input value={settings.phone || ''} onChange={e => setSettings({ ...settings, phone: e.target.value })} placeholder="+250 000 000 000" />
                    </div>
                    <div className="form-group">
                      <label>WhatsApp Number</label>
                      <input value={settings.whatsapp || ''} onChange={e => setSettings({ ...settings, whatsapp: e.target.value })} placeholder="+250000000000 (no spaces)" />
                    </div>
                    <div className="form-group full">
                      <label>Email Address</label>
                      <input type="email" value={settings.email || ''} onChange={e => setSettings({ ...settings, email: e.target.value })} placeholder="hello@idetaildynasty.com" />
                    </div>
                    <div className="form-group full">
                      <label>Location / Address</label>
                      <input value={settings.location || ''} onChange={e => setSettings({ ...settings, location: e.target.value })} placeholder="Kigali, Rwanda" />
                    </div>
                    <div className="form-group full">
                      <label>Business Hours</label>
                      <textarea value={settings.business_hours || ''} onChange={e => setSettings({ ...settings, business_hours: e.target.value })} placeholder="Mon–Fri: 8am–6pm&#10;Sat: 8am–4pm&#10;Sun: Closed" style={{ minHeight: '100px' }} />
                    </div>

                    {/* FEATURE FLAGS */}
                    <div className="form-group full" style={{ marginTop: '1rem' }}>
                      <label style={{ marginBottom: '1rem', display: 'block' }}>Feature Toggles</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.8rem' }}>
                        {[
                          { key: 'enable_reviews',          label: '⭐ Reviews Page',         desc: 'Customers can read & leave reviews' },
                          { key: 'enable_gallery',          label: '🖼️ Gallery Page',          desc: 'Before/after photo gallery' },
                          { key: 'enable_promos',           label: '🎁 Promos Page',           desc: 'Show active promotions' },
                          { key: 'enable_whatsapp',         label: '💬 WhatsApp Button',       desc: 'Floating WhatsApp chat button' },
                          { key: 'enable_dashboard',        label: '📅 Customer Dashboard',    desc: 'My Bookings page for logged-in users' },
                          { key: 'enable_photo_upload',     label: '📸 Photo Upload',          desc: 'Photo upload field in booking form' },
                          { key: 'enable_price_calculator', label: '💰 Price Calculator',      desc: 'Price estimator on services page' },
                        ].map(({ key, label, desc }) => (
                          <div key={key} onClick={() => setSettings({ ...settings, [key]: !settings[key] })} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            background: 'var(--dark2)', border: `1px solid ${settings[key] ? 'rgba(201,168,76,0.4)' : 'rgba(255,255,255,0.08)'}`,
                            padding: '0.9rem 1.2rem', cursor: 'pointer', transition: 'border-color 0.2s'
                          }}>
                            <div>
                              <p style={{ color: settings[key] ? 'var(--white)' : 'var(--gray)', fontSize: '0.88rem', marginBottom: '0.2rem' }}>{label}</p>
                              <p style={{ color: 'var(--gray)', fontSize: '0.75rem' }}>{desc}</p>
                            </div>
                            <div style={{
                              width: '42px', height: '24px', borderRadius: '12px',
                              background: settings[key] ? 'var(--gold)' : 'var(--dark)',
                              border: `1px solid ${settings[key] ? 'var(--gold)' : 'rgba(255,255,255,0.15)'}`,
                              position: 'relative', transition: 'background 0.2s', flexShrink: 0, marginLeft: '1rem'
                            }}>
                              <div style={{
                                position: 'absolute', top: '3px',
                                left: settings[key] ? '20px' : '3px',
                                width: '16px', height: '16px', borderRadius: '50%',
                                background: settings[key] ? 'var(--black)' : 'var(--gray)',
                                transition: 'left 0.2s'
                              }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="form-submit">
                      <button type="submit">Save Settings</button>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </>
        )}
      </div>
      <div style={{ height: '4rem' }} />
    </div>
  )
}


