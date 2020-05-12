import * as React from 'react';
import { Admin, Resource } from 'react-admin';
import polyglotI18nProvider from 'ra-i18n-polyglot';

import './App.css';

import authProvider from './authProvider';
import themeReducer from './themeReducer';
import { Login, Layout } from './layout';
import { Dashboard } from './dashboard';
import customRoutes from './routes';
import englishMessages from './i18n/en';

import visitors from './visitors';
import orders from './orders';
import products from './products';
import invoices from './invoices';
import categories from './categories';
import reviews from './reviews';
import TicketList from './tickets/TicketList';

import dataProviderFactory from './dataProvider';
import fakeServerFactory from './fakeServer';
//import jsonServerProvider from 'ra-data-json-server';
import jsonServerProvider from './dataprovider';

const i18nProvider = polyglotI18nProvider(locale => {
    if (locale === 'fr') {
        return import('./i18n/fr').then(messages => messages.default);
    }

    // Always fallback on english
    return englishMessages;
}, 'en');

const App = () => {
    // const [dataProvider, setDataProvider] = useState(null);
    //
    // useEffect(() => {
    //     let restoreFetch;
    //
    //     const fetchDataProvider = async () => {
    //         restoreFetch = await fakeServerFactory(
    //             process.env.REACT_APP_DATA_PROVIDER
    //         );
    //         const dataProviderInstance = await dataProviderFactory(
    //             process.env.REACT_APP_DATA_PROVIDER
    //         );
    //         setDataProvider(
    //             // GOTCHA: dataProviderInstance can be a function
    //             () => dataProviderInstance
    //         );
    //     };
    //
    //     fetchDataProvider();
    //
    //     return restoreFetch;
    // }, []);
    //
    // if (!dataProvider) {
    //     return (
    //         <div className="loader-container">
    //             <div className="loader">Loading...</div>
    //         </div>
    //     );
    // }

    return (
        <Admin
            title="Автоматизированная информационная система поддержки пользователей"
            dataProvider={jsonServerProvider('http://10.255.250.96:8000/otrs')}
            customReducers={{ theme: themeReducer }}
            customRoutes={customRoutes}
            authProvider={authProvider}
            //dashboard={Dashboard}
            layout={Layout}
            i18nProvider={i18nProvider}
        >
            <Resource
                name="Ticket"
                list={TicketList}
                options={{ label: 'Заявки' }}
            />
            <Resource
                name="commands"
                {...orders}
                options={{ label: 'Orders' }}
            />
            <Resource name="invoices" {...invoices} />
            <Resource name="products" {...products} />
            <Resource name="categories" {...categories} />
            <Resource name="reviews" {...reviews} />
        </Admin>
    );
};

export default App;
