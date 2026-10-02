import { useEffect, useState } from 'react';

/** Patient contact and demographic fields collected for a referral. */
type PatientFormData = {
	firstName: string;
	lastName: string;
	phone: string;
	location: string;
	gender: string;
	age: string;
};

/** Minimal local record used to show the emergency dispatch referral result. */
type PatientRec = {
	id: string;
	firstName: string;
	lastName: string;
	score: number;
	eta: string;
	status: 'pending' | 'dispatched';
	timeSeconds: number;
};

const SYMPTOMS = [
	{ id: 'chest_pain', label: 'Chest Pain', weight: 55 },
	{ id: 'breathing', label: 'Difficulty Breathing', weight: 45 },
	{ id: 'unconscious', label: 'Unconscious', weight: 80 },
	{ id: 'dizziness', label: 'Dizziness', weight: 25 },
	{ id: 'headache', label: 'Headache', weight: 15 },
	{ id: 'nausea', label: 'Nausea', weight: 10 },
	{ id: 'fever', label: 'High Fever', weight: 20 },
	{ id: 'bleeding', label: 'Severe Bleeding', weight: 50 },
];

const PATIENTS_STORAGE_KEY = 'terra-patients';
const INITIAL_PATIENTS: PatientRec[] = [
	{
		id: 'patient-1',
		firstName: 'Sarah',
		lastName: 'Connor',
		score: 85,
		eta: '6-8',
		status: 'pending',
		timeSeconds: 45,
	},
	{
		id: 'patient-2',
		firstName: 'Kyle',
		lastName: 'Reese',
		score: 42,
		eta: 'N/A',
		status: 'pending',
		timeSeconds: 112,
	},
	{
		id: 'patient-3',
		firstName: 'Miles',
		lastName: 'Dyson',
		score: 92,
		eta: '3-5',
		status: 'dispatched',
		timeSeconds: 15,
	},
];

const inputClassName =
	'flex h-10 w-full rounded-md border border-primary-6 bg-white px-3 py-2 text-base text-primary-12 placeholder:text-primary-11/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-11 disabled:cursor-not-allowed disabled:opacity-50';

/** Renders the interactive GP triage form and its local referral timer demo.
 * @returns The triage interface after client hydration, or `null` during server rendering.
 */
export default function GpDemo(): React.JSX.Element | null {
	const [isMounted, setIsMounted] = useState(false);
	const [selSymptoms, setSelSymptoms] = useState<string[]>([]);
	const [seconds, setSeconds] = useState(0);
	const [formData, setFormData] = useState<PatientFormData>({
		firstName: '',
		lastName: '',
		phone: '',
		location: '',
		gender: '',
		age: '',
	});

	useEffect(() => {
		setIsMounted(true);
	}, []);

	useEffect(() => {
		const timer = setInterval(() => {
			setSeconds(current => current + 1);
		}, 1000);
		return () => clearInterval(timer);
	}, []);

	const handleFormChange = (key: keyof PatientFormData, value: string) => {
		setFormData(previous => ({ ...previous, [key]: value }));
	};

	const toggleSymptom = (id: string) => {
		setSelSymptoms(previous => (previous.includes(id) ? previous.filter(symptom => symptom !== id) : [...previous, id]));
	};

	const calcdScore = Math.min(
		99,
		selSymptoms.reduce((score, id) => {
			const symptom = SYMPTOMS.find(item => item.id === id);
			return score + (symptom ? symptom.weight : 0);
		}, 10),
	);

	const savePatient = () => {
		const patient: PatientRec = {
			id: crypto.randomUUID(),
			firstName: formData.firstName || 'Unknown',
			lastName: formData.lastName || 'Patient',
			score: calcdScore,
			eta: '6-8',
			status: 'pending',
			timeSeconds: seconds,
		};
		try {
			const existing = window.localStorage.getItem(PATIENTS_STORAGE_KEY);
			const patients = existing ? (JSON.parse(existing) as PatientRec[]) : INITIAL_PATIENTS;
			window.localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify([...patients, patient]));
		} catch {
			// Keep the visible demo confirmation available if browser storage is disabled.
		}
	};

	if (!isMounted) return null;

	const handleGpReferral = () => {
		savePatient();
		alert('Patient information transferred to Emergency Dispatch.');
	};

	return (
		<div className='mx-auto flex w-full max-w-3xl flex-col'>
			<div className='mb-6 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-900'>
				<svg className='mt-0.5 size-5 shrink-0' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8' aria-hidden='true'>
					<circle cx='12' cy='12' r='9' />
					<path d='M12 11v5m0-8h.01' strokeLinecap='round' />
				</svg>
				<p className='text-sm font-medium'>For patients in critical condition, transfer the patient information to emergency services for prompt service.</p>
			</div>
			<div className='flex flex-col overflow-auto rounded-xl border border-primary-6 bg-primary-2 text-primary-12 shadow-sm'>
				<div className='flex flex-col space-y-1.5 p-6 pb-0 pt-4'>
					<h1 className='m-0 text-base font-semibold leading-none tracking-tight'>Patient Info</h1>
				</div>
				<div className='space-y-8 p-6 text-base'>
					<div className='grid grid-cols-2 gap-2'>
						{(
							[
								{
									label: 'First Name',
									key: 'firstName',
									type: 'text',
									placeholder: 'Jane',
								},
								{
									label: 'Last Name',
									key: 'lastName',
									type: 'text',
									placeholder: 'Doe',
								},
								{
									label: 'Phone Number',
									key: 'phone',
									type: 'tel',
									placeholder: '(555) 123-4567',
								},
								{
									label: 'Location',
									key: 'location',
									type: 'text',
									placeholder: '123 Main St',
								},
							] as const
						).map(field => (
							<div key={field.key} className='grid gap-1'>
								<label className='text-sm font-medium leading-none text-primary-11' htmlFor={`field-${field.key}`}>
									{field.label}
								</label>
								<input
									id={`field-${field.key}`}
									type={field.type}
									placeholder={field.placeholder}
									className={inputClassName}
									value={formData[field.key]}
									onChange={event => handleFormChange(field.key, event.currentTarget.value)}
								/>
							</div>
						))}
						<div className='grid gap-1'>
							<label className='text-sm font-medium leading-none text-primary-11' htmlFor='field-gender'>
								Gender
							</label>
							<select id='field-gender' aria-label='Select...' className={inputClassName} value={formData.gender} onChange={event => handleFormChange('gender', event.currentTarget.value)}>
								<option value=''>Select...</option>
								<option value='Male'>Male</option>
								<option value='Female'>Female</option>
								<option value='Other'>Other</option>
								<option value='Prefer not to specify'>Prefer not to specify</option>
							</select>
						</div>
						<div className='grid gap-1'>
							<label className='text-sm font-medium leading-none text-primary-11' htmlFor='field-age'>
								Age
							</label>
							<input id='field-age' type='number' placeholder='52' className={inputClassName} value={formData.age} onChange={event => handleFormChange('age', event.currentTarget.value)} />
						</div>
					</div>

					<div className='space-y-3 pt-2'>
						<p className='text-sm font-medium text-current/80'>Reported Symptoms (Select 1 or more)</p>
						<div className='grid grid-cols-2 gap-2 sm:grid-cols-3'>
							{SYMPTOMS.map(symptom => {
								const selected = selSymptoms.includes(symptom.id);
								return (
									<button
										key={symptom.id}
										type='button'
										aria-pressed={selected}
										data-state={selected ? 'checked' : 'unchecked'}
										onClick={() => toggleSymptom(symptom.id)}
										className='flex w-full flex-col items-start space-y-1 rounded-lg border border-primary-5 bg-primary-2 p-2.5 text-left text-sm text-primary-12 ring-inset transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-7/70 enabled:hover:border-primary-6 data-[state=checked]:!border-primary-9 data-[state=checked]:ring-1 data-[state=checked]:ring-primary-9'
									>
										<span className='font-medium'>{symptom.label}</span>
									</button>
								);
							})}
						</div>
					</div>

					<div className='pt-2'>
						<button
							type='button'
							onClick={handleGpReferral}
							className='inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-rose-700 bg-rose-600 px-4 text-base font-semibold text-white transition-colors hover:bg-rose-600/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
						>
							Refer to Ambulance Dispatch
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
