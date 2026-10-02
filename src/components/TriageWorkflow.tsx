import { useEffect, useMemo, useState } from 'react';

type Patient = {
	id: string;
	firstName: string;
	lastName: string;
	score: number;
	eta: string;
	status: 'pending' | 'dispatched';
	timeSeconds: number;
};

type Props = { mode: 'nurse' | 'ambulance' };
type Intake = { firstName: string; lastName: string; phone: string; location: string; gender: string; age: string };

const STORAGE_KEY = 'terra-patients';
const SEED: Patient[] = [
	{ id: 'patient-1', firstName: 'Sarah', lastName: 'Connor', score: 85, eta: '6-8', status: 'pending', timeSeconds: 45 },
	{ id: 'patient-2', firstName: 'Kyle', lastName: 'Reese', score: 42, eta: 'N/A', status: 'pending', timeSeconds: 112 },
	{ id: 'patient-3', firstName: 'Miles', lastName: 'Dyson', score: 92, eta: '3-5', status: 'dispatched', timeSeconds: 15 },
];
const SYMPTOMS = [
	{ id: 'chest_pain', label: 'Chest pain', weight: 55 },
	{ id: 'breathing', label: 'Difficulty breathing', weight: 45 },
	{ id: 'unconscious', label: 'Unconscious', weight: 80 },
	{ id: 'dizziness', label: 'Dizziness', weight: 25 },
	{ id: 'headache', label: 'Headache', weight: 15 },
	{ id: 'nausea', label: 'Nausea', weight: 10 },
	{ id: 'fever', label: 'High fever', weight: 20 },
	{ id: 'bleeding', label: 'Severe bleeding', weight: 50 },
];
const EMPTY_INTAKE: Intake = { firstName: '', lastName: '', phone: '', location: '', gender: '', age: '' };
const inputClass = 'mt-1 h-10 w-full rounded-md border border-primary-6 bg-white px-3 text-primary-12 placeholder:text-primary-8';
const panelClass = 'rounded-xl border border-primary-5 bg-white p-5 shadow-sm';

function readPatients(): Patient[] {
	try {
		const stored = window.localStorage.getItem(STORAGE_KEY);
		return stored ? (JSON.parse(stored) as Patient[]) : SEED;
	} catch {
		return SEED;
	}
}

function writePatients(patients: Patient[]): void {
	try {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
	} catch {
		// Keep the demo usable when browser storage is unavailable.
	}
}

function timeLabel(seconds: number): string {
	return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

function priority(score: number): 'Critical' | 'Medium' | 'Low' {
	return score >= 75 ? 'Critical' : score >= 40 ? 'Medium' : 'Low';
}

export default function TriageWorkflow({ mode }: Props): React.JSX.Element | null {
	const [mounted, setMounted] = useState(false);
	const [intake, setIntake] = useState<Intake>(EMPTY_INTAKE);
	const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
	const [seconds, setSeconds] = useState(0);
	const [step, setStep] = useState<'intake' | 'result'>('intake');
	const [patients, setPatients] = useState<Patient[]>([]);
	const [selectedId, setSelectedId] = useState('');
	const score = useMemo(() => Math.min(99, selectedSymptoms.reduce((sum, id) => sum + (SYMPTOMS.find(item => item.id === id)?.weight ?? 0), 10)), [selectedSymptoms]);

	useEffect(() => {
		setMounted(true);
		setPatients(readPatients());
	}, []);

	useEffect(() => {
		if (mode === 'ambulance') return;
		const timer = window.setInterval(() => setSeconds(value => value + 1), 1000);
		return () => window.clearInterval(timer);
	}, [mode]);

	const selectedPatient = patients.find(patient => patient.id === selectedId);

	if (!mounted) return null;

	if (mode === 'ambulance') {
		const dispatch = (patient: Patient) => {
			const updated = patients.map(item => item.id === patient.id ? { ...item, status: 'dispatched' as const } : item);
			setPatients(updated);
			writePatients(updated);
		};
		return (
			<main className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[minmax(18rem,0.8fr)_minmax(0,1.5fr)]">
				<section className={`${panelClass} flex min-h-[32rem] flex-col`} aria-labelledby="queue-heading">
					<p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary-9">Emergency services</p>
					<h1 id="queue-heading" className="mb-4 mt-0 text-2xl font-semibold">Dispatch requests</h1>
					{patients.length === 0 ? <p className="text-primary-9">No patients in the queue.</p> : <div className="flex flex-col gap-2" role="list" aria-label="Patients awaiting dispatch">
						{patients.map(patient => <button key={patient.id} type="button" role="listitem" aria-pressed={selectedId === patient.id} onClick={() => setSelectedId(patient.id)} className={`flex items-center justify-between rounded-lg border p-4 text-left transition ${selectedId === patient.id ? 'border-primary-9 bg-primary-2 ring-1 ring-primary-9' : 'border-primary-4 hover:bg-primary-2'}`}>
							<span><span className="block font-semibold">{patient.firstName} {patient.lastName}</span><span className="text-sm text-primary-9">Severity score: {patient.score}</span></span>
							<span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${patient.status === 'pending' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'}`}>{patient.status === 'pending' ? 'Pending' : 'Dispatched'}</span>
						</button>)}
					</div>}
				</section>
				<section className={`${panelClass} flex min-h-[32rem] flex-col`} aria-live="polite">
					{selectedPatient ? <DispatchDetails patient={selectedPatient} onDispatch={dispatch} /> : <div className="m-auto max-w-sm text-center text-primary-9"><span className="mb-3 block text-3xl" aria-hidden="true">↖</span>Select a patient from the queue to review priority and recommended action.</div>}
				</section>
			</main>
		);
	}

	const progress = [
		{ label: 'Incident', value: intake.phone ? 100 : 0 },
		{ label: 'Location', value: intake.location ? 100 : 0 },
		{ label: 'Personal', value: [intake.firstName, intake.lastName, intake.gender, intake.age].filter(Boolean).length * 25 },
		{ label: 'Medical', value: selectedSymptoms.length ? 100 : 0 },
	];
	const action = score >= 75 ? 'Dispatch Ambulance' : score >= 40 ? 'See GP' : 'All Fine';
	const finish = () => {
		const patient: Patient = { id: crypto.randomUUID(), firstName: intake.firstName || 'Unknown', lastName: intake.lastName || 'Patient', score, eta: '6-8', status: 'pending', timeSeconds: seconds };
		const updated = [...patients, patient];
		setPatients(updated);
		writePatients(updated);
		setStep('intake');
		setIntake(EMPTY_INTAKE);
		setSelectedSymptoms([]);
		setSeconds(0);
		window.alert('Patient added to the ambulance dispatch queue.');
	};

	return <main className="mx-auto w-full max-w-6xl">
		{step === 'intake' ? <>
			<header className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-primary-5 bg-white px-5 py-4 shadow-sm">
				<div><p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary-9">Nurse intake · simulated case</p><h1 className="m-0 text-2xl font-semibold">Patient assessment</h1></div>
				<div className="rounded-lg bg-primary-2 px-4 py-2 font-mono text-lg tabular-nums" aria-label={`Elapsed time ${timeLabel(seconds)}`}>◷ {timeLabel(seconds)}</div>
			</header>
			<div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)]">
				<section className={panelClass} aria-labelledby="caller-heading">
					<div className="mb-5 flex items-center justify-between"><h2 id="caller-heading" className="m-0 text-xl font-semibold">Caller & patient details</h2><span className="text-sm text-primary-9">Step 1 of 2</span></div>
					<div className="grid gap-4 sm:grid-cols-2">
						{([{ key: 'firstName', label: 'First name', type: 'text' }, { key: 'lastName', label: 'Last name', type: 'text' }, { key: 'phone', label: 'Phone number', type: 'tel' }, { key: 'location', label: 'Location', type: 'text' }, { key: 'age', label: 'Age', type: 'number' }] as const).map(field => <label key={field.key} className="text-sm font-medium">{field.label}<input className={inputClass} type={field.type} value={intake[field.key]} onChange={event => setIntake(current => ({ ...current, [field.key]: event.currentTarget.value }))} /></label>)}
						<label className="text-sm font-medium">Gender<select className={inputClass} value={intake.gender} onChange={event => setIntake(current => ({ ...current, gender: event.currentTarget.value }))}><option value="">Select…</option><option>Female</option><option>Male</option><option>Other</option><option>Prefer not to specify</option></select></label>
					</div>
					<fieldset className="mt-6 border-0 p-0"><legend className="mb-3 text-sm font-semibold">Reported symptoms <span className="font-normal text-primary-9">(select all that apply)</span></legend><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{SYMPTOMS.map(item => { const checked = selectedSymptoms.includes(item.id); return <button key={item.id} type="button" aria-pressed={checked} onClick={() => setSelectedSymptoms(current => checked ? current.filter(id => id !== item.id) : [...current, item.id])} className={`min-h-12 rounded-lg border px-3 py-2 text-left text-sm font-medium transition ${checked ? 'border-primary-9 bg-primary-2 ring-1 ring-primary-9' : 'border-primary-4 bg-white hover:bg-primary-2'}`}>{item.label}</button>; })}</div></fieldset>
					<div className="mt-6 flex flex-wrap items-center justify-between gap-4"><span className="text-sm text-primary-9">Current triage score: <strong className="text-primary-12">{score} / 100</strong></span><button type="button" onClick={() => setStep('result')} className="rounded-md bg-primary-9 px-5 py-2.5 font-semibold text-white hover:bg-primary-10">Review assessment →</button></div>
				</section>
				<aside className="flex flex-col gap-5">
					<section className={panelClass}><h2 className="mb-3 mt-0 text-lg font-semibold">Assessment progress</h2><div className="space-y-3">{progress.map(item => <div key={item.label}><div className="mb-1 flex justify-between text-sm"><span>{item.label}</span><span className="text-primary-9">{item.value}%</span></div><div className="h-2 overflow-hidden rounded-full bg-primary-2"><div className="h-full rounded-full bg-primary-9 transition-all" style={{ width: `${item.value}%` }} /></div></div>)}</div></section>
					<section className={panelClass}><h2 className="mb-2 mt-0 text-lg font-semibold">Suggested questions</h2><ul className="mb-0 space-y-2 pl-5 text-sm text-primary-10"><li>When did the symptoms begin?</li><li>Have symptoms changed recently?</li><li>Does the patient have relevant medical history?</li></ul></section>
					<section className={`${panelClass} border-dashed`}><h2 className="mb-2 mt-0 text-lg font-semibold">Handover notes</h2><textarea className="min-h-24 w-full resize-y rounded-md border border-primary-5 p-3 text-sm" aria-label="Handover notes" placeholder="Record notes for the receiving team" /></section>
				</aside>
			</div>
		</> : <section className={`${panelClass} mx-auto max-w-3xl`} aria-labelledby="result-heading">
			<div className="mb-5 flex flex-wrap items-start justify-between gap-4"><div><p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary-9">Nurse intake · assessment result</p><h1 id="result-heading" className="m-0 text-2xl font-semibold">Recommended next step</h1></div><span className="rounded-lg bg-primary-2 px-4 py-2 font-mono tabular-nums">◷ {timeLabel(seconds)}</span></div>
			<div className="grid gap-6 sm:grid-cols-[12rem_1fr] sm:items-center"><ScoreGauge score={score} /><div><p className="mb-1 text-sm text-primary-9">Computed severity score</p><p className="mb-4 mt-0 text-4xl font-bold">{score}<span className="text-lg font-medium text-primary-9"> / 100</span></p><p className="mb-2 text-sm text-primary-9">Recommended action</p><p className="m-0 text-2xl font-semibold">{action}</p><p className="mt-2 text-sm text-primary-9">{action === 'Dispatch Ambulance' ? 'Escalate to emergency services immediately.' : action === 'See GP' ? 'Arrange clinical review within 24 hours.' : 'Continue to monitor and seek care if symptoms worsen.'}</p></div></div>
			<div className="mt-6 rounded-lg bg-primary-2 p-4"><h2 className="mb-3 mt-0 text-base font-semibold">Information completeness</h2><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{progress.map(item => <div key={item.label} className="rounded-md bg-white p-3"><p className="m-0 text-xs text-primary-9">{item.label}</p><p className="mb-0 mt-1 font-semibold">{item.value}%</p></div>)}</div></div>
			<div className="mt-6 flex flex-col-reverse justify-between gap-3 sm:flex-row"><button type="button" onClick={() => setStep('intake')} className="rounded-md border border-primary-5 px-4 py-2 font-semibold hover:bg-primary-2">← Back to assessment</button><button type="button" onClick={finish} className="rounded-md bg-primary-9 px-4 py-2 font-semibold text-white hover:bg-primary-10">Add to dispatch queue</button></div>
		</section>}
	</main>;
}

function ScoreGauge({ score }: { score: number }): React.JSX.Element {
	return <div className="mx-auto w-full max-w-48" role="img" aria-label={`Severity score ${score} out of 100`}><div className="relative h-4 overflow-hidden rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-600"><span className="absolute -top-1 h-6 w-1 rounded bg-primary-12 shadow" style={{ left: `${score}%` }} /></div><div className="mt-2 flex justify-between text-xs text-primary-9"><span>Low</span><span>Moderate</span><span>High</span></div></div>;
}

function DispatchDetails({ patient, onDispatch }: { patient: Patient; onDispatch: (patient: Patient) => void }): React.JSX.Element {
	const level = priority(patient.score);
	const advice = level === 'Critical' ? 'Dispatch emergency medical services immediately.' : level === 'Medium' ? 'Advise patient to see a GP within 24 hours.' : 'Recommend a GP visit in the next 1–3 days if symptoms persist.';
	return <><p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary-9">Selected request</p><h2 className="mb-6 mt-0 text-2xl font-semibold">{patient.firstName} {patient.lastName}</h2><div className="grid gap-4 sm:grid-cols-[0.7fr_1.3fr]"><div><p className="mb-1 text-sm text-primary-9">Priority level</p><p className="m-0 text-2xl font-semibold">{level}</p></div><div><p className="mb-1 text-sm text-primary-9">Recommended action</p><p className="m-0 font-semibold">{advice}</p></div></div><div className="my-8 rounded-xl bg-primary-2 p-5"><div className="mb-2 flex justify-between text-sm"><span>Severity score</span><strong>{patient.score} / 100</strong></div><div className="relative h-4 overflow-hidden rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-600"><span className="absolute -top-1 h-6 w-1 rounded bg-primary-12 shadow" style={{ left: `${patient.score}%` }} /></div><div className="mt-2 flex justify-between text-xs text-primary-9"><span>Low</span><span>Moderate</span><span>Critical</span></div><p className="mb-0 mt-5 text-sm text-primary-9">Reported assessment completed in {timeLabel(patient.timeSeconds)}.</p></div>{level === 'Critical' && <p className="text-sm">Estimated arrival: <strong>{patient.eta} min</strong></p>}<button type="button" disabled={patient.status === 'dispatched'} onClick={() => onDispatch(patient)} className="mt-auto rounded-md bg-primary-9 px-4 py-3 font-semibold text-white hover:bg-primary-10 disabled:cursor-not-allowed disabled:opacity-60">{patient.status === 'dispatched' ? 'Already dispatched' : 'Dispatch ambulance'}</button></>;
}
