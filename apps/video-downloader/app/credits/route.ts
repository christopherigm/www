import API from '@repo/helpers/api/index';
// https://apibox.erweima.ai/api/v1/generate/credit

export async function GET() {
  const sunaAPI = process.env.SUNA_API_KEY ?? '';
  const url = 'https://apibox.erweima.ai/api/v1/generate/credit';

  return API.Get({
    url,
    jwt: sunaAPI,
    jsonapi: false,
  })
    .then((response: unknown) => {
      console.log('>>> response:', response);
      return Response.json(response, {
        status: 200,
      });
    })
    .catch((error) => {
      Response.json(error.toString(), {
        status: 400,
      });
    });
}
