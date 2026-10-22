import { useEffect, useMemo, useState } from 'react'
import {
  Activity, Archive, ArrowDownRight, ArrowRight, Bell, CalendarDays, Check,
  CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, Clock3,
  FileText, Filter, FolderOpen, LayoutDashboard, LifeBuoy, MoreHorizontal,
  Plus, Search, Settings2, ShieldCheck, Sparkles, Tag, Trash2, Upload,
  WalletCards, X, AlertCircle, Menu, Pencil, ExternalLink
} from 'lucide-react'

type Category = 'Identity' | 'Education' | 'Finance' | 'Health' | 'Home' | 'Other'
type LifeDocument = {
  id: string
  name: string
  category: Category
  issuer: string
  reference: string
  dueDate: string
  notes: string
  status: 'Active' | 'Archived'
  createdAt: string
}

const STORAGE_KEY = 'lifeadmin.documents.v1'
const categories: Category[] = ['Identity', 'Education', 'Finance', 'Health', 'Home', 'Other']
const todayISO = () => new Date().toISOString().slice(0, 10)
const plusDays = (days: number) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}
const seedDocuments: LifeDocument[] = [
  { id: 'seed-1', name: 'Passport', category: 'Identity', issuer: 'Passport Office', reference: '•••• 4821', dueDate: plusDays(24), notes: 'Check renewal requirements before applying.', status: 'Active', createdAt: todayISO() },
  { id: 'seed-2', name: 'Vehicle insurance', category: 'Finance', issuer: 'Insurance provider', reference: 'Policy ending 0193', dueDate: plusDays(6), notes: 'Compare renewal options.', status: 'Active', createdAt: todayISO() },
  { id: 'seed-3', name: 'University ID', category: 'Education', issuer: 'University', reference: 'Student document', dueDate: plusDays(58), notes: '', status: 'Active', createdAt: todayISO() },
  { id: 'seed-4', name: 'Health check-up', category: 'Health', issuer: 'Clinic', reference: 'Annual reminder', dueDate: plusDays(-2), notes: 'Reschedule appointment.', status: 'Active', createdAt: todayISO() },
  { id: 'seed-5', name: 'Rental agreement', category: 'Home', issuer: 'Landlord / agency', reference: 'Agreement copy', dueDate: plusDays(91), notes: 'Review terms before renewal.', status: 'Active', createdAt: todayISO() },
]
const categoryIcon: Record<Category, typeof FileText> = {
  Identity: ShieldCheck, Education: WalletCards, Finance: Activity, Health: CheckCircle2, Home: FolderOpen, Other: FileText,
}
const categoryColor: Record<Category, string> = {
  Identity: 'violet', Education: 'blue', Finance: 'green', Health: 'rose', Home: 'amber', Other: 'slate',
}
function loadDocuments(): LifeDocument[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) as LifeDocument[] : seedDocuments
  } catch {
    return seedDocuments
  }
}
function dateDiff(dateString: string) {
  const target = new Date(dateString + 'T00:00:00')
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return Math.ceil((target.getTime() - now.getTime()) / 86400000)
}
function formatDate(dateString: string) {
  if (!dateString) return 'No date set'
  return new Date(dateString + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
function dueLabel(dateString: string) {
  const diff = dateDiff(dateString)
  if (diff < 0) return `${Math.abs(diff)} day${diff === -1 ? '' : 's'} overdue`
  if (diff === 0) return 'Due today'
  if (diff === 1) return 'Due tomorrow'
  return `In ${diff} days`
}

export default function App() {
  const [documents, setDocuments] = useState<LifeDocument[]>(loadDocuments)
  const [activePage, setActivePage] = useState('Overview')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All categories')
  const [showArchived, setShowArchived] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<LifeDocument | null>(null)
  const [mobileNav, setMobileNav] = useState(false)
  const [toast, setToast] = useState('')
  const [form, setForm] = useState({ name: '', category: 'Identity' as Category, issuer: '', reference: '', dueDate: '', notes: '' })

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(documents)) }, [documents])
  useEffect(() => {
    if (!toast) return
    const id = window.setTimeout(() => setToast(''), 2600)
    return () => window.clearTimeout(id)
  }, [toast])

  const activeDocuments = documents.filter(d => d.status === 'Active')
  const overdue = activeDocuments.filter(d => d.dueDate && dateDiff(d.dueDate) < 0)
  const dueSoon = activeDocuments.filter(d => d.dueDate && dateDiff(d.dueDate) >= 0 && dateDiff(d.dueDate) <= 30)
  const upcoming = useMemo(() => [...activeDocuments].filter(d => d.dueDate).sort((a, b) => a.dueDate.localeCompare(b.dueDate)), [documents])
  const filtered = useMemo(() => documents.filter(d => {
    const matchesSearch = [d.name, d.issuer, d.reference, d.notes, d.category].join(' ').toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === 'All categories' || d.category === categoryFilter
    const matchesStatus = showArchived ? d.status === 'Archived' : d.status === 'Active'
    const matchesPage = activePage === 'Documents' || activePage === 'Overview' || activePage === 'Archive' || activePage === d.category
    return matchesSearch && matchesCategory && matchesStatus && matchesPage
  }), [documents, search, categoryFilter, showArchived, activePage])

  function openNew() {
    setEditing(null)
    setForm({ name: '', category: 'Identity', issuer: '', reference: '', dueDate: '', notes: '' })
    setModalOpen(true)
  }
  function openEdit(doc: LifeDocument) {
    setEditing(doc)
    setForm({ name: doc.name, category: doc.category, issuer: doc.issuer, reference: doc.reference, dueDate: doc.dueDate, notes: doc.notes })
    setModalOpen(true)
  }
  function saveDocument(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const base = { ...form, status: 'Active' as const }
    if (editing) {
      setDocuments(prev => prev.map(d => d.id === editing.id ? { ...d, ...base } : d))
      setToast('Document details updated')
    } else {
      const newDoc: LifeDocument = { ...base, id: crypto.randomUUID(), createdAt: todayISO() }
      setDocuments(prev => [newDoc, ...prev])
      setToast('Document added to your vault')
    }
    setModalOpen(false)
  }
  function archiveDocument(doc: LifeDocument) {
    setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, status: d.status === 'Active' ? 'Archived' : 'Active' } : d))
    setToast(doc.status === 'Active' ? 'Document moved to archive' : 'Document restored')
  }
  function deleteDocument(doc: LifeDocument) {
    if (!window.confirm(`Permanently delete “${doc.name}” from LifeAdmin?`)) return
    setDocuments(prev => prev.filter(d => d.id !== doc.id))
    setToast('Document removed')
  }
  function exportData() {
    const blob = new Blob([JSON.stringify(documents, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'lifeadmin-backup.json'
    anchor.click()
    URL.revokeObjectURL(url)
    setToast('Backup downloaded')
  }

  const pageTitle = activePage === 'Overview' ? 'Your life, in order.' : activePage === 'Archive' ? 'Archived documents' : activePage
  const pageSubtitle = activePage === 'Overview' ? 'A calmer way to keep track of the important things.' : activePage === 'Archive' ? 'A safe place for documents you are no longer tracking.' : 'Keep your details and important dates in one place.'
  const navItems = [
    { label: 'Overview', icon: LayoutDashboard },
    { label: 'Documents', icon: FileText },
    { label: 'Identity', icon: ShieldCheck },
    { label: 'Education', icon: WalletCards },
    { label: 'Finance', icon: Activity },
    { label: 'Health', icon: CheckCircle2 },
    { label: 'Home', icon: FolderOpen },
    { label: 'Archive', icon: Archive },
  ]

  return (
    <div className="app-shell">
      {mobileNav && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMobileNav(false)} />}
      <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark"><span className="brand-spark">✳</span></div>
          <div><span className="brand-name">lifeadmin</span><span className="brand-caption">PERSONAL ORGANIZER</span></div>
          <button className="icon-button close-nav" onClick={() => setMobileNav(false)} aria-label="Close menu"><X size={18} /></button>
        </div>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="main-nav">
          {navItems.map(item => {
            const Icon = item.icon
            const active = activePage === item.label
            return <button key={item.label} className={`nav-item ${active ? 'nav-active' : ''}`} onClick={() => { setActivePage(item.label); setShowArchived(item.label === 'Archive'); setMobileNav(false) }}>
              <Icon size={18} strokeWidth={active ? 2.2 : 1.8} /><span>{item.label}</span>
              {item.label === 'Documents' && <span className="nav-count">{activeDocuments.length}</span>}
              {item.label === 'Archive' && documents.some(d => d.status === 'Archived') && <span className="nav-count">{documents.filter(d => d.status === 'Archived').length}</span>}
            </button>
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="tip-card">
            <div className="tip-icon"><Sparkles size={17} /></div>
            <div className="tip-title">A little peace of mind</div>
            <p>Keep renewal dates here so fewer things slip through the cracks.</p>
            <button onClick={openNew}>Add a document <ArrowRight size={14} /></button>
          </div>
          <button className="nav-item secondary-nav" onClick={exportData}><Upload size={18} /><span>Export backup</span></button>
          <div className="profile-row">
            <div className="avatar">H</div>
            <div className="profile-info"><strong>My workspace</strong><span>Personal account</span></div>
            <MoreHorizontal size={18} className="muted-icon" />
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumbs"><button className="mobile-menu icon-button" onClick={() => setMobileNav(true)} aria-label="Open navigation"><Menu size={20} /></button><span>Workspace</span><ChevronRight size={14} /><strong>{activePage}</strong></div>
          <div className="topbar-actions">
            <div className="privacy-pill"><span className="privacy-dot" /> Saved on this device</div>
            <button className="icon-button notification-button" title="Notifications" onClick={() => setToast(overdue.length ? `You have ${overdue.length} overdue item(s) to review.` : 'You are all caught up!')}><Bell size={18} />{overdue.length > 0 && <span className="notification-dot" />}</button>
            <button className="top-avatar" aria-label="Profile">H</button>
          </div>
        </header>

        <div className="page-container">
          <section className="page-heading">
            <div><div className="eyebrow"><span className="eyebrow-line" /> YOUR PERSONAL SPACE</div><h1>{pageTitle}</h1><p>{pageSubtitle}</p></div>
            <div className="heading-actions"><button className="button button-secondary" onClick={exportData}><Upload size={16} /> Export</button><button className="button button-primary" onClick={openNew}><Plus size={17} /> Add document</button></div>
          </section>

          {activePage === 'Overview' && <>
            <section className="welcome-banner">
              <div className="welcome-copy"><div className="welcome-label"><Sparkles size={14} /> YOUR WEEKLY CHECK-IN</div><h2>Make room for what matters.</h2><p>One small check-in today can save you a lot of last-minute stress tomorrow.</p><button onClick={() => { setActivePage('Documents'); setShowArchived(false) }}>Review my documents <ArrowRight size={16} /></button></div>
              <div className="welcome-art" aria-hidden="true"><div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" /><div className="art-circle"><CalendarDays size={38} /></div><div className="art-card art-card-one"><Check size={14} /><span>Renewal tracked</span></div><div className="art-card art-card-two"><Clock3 size={15} /><span>Stay ahead</span></div><span className="art-star star-one">✦</span><span className="art-star star-two">✳</span></div>
            </section>

            <section className="stats-grid">
              <div className="stat-card"><div className="stat-top"><span className="stat-icon icon-lavender"><FileText size={18} /></span><span className="stat-kicker">IN YOUR VAULT</span></div><div className="stat-number">{activeDocuments.length}<span className="stat-unit"> documents</span></div><div className="stat-foot">Your important details, together</div></div>
              <div className="stat-card"><div className="stat-top"><span className="stat-icon icon-peach"><AlertCircle size={18} /></span><span className="stat-kicker">NEEDS ATTENTION</span></div><div className="stat-number">{overdue.length}<span className="stat-unit"> overdue</span></div><div className={`stat-foot ${overdue.length ? 'foot-alert' : ''}`}>{overdue.length ? 'Worth reviewing soon' : 'Nothing overdue right now'}</div></div>
              <div className="stat-card"><div className="stat-top"><span className="stat-icon icon-mint"><CalendarDays size={18} /></span><span className="stat-kicker">NEXT 30 DAYS</span></div><div className="stat-number">{dueSoon.length}<span className="stat-unit"> upcoming</span></div><div className="stat-foot">Dates worth keeping an eye on</div></div>
              <div className="stat-card"><div className="stat-top"><span className="stat-icon icon-sky"><CheckCircle2 size={18} /></span><span className="stat-kicker">YOUR MOMENTUM</span></div><div className="stat-number">{activeDocuments.length ? Math.round((activeDocuments.length - overdue.length) / activeDocuments.length * 100) : 100}<span className="stat-unit">%</span></div><div className="stat-foot">Items not currently overdue</div></div>
            </section>

            <section className="content-grid">
              <div className="panel upcoming-panel">
                <div className="panel-header"><div><h3>Coming up</h3><p>Your next dates, at a glance</p></div><button className="text-link" onClick={() => { setActivePage('Documents'); setShowArchived(false) }}>View all <ArrowRight size={15} /></button></div>
                {upcoming.length === 0 ? <EmptyState onAdd={openNew} /> : <div className="upcoming-list">{upcoming.slice(0, 4).map(doc => {
                  const Icon = categoryIcon[doc.category]
                  const diff = dateDiff(doc.dueDate)
                  return <button className="upcoming-row" key={doc.id} onClick={() => openEdit(doc)}><div className={`doc-icon ${categoryColor[doc.category]}`}><Icon size={18} /></div><div className="upcoming-main"><strong>{doc.name}</strong><span>{doc.category} · {doc.issuer || 'No issuer added'}</span></div><div className="upcoming-date"><strong>{formatDate(doc.dueDate)}</strong><span className={diff < 0 ? 'due-overdue' : diff <= 7 ? 'due-soon' : ''}>{dueLabel(doc.dueDate)}</span></div><ChevronRight size={16} className="row-chevron" /></button>
                })}</div>}
                <div className="panel-footer"><div className="footer-check"><CheckCircle2 size={15} /> Dates are based on your local calendar</div><button onClick={openNew}><Plus size={15} /> Add a date</button></div>
              </div>
              <div className="panel categories-panel">
                <div className="panel-header"><div><h3>Your categories</h3><p>A place for every important thing</p></div><button className="icon-button small-icon" onClick={() => { setActivePage('Documents'); setShowArchived(false) }} aria-label="View categories"><MoreHorizontal size={18} /></button></div>
                <div className="category-list">{categories.map(cat => {
                  const Icon = categoryIcon[cat]
                  const count = activeDocuments.filter(d => d.category === cat).length
                  return <button key={cat} className="category-row" onClick={() => { setActivePage(cat); setCategoryFilter('All categories'); setShowArchived(false) }}><span className={`category-icon ${categoryColor[cat]}`}><Icon size={16} /></span><span className="category-name">{cat}</span><span className="category-count">{count}</span><ChevronRight size={15} className="row-chevron" /></button>
                })}</div>
                <div className="category-note"><div className="note-mark"><ShieldCheck size={16} /></div><span><strong>Your details stay with you.</strong> LifeAdmin saves data in this browser on this device.</span></div>
              </div>
            </section>
          </>}

          {activePage !== 'Overview' && <>
            <section className="list-toolbar"><div className="search-box"><Search size={17} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents, issuer, notes..." aria-label="Search documents" />{search && <button className="clear-search" onClick={() => setSearch('')} aria-label="Clear search"><X size={15} /></button>}</div><div className="toolbar-right"><div className="filter-select"><Filter size={15} /><select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} aria-label="Filter category"><option>All categories</option>{categories.map(c => <option key={c}>{c}</option>)}</select><ChevronDown size={14} /></div><button className={`button button-secondary archive-toggle ${showArchived ? 'selected-filter' : ''}`} onClick={() => { setShowArchived(v => !v); setActivePage(showArchived ? 'Documents' : 'Archive') }}><Archive size={15} /> {showArchived ? 'Show active' : 'Archive'}</button></div></section>
            <section className="panel document-panel">
              <div className="panel-header document-panel-header"><div><h3>{activePage === 'Archive' || showArchived ? 'Archived documents' : activePage === 'Documents' ? 'All documents' : `${activePage} documents`}</h3><p>{filtered.length} {filtered.length === 1 ? 'item' : 'items'} · Click a row to edit details</p></div><button className="button button-primary button-compact" onClick={openNew}><Plus size={16} /> Add new</button></div>
              {filtered.length === 0 ? <EmptyState onAdd={openNew} title="Nothing here just yet" description={search ? 'Try a different search or clear your filters.' : 'Add a document to start organizing this space.'} /> : <div className="table-wrap"><table><thead><tr><th>DOCUMENT</th><th>CATEGORY</th><th>ISSUER / REFERENCE</th><th>RENEWAL / DUE DATE</th><th>STATUS</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{filtered.map(doc => {
                const Icon = categoryIcon[doc.category]
                const diff = doc.dueDate ? dateDiff(doc.dueDate) : null
                return <tr key={doc.id}><td><button className="table-doc-name" onClick={() => openEdit(doc)}><span className={`doc-icon table-doc-icon ${categoryColor[doc.category]}`}><Icon size={17} /></span><span><strong>{doc.name}</strong><small>Added {formatDate(doc.createdAt)}</small></span></button></td><td><span className={`category-chip ${categoryColor[doc.category]}`}>{doc.category}</span></td><td><div className="issuer-cell"><span>{doc.issuer || '—'}</span><small>{doc.reference || 'No reference'}</small></div></td><td><div className="date-cell"><strong>{formatDate(doc.dueDate)}</strong><small className={diff !== null && diff < 0 ? 'due-overdue' : diff !== null && diff <= 7 ? 'due-soon' : ''}>{doc.dueDate ? dueLabel(doc.dueDate) : 'No reminder date'}</small></div></td><td><span className={`status-chip ${doc.status === 'Archived' ? 'status-archived' : diff !== null && diff < 0 ? 'status-overdue' : 'status-active'}`}><span />{doc.status === 'Archived' ? 'Archived' : diff !== null && diff < 0 ? 'Overdue' : 'Active'}</span></td><td><div className="row-actions"><button className="icon-button small-icon" title="Edit document" onClick={() => openEdit(doc)}><Pencil size={15} /></button><button className="icon-button small-icon" title={doc.status === 'Active' ? 'Archive document' : 'Restore document'} onClick={() => archiveDocument(doc)}><Archive size={15} /></button><button className="icon-button small-icon delete-action" title="Delete document" onClick={() => deleteDocument(doc)}><Trash2 size={15} /></button></div></td></tr>
              })}</tbody></table></div>}
              <div className="table-footer"><span>Private by design <ShieldCheck size={14} /></span><span>Stored locally in this browser</span></div>
            </section>
            <div className="privacy-reminder"><div><ShieldCheck size={19} /></div><p><strong>Keep sensitive information safe.</strong> LifeAdmin is a personal organizer, not an encrypted document vault. Avoid storing full ID numbers, passwords, or scans of sensitive documents here.</p></div>
          </>}

          <footer className="app-footer"><span>© 2026 LifeAdmin</span><span>Made for a little more peace of mind <span className="footer-heart">✳</span></span><button onClick={() => setToast('LifeAdmin prototype · feedback can be added in a future version')}><CircleHelp size={14} /> Help & feedback</button></footer>
        </div>
      </main>

      {modalOpen && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setModalOpen(false) }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-heading"><div><span className="modal-eyebrow"><FileText size={14} /> YOUR DOCUMENT VAULT</span><h2 id="modal-title">{editing ? 'Edit document' : 'Add a document'}</h2><p>Keep the useful details and dates in one place.</p></div><button className="icon-button" onClick={() => setModalOpen(false)} aria-label="Close dialog"><X size={19} /></button></div><form onSubmit={saveDocument}><label className="form-field"><span>Document name <b>*</b></span><input autoFocus required maxLength={80} placeholder="e.g. Passport, insurance policy" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label><div className="form-two-col"><label className="form-field"><span>Category <b>*</b></span><select required value={form.category} onChange={e => setForm({ ...form, category: e.target.value as Category })}>{categories.map(c => <option key={c}>{c}</option>)}</select></label><label className="form-field"><span>Renewal / due date</span><input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} /></label></div><label className="form-field"><span>Issuer or organization</span><input maxLength={100} placeholder="e.g. issuing authority or provider" value={form.issuer} onChange={e => setForm({ ...form, issuer: e.target.value })} /></label><label className="form-field"><span>Reference (optional)</span><input maxLength={100} placeholder="Use a nickname, not a full ID number" value={form.reference} onChange={e => setForm({ ...form, reference: e.target.value })} /></label><label className="form-field"><span>Notes</span><textarea maxLength={500} rows={3} placeholder="Any next steps or helpful reminders..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></label><div className="form-safety"><ShieldCheck size={16} /><span>Your data is saved in this browser. Don't enter passwords or full sensitive ID numbers.</span></div><div className="modal-actions"><button type="button" className="button button-secondary" onClick={() => setModalOpen(false)}>Cancel</button><button type="submit" className="button button-primary"><Check size={16} /> {editing ? 'Save changes' : 'Save document'}</button></div></form></section></div>}
      {toast && <div className="toast-message"><span className="toast-check"><Check size={15} /></span>{toast}<button onClick={() => setToast('')} aria-label="Dismiss notification"><X size={15} /></button></div>}
    </div>
  )
}

function EmptyState({ onAdd, title = 'Your space is ready', description = 'Add your first document and start keeping important dates in view.' }: { onAdd: () => void; title?: string; description?: string }) {
  return <div className="empty-state"><div className="empty-icon"><FolderOpen size={25} /></div><h3>{title}</h3><p>{description}</p><button className="button button-primary" onClick={onAdd}><Plus size={16} /> Add document</button></div>
}
