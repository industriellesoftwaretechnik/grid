import { selectionColumn } from '@/components/data-grid/selection-column';
import { departments, statuses, type Person } from '@/people/samplePeople';
import { createGridColumnHelper } from '@istec/grid';

const helper = createGridColumnHelper<Person>();

const label = (value: unknown) => (typeof value === 'string' ? value.charAt(0).toUpperCase() + value.slice(1) : '');
const required = (value: unknown) => (typeof value === 'string' && value.trim() !== '' ? undefined : 'Required');
const currency = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' });

export const peopleColumns = helper.columns([
  selectionColumn<Person>(),
  helper.group({
    id: 'person',
    header: 'Person',
    columns: helper.columns([
      helper.accessor('firstName', { header: 'First name', enableEditing: true, validateCellValue: required }),
      helper.accessor('lastName', { header: 'Last name', enableEditing: true, validateCellValue: required }),
      helper.accessor('age', {
        header: 'Age',
        size: 80,
        aggregationFn: 'mean',
        enableEditing: true,
        validateCellValue: (age) =>
          Number.isInteger(age) && age >= 16 && age <= 99 ? undefined : 'An age between 16 and 99',
        meta: {
          cellClassName: (age) => (typeof age === 'number' && age >= 60 ? 'text-amber-600' : undefined),
        },
      }),
      helper.accessor('email', {
        header: 'Email',
        cell: ({ getValue }) => (
          <a href={`mailto:${getValue()}`} className="text-primary underline-offset-2 hover:underline">
            {getValue()}
          </a>
        ),
        size: 260,
        enableSorting: false,
        enableEditing: true,
        validateCellValue: (email) => (/^\S+@\S+\.\S+$/.test(email) ? undefined : 'Not a valid email address'),
        meta: { tooltip: true },
      }),
    ]),
  }),
  helper.group({
    id: 'work',
    header: 'Work',
    columns: helper.columns([
      helper.accessor('status', {
        header: 'Status',
        enableEditing: true,
        meta: { dataType: 'enum', options: statuses, formatValue: label },
      }),
      helper.accessor('department', {
        header: 'Department',
        enableEditing: true,
        meta: { dataType: 'enum', options: departments, formatValue: label },
      }),
      helper.accessor('salary', {
        header: 'Salary',
        aggregationFn: 'sum',
        enableEditing: true,
        meta: { formatValue: (value) => (typeof value === 'number' ? currency.format(value) : '') },
      }),
      helper.accessor('joinDate', {
        header: 'Joined',
        sortFn: 'datetime',
        enableEditing: true,
        cell: ({ getValue }) => dateFormat.format(getValue()),
      }),
    ]),
  }),
]);
