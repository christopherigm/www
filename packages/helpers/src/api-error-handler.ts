export type APIError = {
  message: string;
  code: string;
  status: number;
};

export const GetFirstErrorMessage = (errors: Array<any>): APIError => {
  let message = '';
  let code = '';
  let status = 0;
  for (let i = 0; i < errors.length; i++) {
    if (errors[i].code) {
      code = errors[i].code;
    }
    if (errors[i].status) {
      status = Number(errors[i].status);
    }
    if (errors[i].detail) {
      let entity = errors[i]?.source?.pointer ?? '';
      if (entity) {
        entity = entity.split('/');
        entity = entity[entity.length - 1];
      }
      message = errors[i].detail + ` [${entity}]`;
      break;
    }
  }
  return {
    message,
    code,
    status,
  };
};
