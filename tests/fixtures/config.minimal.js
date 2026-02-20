export const minimalWorkflow = [
  { type: 'state', key: 'NS', short: 'NS', title: 'Not Started', description: '' },
  { type: 'milestone', key: 'START', short: 'GO', title: 'Start', color: '#6554c0' },
  { type: 'state', key: 'DEV', short: 'DEV', title: 'In Development', description: '' },
  { type: 'milestone', key: 'M1', short: 'M1', title: 'Done', color: '#229954' },
  { type: 'state', key: 'DONE', short: 'DONE', title: 'Done', description: '' },
];

export const minimalDeliverables = [
  {
    name: 'Task Alpha',
    atRisk: false,
    showInTimeline: true,
    group: 'Group A',
    milestones: { START: '01/01/2026', M1: '01/06/2026' }
  },
  {
    name: 'Task Beta',
    atRisk: true,
    showInTimeline: true,
    group: 'Group A',
    dependencies: ['Task Alpha'],
    milestones: { START: '01/03/2026', M1: '01/09/2026' }
  },
  {
    name: 'Task Gamma',
    atRisk: false,
    showInTimeline: false,
    milestones: { START: '01/06/2026', M1: '01/12/2026' }
  },
];

export const minimalConfig = {
  TIMELINE: { TODAY: '15/04/2026', START_MONTH: '01/2026', END_MONTH: '12/2026' },
  WORKFLOW: minimalWorkflow,
  DELIVERABLES: minimalDeliverables,
};
