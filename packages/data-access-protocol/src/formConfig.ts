export type FieldConfig = {
  type: 'text' | 'date' | 'radio';
  label: string;
  required?: boolean;
  options?: { label: string; value: string; toggleTextField?: boolean }[];
  toggleTextFieldLabel?: string;
};

const YES_NO = [
  { label: 'Yes', value: 'yes' },
  { label: 'No', value: 'no' },
];
const YES_NO_DEPENDS = [...YES_NO, { label: 'It depends', value: 'it_depends', toggleTextField: true }];
const ELABORATE = 'Please elaborate';

const radio = (label: string, options = YES_NO_DEPENDS, toggleTextFieldLabel = ELABORATE): FieldConfig =>
  ({ type: 'radio', label, options, toggleTextFieldLabel, required: true });
const text = (label: string, required = false): FieldConfig => ({ type: 'text', label, required });

export const dapFields: Record<string, FieldConfig> = {
  date: { type: 'date', label: 'Date', required: true },
  depositor: text('Name of depositor', true),
  doi: text('DOI of datasets this form applies to', true),
  dataManagementPlanLink: text('Link to data management plan'),
  dataReuseOtherPurposes: radio('Do you allow data to be used for other purposes than research?'),
  dataReuseStudents: radio('Do you allow students to use your data?'),
  dataReuseTeaching: radio('Do you allow the use of your data for teaching?'),
  dataReuseLimitedOrgInd: radio('Is use limited to certain organisations or individuals?'),
  dataReuseCommercial: radio('Do you allow use for commercial purposes?'),
  dataReuseLimitedReg: radio('Is use limited to certain regions? For instance state if data needs to remain in the EU or in the Netherlands.'),
  dataReuseMotivationReq: radio(
    'Do you require a written motivation from the requester?',
    [{ label: 'Yes', value: 'yes', toggleTextField: true }, { label: 'No', value: 'no' }],
    'What information do you expect in the motivation letter? Do you expect a certain format or length? What are the criteria you use to evaluate the motivation letter?',
  ),
  dataReusePeriod: text('Is there a time period for which this protocol applies?'),
  dataReuseOther: text('Are there other agreements that the requester has to sign to gain access to the data?'),
  dataReuseCosts: radio('Are there costs associated with the use of the data?', YES_NO),
  accessRequestsDecision: text('Which individuals or institutes are allowed to decide about the requests? Do you establish a Data Access Committee (DAC) or will one person handle the requests?', true),
  accessRequestsContact: text('Who will be responsible for granting or rejecting access requests?', true),
  accessRequestsAlternativeContact: text('What happens if the person responsible is no longer able to perform this task?', true),
  accessRequestsResponseTime: text('What response time can you guarantee for handling requests?', true),
  other: text('Room for any additional information'),
};