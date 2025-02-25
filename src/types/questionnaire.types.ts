// types/questionnair.types.ts

export interface Questionnair {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  status: QuestionnairStatus;
}

export type QuestionnairStatus = 'assigned' | 'draft' | 'archived';
