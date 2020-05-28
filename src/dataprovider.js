import { stringify } from 'query-string';
import { fetchUtils } from 'ra-core';

const configCache = {};

function getOneFilter(httpClient, apiUrl, resource) {
  return httpClient(`${apiUrl}/${resource}`).then(({ json }) => {
    // debugger
    // TODO 2. ТУТ проверь что данные пришли
    return { data: json };
  });
}

function getConfig(httpClient, apiUrl, resource) {
  // debugger
  // TODO 1. При первом вызове configCache[resource] === undefined
  // TODO При втором вызове configCache[resource] === данные с сервера
  if (configCache[resource]) {
    return Promise.resolve(configCache[resource]);
  }

  return getOneFilter(httpClient, apiUrl, resource).then(config => {
    // debugger
    // TODO 3. Тут смотришь чтобы тебе пришли данные с фильтрами
    // TODO Сюда должны попасть только один раз
    return configCache[resource] = config;
  })
}

export default (apiUrl, httpClient = fetchUtils.fetchJson) => ({
  getOneFilter: (resource) => getOneFilter(httpClient, apiUrl, resource),

  getList: async (resource, params) => {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    const query = {
      ...fetchUtils.flattenObject(params.filter),
      _sort: field,
      _order: order,
      _start: (page - 1) * perPage,
      _end: page * perPage,
    };

    const url = `${apiUrl}/${resource}?${stringify(query)}`;
    const config = await getConfig(httpClient, apiUrl, resource);
    const { headers, json } = await httpClient(url);

    // debugger
    // TODO Тут смотришь чтобы:
    // - в config были нужные данные
    // - в json пришел ответ с сервера

    if (!headers.has('x-total-count')) {
      throw new Error(
        'The X-Total-Count header is missing in the HTTP Response. The jsonServer Data Provider expects responses for lists of resources to contain this header with the total number of results to build the pagination. If you are using CORS, did you declare X-Total-Count in the Access-Control-Expose-Headers header?'
      );
    }
    const { Tickets: data, ...rest} = json;

    return {
      ...rest,
      data: data.map(record => {
        // debugger
        // TODO Тут смотришь что:
        // - в объекте record действительно есть ключ 'METROLocation' который содержит название станции метро,
        //   если нет вставляешь правильный ключ вмиесто record.METROLocation
        // - в объекте config действительно есть ключ 'METROLocationColor' который содержит станции метро: цвет,
        //   если нет вставляешь правильный ключ вместо config.METROLocationColor

        record.METROLocationColor = config.METROLocationColor[record.METROLocation];
        return record;
      }),
      total: parseInt(
        headers
          .get('x-total-count')
          .split('/')
          .pop(),
        10
      ),
    };
  },


//     getList: (resource, params) => {
//         const { page, perPage } = params.pagination;
//         const { field, order } = params.sort;
//         const query = {
//             ...fetchUtils.flattenObject(params.filter),
//             _sort: field,
//             _order: order,
//             _start: (page - 1) * perPage,
//             _end: page * perPage,
//         };
//
//         const url = `${apiUrl}/${resource}?${stringify(query)}`;
//
//         return httpClient(url).then(({ headers, json }) => {
//             if (!headers.has('x-total-count')) {
//                 throw new Error(
//                     'The X-Total-Count header is missing in the HTTP Response. The jsonServer Data Provider expects responses for lists of resources to contain this header with the total number of results to build the pagination. If you are using CORS, did you declare X-Total-Count in the Access-Control-Expose-Headers header?'
//                 );
//             }
//             const { Tickets: data,  ...rest } = json
//             return {
//                 ...rest,
//                 data: data,
//                 total: parseInt(
//                     headers
//                         .get('x-total-count')
//                         .split('/')
//                         .pop(),
//                     10
//                 ),
//             };
//         });
//     },

    getCounter: (resource) => {
            const query = {
                Tab: 1,
                _start: 0,
                _end: 1,
            };
            const url = `${apiUrl}/${resource}?${stringify(query)}`;

            return httpClient(url).then(({ headers, json }) => {
                if (!headers.has('x-total-count')) {
                    throw new Error(
                        'The X-Total-Count header is missing in the HTTP Response. The jsonServer Data Provider expects responses for lists of resources to contain this header with the total number of results to build the pagination. If you are using CORS, did you declare X-Total-Count in the Access-Control-Expose-Headers header?'
                    );
                }
                const { Counters: data } = json
                return {
                    data,
                    total: parseInt(
                        headers
                            .get('x-total-count')
                            .split('/')
                            .pop(),
                        10
                    ),
                };
            });
        },

    getOne: (resource, params) =>
        httpClient(`${apiUrl}/${resource}/${params.id}`).then(({ json }) => ({
            data: json,
        })),


    getMany: (resource, params) => {
        const query = {
            id: params.ids,
        };
        const url = `${apiUrl}/${resource}${stringify(query)}`;
        return httpClient(url).then(({ json }) => ({ data: json }));
    },

    getManyReference: (resource, params) => {
        const { page, perPage } = params.pagination;
        const { field, order } = params.sort;
        const query = {
            ...fetchUtils.flattenObject(params.filter),
            [params.target]: params.id,
            _sort: field,
            _order: order,
            _start: (page - 1) * perPage,
            _end: page * perPage,
        };
        const url = `${apiUrl}/${resource}?${stringify(query)}`;

        return httpClient(url).then(({ headers, json }) => {
            if (!headers.has('x-total-count')) {
                throw new Error(
                    'The X-Total-Count header is missing in the HTTP Response. The jsonServer Data Provider expects responses for lists of resources to contain this header with the total number of results to build the pagination. If you are using CORS, did you declare X-Total-Count in the Access-Control-Expose-Headers header?'
                );
            }
            return {
                data: json,
                total: parseInt(
                    headers
                        .get('x-total-count')
                        .split('/')
                        .pop(),
                    10
                ),
            };
        });
    },

    update: (resource, params) =>
        httpClient(`${apiUrl}/${resource}/${params.id}`, {
            method: 'PUT',
            body: JSON.stringify(params.data),
        }).then(({ json }) => ({ data: json })),

    // json-server doesn't handle filters on UPDATE route, so we fallback to calling UPDATE n times instead
    updateMany: (resource, params) =>
        Promise.all(
            params.ids.map(id =>
                httpClient(`${apiUrl}/${resource}/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify(params.data),
                })
            )
        ).then(responses => ({ data: responses.map(({ json }) => json.id) })),

    create: (resource, params) =>
        httpClient(`${apiUrl}/${resource}`, {
            method: 'POST',
            body: JSON.stringify(params.data),
        }).then(({ json }) => ({
            data: { ...params.data, id: json.id },
        })),

    delete: (resource, params) =>
        httpClient(`${apiUrl}/${resource}/${params.id}`, {
            method: 'DELETE',
        }).then(({ json }) => ({ data: json })),

    // json-server doesn't handle filters on DELETE route, so we fallback to calling DELETE n times instead
    deleteMany: (resource, params) =>
        Promise.all(
            params.ids.map(id =>
                httpClient(`${apiUrl}/${resource}/${id}`, {
                    method: 'DELETE',
                })
            )
        ).then(responses => ({ data: responses.map(({ json }) => json.id) })),
});
