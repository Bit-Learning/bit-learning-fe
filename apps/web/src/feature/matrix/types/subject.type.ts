export type TSubjectResponse = {
  id: number;
  name: string;
  code: string;
  description?: string;
  classLevel: number;
  createdAt: string;
  updatedAt: string;
};

export type TSubjectBriefResponse = {
  id: number;
  name: string;
  code: string;
};
