export type ChecklistTemplate = {
  title: string
  description: string
  category: string
  priority: number
  official_link?: string
  deadline_days: number
}

const IRELAND_STAMP_1G: ChecklistTemplate[] = [
  {
    title: 'Apply for Stamp 1G before leaving Ireland',
    description:
      'Book your appointment at Burgh Quay via the Customer Service Portal. Do NOT travel home before completing this — you will lose your post-study work rights.',
    category: 'Immigration',
    priority: 1,
    official_link: 'https://www.irishimmigration.ie',
    deadline_days: 0,
  },
  {
    title: 'Get your PPS Number',
    description:
      'Your Personal Public Service number is needed for everything — work, tax, GP, and benefits. Apply at your local Intreo office with your passport and IRP card.',
    category: 'Admin',
    priority: 2,
    official_link:
      'https://www.gov.ie/en/service/12e6f-get-a-personal-public-service-pps-number/',
    deadline_days: 7,
  },
  {
    title: 'Open an Irish Bank Account',
    description:
      'Start with Revolut or N26 — they open instantly with just your passport. Use their statements later to open a traditional AIB or Bank of Ireland account.',
    category: 'Finance',
    priority: 3,
    deadline_days: 14,
  },
  {
    title: 'Get Medical Insurance',
    description:
      'Required for your IRP registration. Must show minimum €25,000 in-hospital coverage. Travel insurance does NOT count. Try Laya Healthcare or VHI.',
    category: 'Health',
    priority: 4,
    deadline_days: 14,
  },
  {
    title: 'Register with a GP',
    description:
      'Find a GP accepting new patients before you need one — it can take weeks. Check hse.ie for your nearest options.',
    category: 'Health',
    priority: 5,
    official_link: 'https://www.hse.ie/eng/services/list/2/gp/',
    deadline_days: 30,
  },
  {
    title: 'Register with Revenue for tax',
    description:
      'Apply for your tax credits immediately or you\'ll be put on Emergency Tax and overpay significantly.',
    category: 'Finance',
    priority: 6,
    official_link: 'https://www.revenue.ie',
    deadline_days: 30,
  },
]

const IRELAND_CRITICAL_SKILLS: ChecklistTemplate[] = [
  {
    title: 'Confirm your employer applied for your permit via EPOS',
    description:
      'Your employer applies on your behalf through the Employment Permits Online System. You cannot start work until it is issued.',
    category: 'Immigration',
    priority: 1,
    official_link: 'https://epos.enterprise.gov.ie',
    deadline_days: 0,
  },
  {
    title: 'Apply for your Irish Entry Visa',
    description:
      'Apply online via the AVATS system after your permit is approved. Allow 20–25 working days for processing.',
    category: 'Immigration',
    priority: 2,
    official_link: 'https://www.visas.inis.gov.ie',
    deadline_days: 0,
  },
  {
    title: 'Register your IRP within 90 days of arrival',
    description:
      'Book at Burgh Quay in Dublin. Bring passport, permit letter, employment contract, proof of address, and €300 fee.',
    category: 'Immigration',
    priority: 3,
    official_link: 'https://www.irishimmigration.ie',
    deadline_days: 90,
  },
  {
    title: 'Get your PPS Number',
    description:
      'Apply at your local Intreo office with your passport and IRP card. Needed for tax, GP, and all public services.',
    category: 'Admin',
    priority: 4,
    official_link:
      'https://www.gov.ie/en/service/12e6f-get-a-personal-public-service-pps-number/',
    deadline_days: 7,
  },
  {
    title: 'Open an Irish Bank Account',
    description:
      'Start with Revolut or N26 instantly, then move to a traditional bank once you have statements as proof of address.',
    category: 'Finance',
    priority: 5,
    deadline_days: 14,
  },
  {
    title: 'Register with Revenue for tax',
    description:
      'Register immediately and apply for correct tax credits to avoid Emergency Tax on your payslip.',
    category: 'Finance',
    priority: 6,
    official_link: 'https://www.revenue.ie',
    deadline_days: 30,
  },
]

const UK_GRADUATE_ROUTE: ChecklistTemplate[] = [
  {
    title: 'Apply for Graduate Route Visa before Student Visa expires',
    description:
      'Must apply from inside the UK. Fee is £822. Apply online and allow up to 8 weeks for a decision.',
    category: 'Immigration',
    priority: 1,
    official_link: 'https://www.gov.uk/graduate-visa',
    deadline_days: 0,
  },
  {
    title: 'Collect your BRP card',
    description:
      'Your Biometric Residence Permit will be ready at the Post Office named in your decision letter. Collect within 10 days of arrival.',
    category: 'Immigration',
    priority: 2,
    deadline_days: 10,
  },
  {
    title: 'Get your National Insurance Number',
    description:
      'The UK equivalent of Ireland\'s PPS number. Apply online — you can start work before it arrives but give it to your employer when it comes.',
    category: 'Admin',
    priority: 3,
    official_link: 'https://www.gov.uk/apply-national-insurance-number',
    deadline_days: 7,
  },
  {
    title: 'Open a UK Bank Account',
    description:
      'Start with Monzo or Starling — they open with just your passport and BRP. Then graduate to Barclays or HSBC once you have statements.',
    category: 'Finance',
    priority: 4,
    deadline_days: 14,
  },
  {
    title: 'Register with a GP',
    description:
      'NHS is free for you — your visa fee included the health surcharge. Register before you need them.',
    category: 'Health',
    priority: 5,
    official_link: 'https://www.nhs.uk/service-search/find-a-gp',
    deadline_days: 14,
  },
]

const UK_SKILLED_WORKER: ChecklistTemplate[] = [
  {
    title: 'Confirm your employer is a licensed sponsor',
    description:
      'Check the official register — if your employer isn\'t on it they cannot legally sponsor you.',
    category: 'Immigration',
    priority: 1,
    official_link:
      'https://www.gov.uk/government/publications/register-of-licensed-sponsors-workers',
    deadline_days: 0,
  },
  {
    title: 'Receive your Certificate of Sponsorship from employer',
    description:
      'Your employer generates this, not you. It has a reference number you need for your visa application.',
    category: 'Immigration',
    priority: 2,
    deadline_days: 0,
  },
  {
    title: 'Apply for Skilled Worker Visa',
    description:
      'Apply online. Fee is £827 for up to 3 years. Plus Immigration Health Surcharge of £1,035 per year.',
    category: 'Immigration',
    priority: 3,
    official_link: 'https://www.gov.uk/skilled-worker-visa',
    deadline_days: 0,
  },
  {
    title: 'Collect your BRP card',
    description:
      'Collect within 10 days of arrival from the Post Office in your decision letter.',
    category: 'Immigration',
    priority: 4,
    deadline_days: 10,
  },
  {
    title: 'Get your National Insurance Number',
    description: 'Apply online as soon as you arrive.',
    category: 'Admin',
    priority: 5,
    official_link: 'https://www.gov.uk/apply-national-insurance-number',
    deadline_days: 7,
  },
  {
    title: 'Open a UK Bank Account',
    description:
      'Monzo or Starling first, then traditional bank once you have statements.',
    category: 'Finance',
    priority: 6,
    deadline_days: 14,
  },
  {
    title: 'Register with a GP',
    description:
      'NHS is free — your health surcharge is already paid as part of your visa fee.',
    category: 'Health',
    priority: 7,
    official_link: 'https://www.nhs.uk/service-search/find-a-gp',
    deadline_days: 14,
  },
]

const IRELAND_STAMP_2: ChecklistTemplate[] = [
  {
    title: 'Register your IRP within 90 days of arrival',
    description:
      'Book your appointment to get your Irish Residence Permit card. Bring your passport, acceptance letter from your college, proof of address, medical insurance, and €300 fee.',
    category: 'Immigration',
    priority: 1,
    official_link: 'https://www.irishimmigration.ie',
    deadline_days: 90,
  },
  {
    title: 'Get your PPS Number',
    description:
      'Your Personal Public Service number is needed for work, tax, and some services. Apply at your local Intreo office with your passport and IRP card.',
    category: 'Admin',
    priority: 2,
    official_link:
      'https://www.gov.ie/en/service/12e6f-get-a-personal-public-service-pps-number/',
    deadline_days: 14,
  },
  {
    title: 'Open an Irish Bank Account',
    description:
      'Start with Revolut or N26 — they open instantly with just your passport. You will need this to receive any wages from part-time work.',
    category: 'Finance',
    priority: 3,
    deadline_days: 14,
  },
  {
    title: 'Know your work limits on Stamp 2',
    description:
      'You can work a maximum of 20 hours per week during college term time and 40 hours per week during holidays. Working more than this violates your visa conditions.',
    category: 'Work Rights',
    priority: 4,
    deadline_days: 7,
  },
  {
    title: 'Get Medical Insurance',
    description:
      'Required for IRP registration. Must show minimum €25,000 in-hospital coverage. Travel insurance does NOT count. Try Laya Healthcare, VHI, or your college student union plan which is often cheaper.',
    category: 'Health',
    priority: 5,
    deadline_days: 7,
  },
  {
    title: 'Register with a GP near your college',
    description:
      'Find a GP accepting new patients before you need one. Ask your college student services — many have an on-campus GP or a recommended local practice.',
    category: 'Health',
    priority: 6,
    official_link: 'https://www.hse.ie/eng/services/list/2/gp/',
    deadline_days: 30,
  },
  {
    title: 'Plan your Stamp 1G application before graduating',
    description:
      'If you plan to stay in Ireland after graduation, you MUST apply for Stamp 1G before leaving Ireland and before your Stamp 2 expires. Start researching this early — do not leave Ireland without switching.',
    category: 'Immigration',
    priority: 7,
    official_link: 'https://www.irishimmigration.ie',
    deadline_days: 60,
  },
]

const UK_STUDENT_VISA: ChecklistTemplate[] = [
  {
    title: 'Collect your BRP card within 10 days of arrival',
    description:
      'Your Biometric Residence Permit will be at the Post Office named in your visa decision letter. Collect it within 10 days — missing this deadline causes serious problems.',
    category: 'Immigration',
    priority: 1,
    deadline_days: 10,
  },
  {
    title: "Register with your university's international student office",
    description:
      'Do this on arrival — they handle your CAS, visa compliance reporting, and can help with any immigration questions during your studies.',
    category: 'Admin',
    priority: 2,
    deadline_days: 3,
  },
  {
    title: 'Get your National Insurance Number',
    description:
      'You need this to work part-time legally. Apply online — you can work while waiting for it to arrive but give it to your employer when it comes.',
    category: 'Admin',
    priority: 3,
    official_link: 'https://www.gov.uk/apply-national-insurance-number',
    deadline_days: 14,
  },
  {
    title: 'Open a UK Bank Account',
    description:
      'Start with Monzo or Starling — they open with just your passport and BRP. Your university may also have a partnership with a bank offering student accounts.',
    category: 'Finance',
    priority: 4,
    deadline_days: 14,
  },
  {
    title: 'Register with a GP near your university',
    description:
      'NHS is free for you — your visa fee included the health surcharge. Register immediately, before you need them.',
    category: 'Health',
    priority: 5,
    official_link: 'https://www.nhs.uk/service-search/find-a-gp',
    deadline_days: 14,
  },
  {
    title: 'Know your work limits on Student Visa',
    description:
      'You can work maximum 20 hours per week during term time and full time during holidays. Check your BRP card — it will state your exact work conditions.',
    category: 'Work Rights',
    priority: 6,
    deadline_days: 7,
  },
  {
    title: 'Plan your Graduate Route Visa before finishing your degree',
    description:
      'Apply for the Graduate Route Visa before your Student Visa expires — you must apply from inside the UK. This gives you 2 years (Bachelor\'s/Master\'s) or 3 years (PhD) to work freely.',
    category: 'Immigration',
    priority: 7,
    official_link: 'https://www.gov.uk/graduate-visa',
    deadline_days: 60,
  },
]

const GENERIC_FALLBACK: ChecklistTemplate[] = [
  {
    title: 'Register your immigration permission',
    description:
      'Register with the immigration authorities in your destination country within 90 days of arrival.',
    category: 'Immigration',
    priority: 1,
    deadline_days: 90,
  },
  {
    title: 'Get your tax number',
    description:
      'In Ireland this is your PPS Number. In the UK this is your National Insurance Number. You need it to work and pay tax legally.',
    category: 'Admin',
    priority: 2,
    deadline_days: 14,
  },
  {
    title: 'Open a local bank account',
    description:
      'Start with a digital bank like Revolut, Monzo, or N26 — they open instantly with just your passport.',
    category: 'Finance',
    priority: 3,
    deadline_days: 14,
  },
  {
    title: 'Register with a local doctor',
    description:
      'Find a GP and register before you need one — it can take weeks to get accepted as a new patient.',
    category: 'Health',
    priority: 4,
    deadline_days: 30,
  },
  {
    title: 'Know your employment rights',
    description:
      'As an immigrant you have the same employment rights as local workers. Research the minimum wage, holiday entitlement, and who to contact if you are treated unfairly.',
    category: 'Work Rights',
    priority: 5,
    deadline_days: 14,
  },
]

export function getChecklistTemplate(
  destination: string,
  visaType: string
): ChecklistTemplate[] {
  if (destination === 'Ireland') {
    if (visaType === 'Stamp 2') return IRELAND_STAMP_2
    if (visaType === 'Stamp 1G') return IRELAND_STAMP_1G
    if (visaType === 'Critical Skills Employment Permit') return IRELAND_CRITICAL_SKILLS
  }
  if (destination === 'UK') {
    if (visaType === 'Student Visa') return UK_STUDENT_VISA
    if (visaType === 'Graduate Route Visa') return UK_GRADUATE_ROUTE
    if (visaType === 'Skilled Worker Visa') return UK_SKILLED_WORKER
  }
  return GENERIC_FALLBACK
}
