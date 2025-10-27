const jsonapiHeaders = {
  'Content-Type': 'application/vnd.api+json',
};
const regularHeaders = {
  'Content-Type': 'application/json',
};

type PostProps = {
  url: string;
  jwt?: string;
  data: any;
  jsonapi?: boolean;
};

export const Post = ({
  url,
  jwt,
  data,
  jsonapi = true,
}: PostProps): Promise<any> => {
  const common = jsonapi ? { ...jsonapiHeaders } : { ...regularHeaders };
  const headers = jwt
    ? {
        ...common,
        Authorization: `Bearer ${jwt}`,
      }
    : common;
  return new Promise((res, rej) => {
    fetch(url, {
      method: 'POST',
      headers,
      body: jsonapi
        ? JSON.stringify({
            data: data,
          })
        : JSON.stringify(data),
    })
      .then((response) =>
        response
          .json()
          .then((data) => (response.status >= 400 ? rej(data) : res(data)))
          .catch((error) => rej(error))
      )
      .catch((error) => rej(error));
  });
};

type PatchProps = {
  url: string;
  jwt?: string;
  data: any;
  jsonapi?: boolean;
};

export const Patch = ({
  url,
  jwt,
  data,
  jsonapi = true,
}: PatchProps): Promise<any> => {
  const common = jsonapi ? { ...jsonapiHeaders } : { ...regularHeaders };
  const headers = jwt
    ? {
        ...common,
        Authorization: `Bearer ${jwt}`,
      }
    : common;
  return new Promise((res, rej) => {
    fetch(url, {
      method: 'PATCH',
      headers,
      body: jsonapi
        ? JSON.stringify({
            data: data,
          })
        : JSON.stringify(data),
    })
      .then((response) =>
        response
          .json()
          .then((data) => (response.status >= 400 ? rej(data) : res(data)))
          .catch((error) => rej(error))
      )
      .catch((error) => rej(error));
  });
};

type GetProps = {
  url: string;
  jwt?: string;
  jsonapi?: boolean;
};

export const Get = ({ url, jwt, jsonapi = true }: GetProps): Promise<any> => {
  const common = jsonapi ? { ...jsonapiHeaders } : { ...regularHeaders };
  const headers = jwt
    ? {
        ...common,
        Authorization: `Bearer ${jwt}`,
      }
    : {};
  return new Promise((res, rej) => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort();
      rej('timeout');
    }, 8000);
    fetch(url, {
      method: 'GET',
      headers,
      signal: controller.signal,
    })
      .then((response) =>
        response
          .json()
          .then((data) => (response.status >= 400 ? rej(data) : res(data)))
          .catch((error) => rej(error))
          .finally(() => clearTimeout(timer))
      )
      .catch((error) => rej(error));
  });
};

type DeleteProps = {
  url: string;
  jwt?: string;
  jsonapi?: boolean;
};

export const Delete = ({
  url,
  jwt,
  jsonapi = true,
}: DeleteProps): Promise<any> => {
  const common = jsonapi ? { ...jsonapiHeaders } : { ...regularHeaders };
  const headers = jwt
    ? {
        ...common,
        Authorization: `Bearer ${jwt}`,
      }
    : common;
  return new Promise((res, rej) => {
    fetch(url, {
      method: 'DELETE',
      headers,
    })
      .then(() => res(null))
      .catch((error) => rej(error));
  });
};
