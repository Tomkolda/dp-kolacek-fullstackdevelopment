import {
  type FormField,
  type FormValidate,
} from '@/components/shared/AdminModal/types';
import type {DBMember} from '@/db/types';
import {createRequiredTextValidator} from '@/lib/utils/adminForm';

export type MemberFormValues = {
  name: string;
  instrument: string;
  location: string;
  image: string;
};

export const initialMemberFormValues: MemberFormValues = {
  name: '',
  instrument: '',
  location: '',
  image: '',
};

export const memberFormValidate: FormValidate<MemberFormValues> = {
  name: createRequiredTextValidator('Jméno je povinné'),
  instrument: createRequiredTextValidator('Nástroj je povinný'),
  image: createRequiredTextValidator('Fotka je povinná'),
};

export const memberFormFields: Array<FormField<MemberFormValues>> = [
  {
    type: 'text',
    name: 'name',
    label: 'Jméno',
    placeholder: 'Např. Rudy',
    required: true,
  },
  {
    type: 'text',
    name: 'instrument',
    label: 'Nástroj',
    placeholder: 'Např. Zpěv, kytara',
    required: true,
  },
  {
    type: 'text',
    name: 'location',
    label: 'Lokace',
    placeholder: 'Např. Uherské Hradiště',
  },
  {
    type: 'storageImage',
    name: 'image',
    bucket: 'members',
    label: 'Fotka',
    required: true,
  },
];

export function toMemberFormValues(member: DBMember): MemberFormValues {
  return {
    name: member.name,
    instrument: member.instrument,
    location: member.location ?? '',
    image: member.image ?? '',
  };
}

export function toMemberInput(values: MemberFormValues) {
  return {
    name: values.name,
    instrument: values.instrument,
    location: values.location || null,
    image: values.image || null,
  };
}
