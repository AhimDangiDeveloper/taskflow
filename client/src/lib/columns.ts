import type { ColumnCopy } from '../types';

export const BOARD_COLUMNS: ColumnCopy[] = [
  { status: 'To-Do', hint: 'Waiting to start', empty: 'Nothing waiting to start.' },
  { status: 'In-Progress', hint: 'Currently moving', empty: 'Nothing in progress yet.' },
  { status: 'Done', hint: 'Finished work', empty: 'Nothing finished yet.' },
];
