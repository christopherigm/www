export interface APIPostCreationError {
  detail: string;
  status: number;
  pointer: string;
  code: string;
}

export interface CreationErrorInput {
  detail: string;
  status: number | string;
  source: {
    pointer: string;
  };
  code: string;
}

export type APIError = {
  message: string;
  code: string;
  status: number;
};
