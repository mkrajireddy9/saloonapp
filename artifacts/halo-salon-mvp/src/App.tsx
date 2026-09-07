import { type ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  ArrowRight,
  Bell,
  BookOpen,
  Camera,
  Check,
  ChevronDown,
  ChevronLeft,
  CircleHelp,
  ClipboardList,
  FileText,
  Flame,
  Heart,
  Home,
  Info,
  MapPin,
  Menu,
  MoreHorizontal,
  Plus,
  RotateCcw,
  Save,
  ScanLine,
  Scissors,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  UserRound,
  X,
} from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Link, Route, Switch, Router as WouterRouter, useLocation } from 'wouter';

const queryClient = new QueryClient();

type Consultation = {
  id: number;
  customer: string;
  initials: string;
  time: string;
  service: string;
  stylist: string;
  status: 'Ready' | 'Waiting' | 'In progress';
  color: string;
};

type Draft = {
  name: string;
  phone: string;
  stylist: string;
  goal: string;
  length: string;
  texture: string;
};

type ScanView = 'Front' | 'Left' | 'Right';

const initialQueue: Consultation[] = [
  { id: 1, customer: 'Ananya Rao', initials: 'AR', time: '10:30 AM', service: 'Signature cut', stylist: 'Meera Nair', status: 'Ready', color: '#D6B168' },
  { id: 2, customer: 'Rohan Mehta', initials: 'RM', time: '11:15 AM', service: 'Texture refresh', stylist: 'Arjun S.', status: 'Waiting', color: '#B97860' },
  { id: 3, customer: 'Divya Krishnan', initials: 'DK', time: '12:00 PM', service: 'Colour consultation', stylist: 'Nidhi Rao', status: 'In progress', color: '#8AA89B' },
  { id: 4, customer: 'Kavya Iyer', initials: 'KI', time: '01:30 PM', service: 'First visit', stylist: 'Meera Nair', status: 'Ready', color: '#C39C91' },
];

function App() {
  const [location, setLocation] = useLocation();
  const [queue, setQueue] = useState(initialQueue);
  const [draft, setDraft] = useState<Draft>({
    name: '',
    phone: '',
    stylist: 'Meera Nair',
    goal: 'A cut that feels like me',
    length: 'Shoulder length',
    texture: 'Wavy',
  });
  const [scanViews, setScanViews] = useState<ScanView[]>([]);
  const [activeScanView, setActiveScanView] = useState<ScanView>('Front');
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedLook, setSelectedLook] = useState('Soft textured lob');
  const [override, setOverride] = useState('Keep the recommended shape');
  const [stylistNote, setStylistNote] = useState('');
  const [passportNote, setPassportNote] = useState('Prefers low-maintenance shapes that still feel polished for work.');
  const [passportSaved, setPassportSaved] = useState(false);
  const [toast, setToast] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 3000);
  };

  const startForCustomer = (customer?: Consultation) => {
    setDraft(customer ? {
      ...draft,
      name: customer.customer,
      phone: customer.customer === 'Ananya Rao' ? '+91 98450 12345' : '',
      stylist: customer.stylist,
      goal: customer.service === 'Colour consultation' ? 'A colour that grows out softly' : draft.goal,
    } : {
      name: '',
      phone: '',
      stylist: 'Meera Nair',
      goal: 'A cut that feels like me',
      length: 'Shoulder length',
      texture: 'Wavy',
    });
    setScanViews([]);
    setActiveScanView('Front');
    setPassportSaved(false);
    setLocation('/consultation/new');
  };

  const captureView = () => {
    if (!scanViews.includes(activeScanView)) {
      setScanViews((current) => [...current, activeScanView]);
      notify(`${activeScanView} view captured`);
    }
    const next = activeScanView === 'Front' ? 'Left' : activeScanView === 'Left' ? 'Right' : 'Front';
    setActiveScanView(next);
  };

  const runAnalysis = () => {
    if (scanViews.length < 3) {
      notify('Capture all three views to continue');
      return;
    }
    setAnalyzing(true);
    window.setTimeout(() => {
      setAnalyzing(false);
      setLocation('/report');
      notify('Visual estimate ready for your review');
    }, 1500);
  };

  const saveReport = () => {
    setPassportSaved(true);
    setQueue((current) => current.filter((item) => item.customer !== draft.name));
    notify('Consultation saved to Hair Passport');
    window.setTimeout(() => setLocation('/passport'), 450);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <div className="halo-grain min-h-[100dvh] bg-background">
            <AppShell
              location={location}
              mobileNavOpen={mobileNavOpen}
              setMobileNavOpen={setMobileNavOpen}
            >
              <RoutedErrorBoundary resetKey={location}>
                <Switch>
                  <Route path="/">
                    <Dashboard queue={queue} onStart={startForCustomer} onNew={() => startForCustomer()} />
                  </Route>
                  <Route path="/consultation/new">
                    <NewConsultation
                      draft={draft}
                      setDraft={setDraft}
                      onBack={() => setLocation('/')}
                      onContinue={() => {
                        if (!draft.name.trim() || !draft.phone.trim()) {
                          notify('Add the customer name and phone number first');
                          return;
                        }
                        setScanViews([]);
                        setActiveScanView('Front');
                        setLocation('/scan');
                      }}
                    />
                  </Route>
                  <Route path="/scan">
                    <GuidedScan
                      customerName={draft.name || 'New guest'}
                      scanViews={scanViews}
                      activeView={activeScanView}
                      setActiveView={setActiveScanView}
                      onCapture={captureView}
                      onAnalyze={runAnalysis}
                      analyzing={analyzing}
                      onBack={() => setLocation('/consultation/new')}
                    />
                  </Route>
                  <Route path="/report">
                    <ConsultationReport
                      draft={draft}
                      selectedLook={selectedLook}
                      setSelectedLook={setSelectedLook}
                      override={override}
                      setOverride={setOverride}
                      stylistNote={stylistNote}
                      setStylistNote={setStylistNote}
                      onBack={() => setLocation('/scan')}
                      onSave={saveReport}
                    />
                  </Route>
                  <Route path="/passport">
                    <HairPassport
                      customerName={draft.name || 'Ananya Rao'}
                      note={passportNote}
                      setNote={setPassportNote}
                      passportSaved={passportSaved}
                      onNew={() => startForCustomer()}
                    />
                  </Route>
                  <Route component={NotFound} />
                </Switch>
              </RoutedErrorBoundary>
            </AppShell>
          </div>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
      {toast && (
        <div data-testid="status-toast" className="fixed bottom-5 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-[hsl(var(--foreground))] px-4 py-2.5 text-sm font-semibold text-[hsl(var(--background))] shadow-xl animate-rise">
          {toast}
        </div>
      )}
    </QueryClientProvider>
  );
}

function RoutedErrorBoundary({ children, resetKey }: { children: ReactNode; resetKey: string }) {
  return <ErrorBoundary resetKey={resetKey}>{children}</ErrorBoundary>;
}

function AppShell({
  children,
  location,
  mobileNavOpen,
  setMobileNavOpen,
}: {
  children: ReactNode;
  location: string;
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
}) {
  const navItems = [
    { href: '/', label: 'Today', icon: Home },
    { href: '/consultation/new', label: 'New consultation', icon: Plus },
    { href: '/passport', label: 'Hair Passports', icon: BookOpen },
  ];
  return (
    <div className="flex min-h-[100dvh]">
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[248px] flex-col bg-[hsl(var(--sidebar))] px-5 py-6 text-[hsl(var(--sidebar-foreground))] transition-transform duration-300 md:sticky md:top-0 md:h-[100dvh] md:translate-x-0 ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-12 flex items-center justify-between">
          <Link href="/" data-testid="link-logo" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[hsl(var(--sidebar-primary)/.65)] text-[hsl(var(--sidebar-primary))]">
              <span className="serif text-xl">h</span>
            </div>
            <div>
              <div className="serif text-[1.4rem] leading-none tracking-tight">halo</div>
              <div className="mt-1 text-[9px] uppercase tracking-[.24em] text-[hsl(var(--sidebar-foreground)/.48)]">consultation studio</div>
            </div>
          </Link>
          <button data-testid="button-close-mobile-nav" onClick={() => setMobileNavOpen(false)} className="rounded-md p-1 text-[hsl(var(--sidebar-foreground)/.6)] md:hidden"><X size={18} /></button>
        </div>
        <div className="mb-3 px-3 eyebrow text-[hsl(var(--sidebar-foreground)/.4)]">Workspace</div>
        <nav className="space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`} onClick={() => setMobileNavOpen(false)} className={`nav-link ${location === href ? 'active' : ''}`}>
              <Icon size={17} strokeWidth={1.8} />
              <span>{label}</span>
              {href === '/passport' && <span className="ml-auto rounded-full bg-[hsl(var(--sidebar-primary)/.15)] px-2 py-0.5 text-[10px] text-[hsl(var(--sidebar-primary))]">24</span>}
            </Link>
          ))}
        </nav>
        <div className="mt-auto">
          <div className="mb-6 rounded-xl border border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-accent)/.65)] p-4">
            <div className="mb-2 flex items-center gap-2 text-[hsl(var(--sidebar-primary))]"><Sparkles size={15} /><span className="text-xs font-bold">Halo note</span></div>
            <p className="text-xs leading-relaxed text-[hsl(var(--sidebar-foreground)/.68)]">The best consultation leaves the guest feeling understood before the scissors come out.</p>
          </div>
          <div className="flex items-center gap-3 border-t border-[hsl(var(--sidebar-border))] pt-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[hsl(var(--sidebar-primary))] text-xs font-bold text-[hsl(var(--sidebar-primary-foreground))]">MN</div>
            <div className="min-w-0"><div className="truncate text-sm font-semibold">Meera Nair</div><div className="text-xs text-[hsl(var(--sidebar-foreground)/.5)]">Senior stylist</div></div>
            <button data-testid="button-stylist-menu" className="ml-auto text-[hsl(var(--sidebar-foreground)/.45)]"><MoreHorizontal size={17} /></button>
          </div>
        </div>
      </aside>
      {mobileNavOpen && <button aria-label="Close navigation" data-testid="button-nav-overlay" onClick={() => setMobileNavOpen(false)} className="fixed inset-0 z-30 bg-[hsl(var(--foreground)/.24)] md:hidden" />}
      <main className="min-w-0 flex-1">
        <header className="flex h-[72px] items-center justify-between border-b border-[hsl(var(--border)/.7)] px-5 sm:px-8">
          <button data-testid="button-open-mobile-nav" onClick={() => setMobileNavOpen(true)} className="rounded-md p-2 text-muted-foreground md:hidden"><Menu size={21} /></button>
          <div className="hidden items-center gap-2 text-xs text-muted-foreground md:flex"><MapPin size={14} /> Indiranagar, Bengaluru <span className="mx-1 opacity-40">/</span> Studio 01</div>
          <div className="ml-auto flex items-center gap-2 sm:gap-4">
            <button data-testid="button-help" className="hidden items-center gap-2 rounded-md px-2 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted sm:flex"><CircleHelp size={16} /> Quick guide</button>
            <button data-testid="button-notifications" className="relative rounded-md p-2 text-muted-foreground hover:bg-muted"><Bell size={18} /><span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-primary" /></button>
            <div className="hidden h-6 w-px bg-border sm:block" />
            <div className="text-right"><div className="text-xs font-semibold">Tuesday, 18 June</div><div className="text-[10px] text-muted-foreground">10:12 AM</div></div>
          </div>
        </header>
        <div className="mx-auto max-w-[1440px] px-5 py-7 sm:px-8 lg:px-12">{children}</div>
      </main>
    </div>
  );
}

function PageIntro({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="animate-rise"><div className="eyebrow mb-2">{eyebrow}</div><h1 className="serif text-4xl leading-[1.1] tracking-tight text-foreground sm:text-5xl">{title}</h1>{description && <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">{description}</p>}</div>
      {action && <div className="animate-rise animate-rise-delay-1">{action}</div>}
    </div>
  );
}

function Dashboard({ queue, onStart, onNew }: { queue: Consultation[]; onStart: (customer: Consultation) => void; onNew: () => void }) {
  return (
    <div>
      <PageIntro eyebrow="Tuesday, 18 June · Studio 01" title="Make room for good hair days." description="Your consultation room is ready. Take a beat, then make the next guest feel seen." action={<button data-testid="button-new-consultation" onClick={onNew} className="button-primary"><Plus size={17} /> New consultation</button>} />
      <div className="grid gap-5 lg:grid-cols-[1.55fr_1fr]">
        <section className="panel animate-rise animate-rise-delay-1 overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6"><div><div className="eyebrow mb-1">The room today</div><h2 className="serif text-2xl">Consultation queue</h2></div><div className="flex items-center gap-2 text-xs text-muted-foreground"><span className="h-2 w-2 rounded-full bg-[hsl(var(--chart-2))]" />{queue.length} guests remaining</div></div>
          <div className="divide-y divide-border">
            {queue.length === 0 ? <div className="flex flex-col items-center px-6 py-14 text-center"><div className="mb-3 rounded-full bg-secondary p-4 text-primary"><Check size={22} /></div><h3 className="serif text-xl">The queue is clear</h3><p className="mt-1 max-w-xs text-sm text-muted-foreground">A lovely moment to update your Hair Passports or reset the room.</p></div> : queue.map((item, index) => (
              <div data-testid={`row-consultation-${item.id}`} key={item.id} className="group flex items-center gap-3 px-5 py-4 transition-colors hover:bg-muted/50 sm:gap-4 sm:px-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold" style={{ backgroundColor: `${item.color}55`, color: item.color }}>{item.initials}</div>
                <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span data-testid={`text-customer-${item.id}`} className="font-semibold">{item.customer}</span><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${item.status === 'In progress' ? 'bg-[hsl(var(--accent)/.28)] text-[hsl(var(--foreground))]' : item.status === 'Ready' ? 'bg-[hsl(var(--secondary))] text-[hsl(var(--chart-2))]' : 'bg-muted text-muted-foreground'}`}>{item.status}</span></div><div className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground"><span>{item.time}</span><span className="opacity-40">·</span><span>{item.service}</span><span className="hidden opacity-40 sm:inline">·</span><span className="hidden sm:inline">{item.stylist}</span></div></div>
                <button data-testid={`button-start-consultation-${item.id}`} onClick={() => onStart(item)} className="button-secondary shrink-0 px-3 py-2 text-xs opacity-90 sm:opacity-0 sm:group-hover:opacity-100">{item.status === 'In progress' ? 'Open' : 'Start'} <ArrowRight size={14} /></button>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-border bg-muted/35 px-5 py-3 sm:px-6"><span className="text-xs text-muted-foreground">Next up in 18 minutes</span><button data-testid="button-view-day" onClick={() => onNew()} className="text-xs font-bold text-primary hover:underline">View day plan <ArrowRight className="ml-1 inline" size={13} /></button></div>
        </section>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
          <section className="panel animate-rise animate-rise-delay-2 p-5 sm:p-6"><div className="mb-5 flex items-start justify-between"><div><div className="eyebrow mb-1">A small signal</div><h2 className="serif text-2xl">Recommendation confidence</h2></div><Flame className="text-primary" size={20} /></div><div className="flex items-end gap-3"><span className="serif text-5xl text-primary">86</span><span className="mb-2 text-sm text-muted-foreground">/ 100 average<br />this week</span></div><div className="mt-5 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full w-[86%] rounded-full bg-primary" /></div><p className="mt-3 text-xs leading-relaxed text-muted-foreground">Your notes are helping the model understand Indian hair textures with more nuance.</p></section>
          <section className="panel animate-rise animate-rise-delay-3 p-5 sm:p-6"><div className="eyebrow mb-1">Recent rhythm</div><h2 className="serif text-2xl">Studio activity</h2><div className="mt-5 space-y-4">{[['09:42', 'Aditi’s passport updated', 'Soft curtain fringe saved'], ['09:18', '3 scans completed', 'All quality checks passed'], ['Yesterday', 'New signal observed', 'Humidity sensitivity · 6 guests']].map(([time, title, sub], i) => <div data-testid={`activity-item-${i}`} key={title} className="flex gap-3"><div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[hsl(var(--chart-2))]" /><div className="min-w-0 flex-1"><div className="flex justify-between gap-3 text-xs text-muted-foreground"><span>{time}</span><span className="truncate">{sub}</span></div><div className="mt-1 text-sm font-semibold">{title}</div></div></div>)}</div></section>
        </div>
      </div>
      <section className="mt-5 grid gap-5 md:grid-cols-[1fr_1.2fr]">
        <div className="panel animate-rise animate-rise-delay-3 flex flex-col justify-between bg-[hsl(var(--sidebar))] p-6 text-[hsl(var(--sidebar-foreground))] sm:p-7"><div><div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-[hsl(var(--sidebar-primary)/.6)] text-[hsl(var(--sidebar-primary))]"><BookOpen size={19} /></div><div className="eyebrow text-[hsl(var(--sidebar-foreground)/.5)]">A long view of style</div><h2 className="serif mt-2 max-w-xs text-3xl leading-tight text-[hsl(var(--sidebar-foreground))]">Every guest has a story. Keep it.</h2></div><Link href="/passport" data-testid="link-hair-passport" className="mt-8 flex items-center gap-2 text-sm font-semibold text-[hsl(var(--sidebar-primary))]">Open Hair Passports <ArrowRight size={15} /></Link></div>
        <div className="panel animate-rise animate-rise-delay-4 p-6 sm:p-7"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><div className="eyebrow mb-1">This week at a glance</div><h2 className="serif text-2xl">What guests are asking for</h2></div><button data-testid="button-filter-signals" className="button-secondary self-start px-3 py-2 text-xs"><Search size={14} /> Explore signals</button></div><div className="mt-6 grid gap-4 sm:grid-cols-3"><Signal title="Natural movement" value="18 guests" detail="up 4 from last week" tone="sage" /><Signal title="Easy mornings" value="12 guests" detail="most common goal" tone="gold" /><Signal title="Scalp comfort" value="7 guests" detail="worth a deeper check-in" tone="clay" /></div></div>
      </section>
    </div>
  );
}

function Signal({ title, value, detail, tone }: { title: string; value: string; detail: string; tone: 'sage' | 'gold' | 'clay' }) {
  const colors = { sage: 'bg-[hsl(var(--secondary))]', gold: 'bg-[hsl(var(--accent)/.3)]', clay: 'bg-[hsl(var(--primary)/.1)]' };
  return <div data-testid={`signal-${title.toLowerCase().replaceAll(' ', '-')}`} className={`${colors[tone]} rounded-lg p-4`}><div className="text-xs font-semibold">{title}</div><div className="mt-3 text-xl font-bold">{value}</div><div className="mt-1 text-[11px] text-muted-foreground">{detail}</div></div>;
}

function NewConsultation({ draft, setDraft, onBack, onContinue }: { draft: Draft; setDraft: (draft: Draft) => void; onBack: () => void; onContinue: () => void }) {
  const update = (key: keyof Draft, value: string) => setDraft({ ...draft, [key]: value });
  return (
    <div className="mx-auto max-w-5xl">
      <button data-testid="button-back-dashboard" onClick={onBack} className="mb-7 flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground"><ChevronLeft size={15} /> Back to today</button>
      <div className="mb-9 flex items-end justify-between gap-5"><div className="animate-rise"><div className="eyebrow mb-2">01 · Begin with the person</div><h1 className="serif text-4xl tracking-tight sm:text-5xl">A little context goes a long way.</h1><p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">Start with what you hear. Halo uses this context to make the scan feel more like a second opinion than a verdict.</p></div><div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex"><span className="h-2 w-2 rounded-full bg-primary" /> 1 of 3</div></div>
      <form onSubmit={(event) => { event.preventDefault(); onContinue(); }} className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
        <section className="panel animate-rise animate-rise-delay-1 p-5 sm:p-7">
          <div className="mb-6 flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-[hsl(var(--primary)/.12)] text-primary"><UserRound size={17} /></div><div><h2 className="font-semibold">Guest details</h2><p className="text-xs text-muted-foreground">The basics, not a biography.</p></div></div>
          <div className="grid gap-4 sm:grid-cols-2"><label className="block sm:col-span-2"><span className="mb-1.5 block text-xs font-semibold">Guest name</span><input data-testid="input-customer-name" value={draft.name} onChange={(e) => update('name', e.target.value)} className="field" placeholder="e.g. Ananya Rao" /></label><label className="block"><span className="mb-1.5 block text-xs font-semibold">Phone number</span><input data-testid="input-customer-phone" value={draft.phone} onChange={(e) => update('phone', e.target.value)} className="field" placeholder="+91 98450 12345" /></label><label className="block"><span className="mb-1.5 block text-xs font-semibold">Stylist</span><div className="relative"><select data-testid="select-stylist" value={draft.stylist} onChange={(e) => update('stylist', e.target.value)} className="field appearance-none"><option>Meera Nair</option><option>Arjun Shah</option><option>Nidhi Rao</option><option>Tanvi Menon</option></select><ChevronDown className="pointer-events-none absolute right-3 top-3.5 text-muted-foreground" size={15} /></div></label></div>
          <div className="my-7 h-px bg-border" />
          <div className="mb-5 flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-[hsl(var(--accent)/.35)] text-foreground"><Sparkles size={17} /></div><div><h2 className="font-semibold">The styling conversation</h2><p className="text-xs text-muted-foreground">Choose what is closest; your notes can add the nuance.</p></div></div>
          <div><span className="mb-2.5 block text-xs font-semibold">What would feel like a win?</span><div className="grid gap-2 sm:grid-cols-2">{['A cut that feels like me', 'A colour that grows out softly', 'More volume, less effort', 'A complete change'].map((goal) => <button type="button" data-testid={`button-goal-${goal.slice(0, 8).replaceAll(' ', '-').toLowerCase()}`} key={goal} onClick={() => update('goal', goal)} className={`choice ${draft.goal === goal ? 'selected' : ''}`}><span className="text-sm font-semibold">{goal}</span></button>)}</div></div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2"><div><span className="mb-2.5 block text-xs font-semibold">Preferred length</span><div className="flex flex-wrap gap-2">{['Chin length', 'Shoulder length', 'Long'].map((length) => <button type="button" data-testid={`button-length-${length.toLowerCase().replaceAll(' ', '-')}`} key={length} onClick={() => update('length', length)} className={`choice px-3 py-2 text-xs ${draft.length === length ? 'selected' : ''}`}>{length}</button>)}</div></div><div><span className="mb-2.5 block text-xs font-semibold">Hair texture</span><div className="flex flex-wrap gap-2">{['Straight', 'Wavy', 'Curly', 'Coily'].map((texture) => <button type="button" data-testid={`button-texture-${texture.toLowerCase()}`} key={texture} onClick={() => update('texture', texture)} className={`choice px-3 py-2 text-xs ${draft.texture === texture ? 'selected' : ''}`}>{texture}</button>)}</div></div></div>
        </section>
        <aside className="space-y-5">
          <section className="panel animate-rise animate-rise-delay-2 bg-[hsl(var(--secondary)/.55)] p-5 sm:p-6"><div className="mb-4 flex items-center gap-2 text-[hsl(var(--chart-2))]"><ShieldCheck size={17} /><span className="text-xs font-bold uppercase tracking-[.1em]">A clear promise</span></div><h2 className="serif text-2xl">Visual estimate, not a diagnosis.</h2><p className="mt-3 text-sm leading-relaxed text-muted-foreground">The scan helps you talk about shape, texture and visible condition. It does not assess health, prescribe treatments, or replace your expertise.</p><div className="mt-5 flex gap-2 rounded-lg border border-[hsl(var(--chart-2)/.22)] bg-[hsl(var(--card)/.55)] p-3 text-xs leading-relaxed text-muted-foreground"><Info size={16} className="mt-0.5 shrink-0 text-[hsl(var(--chart-2))]" /> Always use your professional judgement and the guest’s own account of their hair history.</div></section>
          <section className="panel animate-rise animate-rise-delay-3 p-5 sm:p-6"><div className="eyebrow mb-2">Before we scan</div><div className="space-y-3">{['Hair is dry and free of heavy styling product', 'Guest is comfortable with their likeness being captured', 'Natural light is facing the guest'].map((item, index) => <div key={item} className="flex gap-3 text-sm"><div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground">{index + 1}</div><span className="leading-relaxed text-muted-foreground">{item}</span></div>)}</div></section>
          <button data-testid="button-start-scan" type="submit" className="button-primary w-full py-3.5">Continue to guided scan <ArrowRight size={17} /></button>
        </aside>
      </form>
    </div>
  );
}

function GuidedScan({ customerName, scanViews, activeView, setActiveView, onCapture, onAnalyze, analyzing, onBack }: { customerName: string; scanViews: ScanView[]; activeView: ScanView; setActiveView: (view: ScanView) => void; onCapture: () => void; onAnalyze: () => void; analyzing: boolean; onBack: () => void }) {
  const views: ScanView[] = ['Front', 'Left', 'Right'];
  const capturedCount = scanViews.length;
  return (
    <div className="mx-auto max-w-6xl">
      <button data-testid="button-back-intake" onClick={onBack} className="mb-7 flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground"><ChevronLeft size={15} /> Back to intake</button>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div className="animate-rise"><div className="eyebrow mb-2">02 · A quiet guided scan</div><h1 className="serif text-4xl tracking-tight sm:text-5xl">Let’s see the full picture.</h1><p className="mt-3 text-sm text-muted-foreground">Scanning <span className="font-semibold text-foreground">{customerName}</span> · keep the camera at eye level.</p></div><div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground"><span className="text-primary">{capturedCount}</span> / 3 views captured</div></div>
      <div className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
        <section className="panel relative min-h-[490px] overflow-hidden bg-[hsl(var(--foreground))] p-3 text-[hsl(var(--background))] sm:p-5">
          <div className="relative flex h-full min-h-[455px] flex-col justify-between overflow-hidden rounded-xl border border-[hsl(var(--background)/.16)] bg-[radial-gradient(ellipse_at_50%_20%,hsl(159_15%_31%),hsl(159_17%_14%)_68%)] p-5">
            <div className="scan-beam absolute left-0 top-0 h-24 w-full bg-gradient-to-b from-[hsl(var(--accent)/.14)] to-transparent" />
            <div className="relative flex items-center justify-between"><span className="rounded-full border border-[hsl(var(--background)/.2)] px-3 py-1 text-[10px] uppercase tracking-[.14em] text-[hsl(var(--background)/.7)]">Studio camera · simulated</span><span className="flex items-center gap-1.5 text-[10px] text-[hsl(var(--background)/.6)]"><span className="soft-pulse h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent))]" /> Ready</span></div>
            <div className="relative mx-auto flex w-full max-w-sm flex-1 items-center justify-center"><div className="absolute h-[285px] w-[215px] rounded-[48%] border border-[hsl(var(--accent)/.6)] sm:h-[320px] sm:w-[240px]" /><div className="absolute h-[315px] w-[250px] rounded-[48%] border border-dashed border-[hsl(var(--background)/.28)] sm:h-[355px] sm:w-[275px]" /><div className="relative flex flex-col items-center text-center"><div className="mb-5 flex h-28 w-28 items-center justify-center rounded-full bg-[hsl(var(--accent)/.12)] text-[hsl(var(--accent))]"><UserRound size={55} strokeWidth={1} /></div><div className="serif text-3xl">{activeView} view</div><p className="mt-2 max-w-[220px] text-xs leading-relaxed text-[hsl(var(--background)/.6)]">Centre the face inside the oval, then hold still for one breath.</p></div></div>
            <div className="relative flex items-center justify-between gap-4"><div className="text-xs text-[hsl(var(--background)/.55)]">No photo leaves this prototype.</div><button data-testid="button-capture-view" onClick={onCapture} className="button-primary bg-[hsl(var(--accent))] px-4 py-2.5 text-xs text-[hsl(var(--foreground))]"><Camera size={15} /> Capture {activeView}</button></div>
          </div>
        </section>
        <aside className="space-y-5">
          <section className="panel animate-rise animate-rise-delay-1 p-5 sm:p-6"><div className="mb-4 flex items-center justify-between"><div><div className="eyebrow mb-1">Capture progress</div><h2 className="serif text-2xl">Three angles, one story.</h2></div><ScanLine className="text-primary" size={21} /></div><div className="mb-5 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${(capturedCount / 3) * 100}%` }} /></div><div className="space-y-2">{views.map((view, index) => { const done = scanViews.includes(view); return <button data-testid={`button-scan-view-${view.toLowerCase()}`} key={view} onClick={() => setActiveView(view)} className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors ${activeView === view ? 'border-primary bg-[hsl(var(--primary)/.07)]' : 'border-border'}`}><div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${done ? 'bg-[hsl(var(--chart-2))] text-[hsl(var(--card))]' : activeView === view ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{done ? <Check size={14} /> : index + 1}</div><div className="flex-1"><div className="text-sm font-semibold">{view} view</div><div className="text-[11px] text-muted-foreground">{done ? 'Captured and clear' : view === activeView ? 'Ready to capture' : 'Waiting'}</div></div>{activeView === view && <span className="h-2 w-2 rounded-full bg-primary" />}</button>; })}</div></section>
          <section className="panel animate-rise animate-rise-delay-2 p-5 sm:p-6"><div className="eyebrow mb-3">Quality checklist</div><div className="space-y-3">{['Face centred in the guide', 'Even natural light', 'Hair visible at the sides'].map((item, index) => <div key={item} className="flex items-center gap-3 text-sm"><div className={`flex h-5 w-5 items-center justify-center rounded-full ${capturedCount > index ? 'bg-[hsl(var(--chart-2))] text-[hsl(var(--card))]' : 'bg-muted text-muted-foreground'}`}>{capturedCount > index ? <Check size={13} /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}</div><span className={capturedCount > index ? 'text-foreground' : 'text-muted-foreground'}>{item}</span></div>)}</div></section>
          <button data-testid="button-analyze-hair" onClick={onAnalyze} disabled={analyzing} className="button-primary w-full py-3.5 disabled:cursor-wait disabled:opacity-70">{analyzing ? <><RotateCcw className="animate-spin" size={16} /> Reading the details…</> : <>Simulate analysis <Sparkles size={16} /></>}</button>
          <p className="text-center text-[11px] leading-relaxed text-muted-foreground">This is a visual estimate to support a stylist conversation. It is not a diagnosis.</p>
        </aside>
      </div>
    </div>
  );
}

function ConsultationReport({ draft, selectedLook, setSelectedLook, override, setOverride, stylistNote, setStylistNote, onBack, onSave }: { draft: Draft; selectedLook: string; setSelectedLook: (look: string) => void; override: string; setOverride: (value: string) => void; stylistNote: string; setStylistNote: (value: string) => void; onBack: () => void; onSave: () => void }) {
  const looks = [
    { title: 'Soft textured lob', type: 'Best match', score: '92', description: 'Keeps the shoulder-grazing ease while letting natural wave do a little work.', tags: ['Low effort', 'Movement'] },
    { title: 'Airy collarbone layers', type: 'Close match', score: '87', description: 'A little more shape through the ends, with a soft frame around the face.', tags: ['Face framing', 'Versatile'] },
    { title: 'Long side-swept fringe', type: 'Try if curious', score: '76', description: 'A gentle change without committing to a shorter overall length.', tags: ['Fresh feel', 'Grow-out friendly'] },
  ];
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-7 flex items-center justify-between gap-4"><button data-testid="button-back-scan" onClick={onBack} className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground"><ChevronLeft size={15} /> Back to scan</button><span className="rounded-full bg-[hsl(var(--secondary))] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.1em] text-[hsl(var(--chart-2))]">Estimate ready · review together</span></div>
      <div className="mb-9 animate-rise"><div className="eyebrow mb-2">03 · The consultation report</div><h1 className="serif text-4xl tracking-tight sm:text-5xl">{draft.name || 'New guest'}’s hair, in focus.</h1><p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">A conversation starter based on the scan and your intake notes. Your eye is the final word.</p></div>
      <div className="grid gap-5 lg:grid-cols-[.78fr_1.22fr]">
        <div className="space-y-5">
          <section className="panel animate-rise animate-rise-delay-1 p-5 sm:p-6"><div className="mb-5 flex items-center justify-between"><div><div className="eyebrow mb-1">Visible profile</div><h2 className="serif text-2xl">What we can see</h2></div><div className="flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--accent)/.3)] text-primary"><Sparkles size={21} /></div></div><div className="mb-5 rounded-xl bg-[hsl(var(--secondary)/.62)] p-4"><div className="text-xs font-bold uppercase tracking-[.1em] text-[hsl(var(--chart-2))]">Face shape estimate</div><div className="mt-1 serif text-3xl">Soft oval</div><div className="mt-2 text-xs leading-relaxed text-muted-foreground">Balanced proportions with a gently rounded jawline.</div></div><div className="grid grid-cols-2 gap-2">{[['Texture', draft.texture], ['Length', draft.length], ['Density', 'Medium-full'], ['Movement', 'Natural wave']].map(([label, value]) => <div data-testid={`profile-${label.toLowerCase()}`} key={label} className="rounded-lg border border-border p-3"><div className="text-[10px] font-bold uppercase tracking-[.1em] text-muted-foreground">{label}</div><div className="mt-1 text-sm font-semibold">{value}</div></div>)}</div></section>
          <section className="panel animate-rise animate-rise-delay-2 p-5 sm:p-6"><div className="eyebrow mb-1">Condition signals</div><h2 className="serif text-2xl">Worth discussing</h2><div className="mt-5 space-y-4">{[['Dryness at ends', 'Mild', 'A nourishing finish may help the shape sit better.', 'gold'], ['Humidity sensitivity', 'Noticeable', 'Suggest a light anti-frizz routine for Bengaluru weather.', 'clay'], ['Scalp visibility', 'Balanced', 'No unusual visual signal in this estimate.', 'sage']].map(([title, level, detail, tone]) => <div data-testid={`signal-condition-${title.toLowerCase().replaceAll(' ', '-')}`} key={title} className="flex gap-3"><div className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${tone === 'sage' ? 'bg-[hsl(var(--chart-2))]' : tone === 'gold' ? 'bg-[hsl(var(--accent))]' : 'bg-primary'}`} /><div><div className="flex flex-wrap items-center gap-2 text-sm font-semibold">{title}<span className="text-[10px] font-bold uppercase tracking-[.1em] text-muted-foreground">{level}</span></div><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{detail}</p></div></div>)}</div></section>
        </div>
        <div className="space-y-5">
          <section className="panel animate-rise animate-rise-delay-1 overflow-hidden"><div className="border-b border-border px-5 py-4 sm:px-6"><div className="eyebrow mb-1">Ranked recommendations</div><div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end"><h2 className="serif text-2xl">Three directions to explore</h2><span className="text-xs text-muted-foreground">Based on goal: <span className="font-semibold text-foreground">{draft.goal}</span></span></div></div><div className="divide-y divide-border">{looks.map((look, index) => <button data-testid={`button-recommendation-${index}`} key={look.title} onClick={() => setSelectedLook(look.title)} className={`flex w-full gap-4 p-5 text-left transition-colors sm:p-6 ${selectedLook === look.title ? 'bg-[hsl(var(--primary)/.065)]' : 'hover:bg-muted/40'}`}><div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${selectedLook === look.title ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{index + 1}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="font-semibold">{look.title}</span><span className="rounded-full bg-[hsl(var(--secondary))] px-2 py-0.5 text-[10px] font-bold text-[hsl(var(--chart-2))]">{look.type}</span></div><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{look.description}</p><div className="mt-3 flex flex-wrap gap-1.5">{look.tags.map((tag) => <span key={tag} className="rounded-full border border-border px-2 py-1 text-[10px] text-muted-foreground">{tag}</span>)}</div></div><div className="shrink-0 text-right"><div className="serif text-2xl text-primary">{look.score}</div><div className="text-[10px] text-muted-foreground">match</div></div></button>)}</div></section>
          <section className="panel animate-rise animate-rise-delay-2 p-5 sm:p-6"><div className="mb-5 flex items-start gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--accent)/.3)] text-primary"><Scissors size={17} /></div><div><div className="eyebrow mb-1">Your call</div><h2 className="serif text-2xl">Stylist override</h2><p className="mt-1 text-xs text-muted-foreground">Give the estimate a little local knowledge.</p></div></div><label className="relative block"><span className="mb-1.5 block text-xs font-semibold">Recommendation direction</span><select data-testid="select-stylist-override" value={override} onChange={(e) => setOverride(e.target.value)} className="field appearance-none"><option>Keep the recommended shape</option><option>Make it softer around the face</option><option>Go shorter than suggested</option><option>Let’s explore a bolder change</option></select><ChevronDown className="pointer-events-none absolute right-3 top-9 text-muted-foreground" size={15} /></label><label className="mt-4 block"><span className="mb-1.5 block text-xs font-semibold">Private stylist note</span><textarea data-testid="textarea-stylist-note" value={stylistNote} onChange={(e) => setStylistNote(e.target.value)} className="field min-h-[92px] resize-y" placeholder="What did you notice in conversation that the scan cannot see?" /></label><div className="mt-5 flex flex-col justify-between gap-3 border-t border-border pt-4 sm:flex-row sm:items-center"><div className="flex items-center gap-2 text-xs text-muted-foreground"><ClipboardList size={15} /> Saved privately to this visit</div><button data-testid="button-save-passport" onClick={onSave} className="button-primary"><Save size={16} /> Save to Hair Passport</button></div></section>
        </div>
      </div>
    </div>
  );
}

function HairPassport({ customerName, note, setNote, passportSaved, onNew }: { customerName: string; note: string; setNote: (value: string) => void; passportSaved: boolean; onNew: () => void }) {
  const [favoriteAdded, setFavoriteAdded] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const history = [
    ['18 Jun 2024', 'Signature cut', 'Meera Nair', 'Soft textured lob'],
    ['14 May 2024', 'Gloss refresh', 'Meera Nair', 'Warm espresso'],
    ['02 Mar 2024', 'Shape-up', 'Arjun Shah', 'Air-dried movement'],
    ['19 Dec 2023', 'First consultation', 'Nidhi Rao', 'Soft layers'],
  ];
  return (
    <div className="mx-auto max-w-6xl">
      <PageIntro eyebrow="The long view of style" title="Hair Passport" description="A living record of what makes a guest feel most like themselves. Bring it into every future conversation." action={<button data-testid="button-passport-new-consultation" onClick={onNew} className="button-primary"><Plus size={17} /> New consultation</button>} />
      {passportSaved && <div data-testid="status-passport-saved" className="mb-5 flex items-center gap-3 rounded-lg border border-[hsl(var(--chart-2)/.3)] bg-[hsl(var(--secondary)/.6)] px-4 py-3 text-sm"><Check size={17} className="text-[hsl(var(--chart-2))]" /><span><strong>Visit saved.</strong> The latest recommendation is now part of {customerName}’s passport.</span></div>}
      <div className="grid gap-5 lg:grid-cols-[.72fr_1.28fr]">
        <aside className="space-y-5">
          <section className="panel animate-rise animate-rise-delay-1 overflow-hidden"><div className="bg-[hsl(var(--sidebar))] px-6 pb-7 pt-7 text-[hsl(var(--sidebar-foreground))]"><div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-[hsl(var(--sidebar-primary)/.5)] bg-[hsl(var(--sidebar-accent))] text-xl font-bold text-[hsl(var(--sidebar-primary))]">{customerName.split(' ').map((part) => part[0]).slice(0, 2).join('')}</div><div className="eyebrow text-[hsl(var(--sidebar-foreground)/.5)]">Guest profile</div><h2 data-testid="text-passport-customer" className="serif mt-1 text-3xl">{customerName}</h2><div className="mt-3 flex items-center gap-2 text-xs text-[hsl(var(--sidebar-foreground)/.58)]"><MapPin size={13} /> Indiranagar · Bengaluru</div></div><div className="space-y-4 p-5 sm:p-6"><div className="flex justify-between gap-4 text-sm"><span className="text-muted-foreground">Last visit</span><span className="font-semibold">18 June 2024</span></div><div className="flex justify-between gap-4 text-sm"><span className="text-muted-foreground">Hair profile</span><span className="font-semibold">{'Wavy · Shoulder length'}</span></div><div className="flex justify-between gap-4 text-sm"><span className="text-muted-foreground">Preferred stylist</span><span className="font-semibold">Meera Nair</span></div><div className="border-t border-border pt-4"><div className="mb-2 text-xs font-bold uppercase tracking-[.1em] text-muted-foreground">Preferences</div><div className="flex flex-wrap gap-2"><span className="rounded-full bg-[hsl(var(--secondary))] px-2.5 py-1 text-xs font-semibold">Low maintenance</span><span className="rounded-full bg-[hsl(var(--accent)/.3)] px-2.5 py-1 text-xs font-semibold">Soft movement</span><span className="rounded-full bg-[hsl(var(--primary)/.1)] px-2.5 py-1 text-xs font-semibold">Warm tones</span></div></div></div></section>
          <section className="panel animate-rise animate-rise-delay-2 p-5 sm:p-6"><div className="flex items-center justify-between"><div><div className="eyebrow mb-1">Notes that stay</div><h2 className="serif text-2xl">Stylist memory</h2></div><FileText className="text-primary" size={19} /></div><textarea data-testid="textarea-passport-note" value={note} onChange={(e) => setNote(e.target.value)} className="field mt-4 min-h-[115px] resize-none text-sm leading-relaxed" /><button data-testid="button-save-passport-note" onClick={() => { setNote(note); }} className="button-secondary mt-3 w-full py-2 text-xs"><Save size={14} /> Save note</button></section>
        </aside>
        <div className="space-y-5">
          <section className="panel animate-rise animate-rise-delay-1 p-5 sm:p-6"><div className="flex items-center justify-between"><div><div className="eyebrow mb-1">A point of view</div><h2 className="serif text-2xl">Favourite styles</h2></div><button data-testid="button-add-favorite-style" onClick={() => setFavoriteAdded(true)} className="button-secondary px-3 py-2 text-xs"><Heart size={14} /> {favoriteAdded ? 'Style added' : 'Add style'}</button></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><FavoriteStyle title="Soft textured lob" detail="Saved today · 92 match" tone="clay" /><FavoriteStyle title="Air-dried movement" detail="Saved 14 May · daily style" tone="sage" /><FavoriteStyle title="Warm espresso gloss" detail="Saved 22 Feb · colour note" tone="gold" />{favoriteAdded && <FavoriteStyle title="Low bun with face frame" detail="Added just now · easy mornings" tone="gold" />}</div></section>
          <section className="panel animate-rise animate-rise-delay-2 p-5 sm:p-6"><div className="mb-5 flex items-center justify-between"><div><div className="eyebrow mb-1">The record</div><h2 className="serif text-2xl">Service history</h2></div><button data-testid="button-view-all-history" onClick={() => setShowAllHistory((current) => !current)} className="text-xs font-bold text-primary hover:underline">{showAllHistory ? 'Show less' : 'View all'}</button></div><div className="space-y-1">{history.slice(0, showAllHistory ? history.length : 3).map(([date, service, stylist, noteItem], index) => <div data-testid={`history-item-${index}`} key={date} className="grid grid-cols-[80px_1fr_auto] items-center gap-3 border-b border-border py-3 last:border-0 sm:grid-cols-[100px_1fr_auto]"><span className="text-[11px] text-muted-foreground">{date}</span><div><div className="text-sm font-semibold">{service}</div><div className="mt-0.5 text-[11px] text-muted-foreground">{stylist} · {noteItem}</div></div><Check size={15} className="text-[hsl(var(--chart-2))]" /></div>)}</div></section>
          <section className="panel animate-rise animate-rise-delay-3 p-5 sm:p-6"><div className="mb-5 flex items-center justify-between"><div><div className="eyebrow mb-1">A visual timeline</div><h2 className="serif text-2xl">Before / after</h2></div><span className="text-xs text-muted-foreground">2 moments</span></div><div className="grid gap-3 sm:grid-cols-2"><BeforeAfter label="Before first visit" date="02 Mar 2024" /><BeforeAfter label="Current shape" date="18 Jun 2024" /></div><p className="mt-4 text-xs leading-relaxed text-muted-foreground">Photos will appear here when your studio chooses to add them. For now, keep the feeling of the change in your notes.</p></section>
        </div>
      </div>
    </div>
  );
}

function FavoriteStyle({ title, detail, tone }: { title: string; detail: string; tone: 'clay' | 'sage' | 'gold' }) {
  const bg = { clay: 'bg-[hsl(var(--primary)/.12)]', sage: 'bg-[hsl(var(--secondary))]', gold: 'bg-[hsl(var(--accent)/.28)]' };
  return <div data-testid={`favorite-style-${title.toLowerCase().replaceAll(' ', '-')}`} className="group overflow-hidden rounded-lg border border-border"><div className={`flex h-20 items-end justify-between p-3 ${bg[tone]}`}><div className="h-12 w-20 rounded-[50%] border border-foreground/15" /><Star size={15} className="text-primary transition-transform group-hover:rotate-12" /></div><div className="p-3"><div className="text-sm font-semibold">{title}</div><div className="mt-1 text-[11px] text-muted-foreground">{detail}</div></div></div>;
}

function BeforeAfter({ label, date }: { label: string; date: string }) {
  return <div data-testid={`placeholder-${label.toLowerCase().replaceAll(' ', '-')}`} className="flex h-36 flex-col justify-between rounded-lg border border-dashed border-border bg-muted/45 p-4"><div className="flex items-center justify-between text-muted-foreground"><Camera size={18} /><span className="text-[10px] uppercase tracking-[.1em]">Placeholder</span></div><div><div className="text-sm font-semibold">{label}</div><div className="mt-1 text-[11px] text-muted-foreground">{date}</div></div></div>;
}

export default App;