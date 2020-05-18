import React from 'react';
import { useSelector } from 'react-redux';
import { Layout } from 'react-admin';
import AppBar from './AppBar';
import Menu from './Menu';
import { darkTheme, lightTheme } from './themes';
import { AppState } from '../types';
import  MySidebar from './Sidebar';

const CustomSidebar = (props: any) => <MySidebar {...props} size={200} open={false}/>;

export default (props: any) => {
    const theme = useSelector((state: AppState) =>
        state.theme === 'dark' ? darkTheme : lightTheme
    );
    return (
        <Layout
            {...props}
            appBar={AppBar}
            sidebar={CustomSidebar}
            menu={Menu}
            theme={theme}
        />
    );
};
