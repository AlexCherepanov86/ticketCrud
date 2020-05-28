import React, {Fragment, useCallback} from 'react';
import {
    Datagrid,
    DateField,
    DateInput,
    NumberInput,
    Filter,
    List,
    Pagination,
    NumberField,
    SearchInput,
    TextField,
    TextInput,
    AutocompleteArrayInput,
    ChipField,
} from 'react-admin';
import {
    makeStyles,
    useMediaQuery,
    Divider,
    Tabs,
    Tab,
} from '@material-ui/core';
import { useQueryWithStore, Loading, Error } from 'react-admin';

const DateMultiInput = () => (
    <div>
        <DateInput name="startDate" placeholder="Начало" helperText=" " options={{ format: 'DD/MM/YYYY' }}/>
        &nbsp;
        <DateInput name="endDate" placeholder="Конец" helperText=" " options={{ format: 'DD/MM/YYYY' }}/>
    </div>
);

const TimeMultiInput = () => (
    <div>
        <NumberInput name="startUsedPercent" placeholder="Начало" label="%" max="100" min="0" helperText=" "/>
        &nbsp;
        <NumberInput name="endUsedPercent" placeholder="Конец" label="%" max="100" min="0" helperText=" "/>
    </div>
);

const ListFilters = props => {

    const { data, loading, error } = useQueryWithStore({
        type: 'getOneFilter',
        resource: 'Config',
    });

    if (loading) return <Loading />;
    if (error) return <Error />;
    if (!data) return null;

    return(
        <Filter {...props}>
            <SearchInput label="Номер" source="TicketNumber" helperText=" " placeholder=" " alwaysOn/>
            <DateMultiInput source="Created" label="Создана"/>
            <AutocompleteArrayInput label="Тип" source="Type" choices={data.Type.map(item => ({
            id: item, name: item
        }))}/>
            <TextInput source="Theme" label="Тема"/>
        <AutocompleteArrayInput label="Место" source="METROLocation" choices={data.METROLocation.map(item => ({
            id: item, name: item
        }))} />
            <AutocompleteArrayInput label="Состояние" source="State" choices={data.State.map(item => ({
                id: item, name: item
            }))}/>
            <AutocompleteArrayInput label="Приоритет" source="Priority" choices={data.Priority.map(item => ({
                id: item, name: item
            }))}/>
            <TimeMultiInput label="Расход времени" source="UsedTimePercent" />
            <AutocompleteArrayInput label="Соисполнитель" source="Queue" choices={data.Queue.map(item => ({
                id: item, name: item
            }))}/>
            <AutocompleteArrayInput label="Вид техники" source="METROEquipmentType" choices={data.METROEquipmentType.map(item => ({
                id: item, name: item
            }))}/>
            <AutocompleteArrayInput label="Вид ТО" source="METROTOType" choices={data.METROTOType.map(item => ({
                id: item, name: item
            }))}/>
            <AutocompleteArrayInput label="Способ работ" source="METROJobType" choices={data.METROJobType.map(item => ({
                id: item, name: item
            }))}/>
            <AutocompleteArrayInput label="Заявитель" source="Customer" choices={data.Customer.map(item => ({
                                        id: item, name: item
            }))}/>
        </Filter>
    );
}

const useDatagridStyles = makeStyles({
    total: { fontWeight: 'bold' },
    rowEven: { background_color: '#666'},

});

const tabs = [
    { id: '6', state: '6', name: 'Все', count: '0' },
    { id: '1', state: '1', name: 'Открытые', count: '0' },
    { id: '2', state: '2', name: 'Закрытые', count: '0' },
    { id: '3', state: '3', name: 'Ожидание ответа', count: '0' },
    { id: '4', state: '4', name: 'Ожидание технадзора', count: '0' },
    { id: '5', state: '5', name: 'Выполнена', count: '0' },
];

let tabsLoaded = false;

const TabWrapper = (props) => {
    const { data, loading, error } = useQueryWithStore({
        type: 'getCounter',
        resource: 'Ticket',
    });

    if (!tabsLoaded) {
        if (loading) {
            return <Loading />;
        }

        if (error) {
            return <Error />;
        }

        if (!data) {
            return null;
        }

        tabsLoaded = true;
        tabs.forEach((tab, i) => tab.count = data[i]);
    }

    return (
        <div>
            { props.children({ tabs }) }
        </div>
    );
};

class TabbedDatagrid extends React.Component {



    state = { created: [], success: []};

    static getDerivedStateFromProps(props, state) {
        const key = tabs.find(obj => obj.state.includes(props.filterValues.Tab));
        if (!!key && props.ids !== state[key.id]) {
            return { ...state, [key.id]: props.ids };
        }
        return null;
    }


    handleChange = (event, value) => {
        const { filterValues, setFilters } = this.props;
        const key = tabs.find(obj => obj.id === value);
        setFilters({ ...filterValues, Tab: key.state });
    };

    render() {

        const { classes, filterValues, ...props } = this.props;
        const key = tabs.find(obj => obj.state.includes(filterValues.Tab));

        return (
            <Fragment>
                <TabWrapper>
                    {
                        ({ tabs }) => (
                            <div>
                            <Tabs
                                variant="standard"
                                value={key.id}
                                indicatorColor="secondary"
                                onChange={this.handleChange}
                            >
                                {tabs.map(choice => (
                                    <Tab
                                        key={choice.id}
                                        label={choice.name + " " + "(" + choice.count + ")"}
                                        value={choice.id}
                                    />
                                ))}
                            </Tabs>
                            <Divider />
                            <div>

                            <Datagrid
                                {...props}
                                ids={this.state[key.id]}
                                optimized
                                rowClick="edit"
                                >
                                {/*style={{ record={"М1-Отклонена"} ? color: '#661d0b' : color: '#000'}}*/}

                                <NumberField source="TicketNumber" label="Номер" textAlign="center" cellClassName="number" headerClassName="numberfield" />
                                <DateField source="Created" label="Создана" />
                                <TextField source="Type" label="Тип" />
                                <TextField source="Theme" label="Тема" />
                                <ChipField source="METROLocation" label="Местоположение" />
                                
                                <TextField source="State" label="Состояние"  />
                                <TextField source="Priority" label="Приоритет" />
                                <NumberField source="UsedTimePercent" label="Расх. врем."/>
                                <TextField source="Queue" label="Соисполнитель" />
                                <TextField source="METROEquipmentType" label="Вид техники" />
                                <TextField source="METROTOType" label="Вид ТО" />
                                <TextField source="RunTime" label="Время вып." showTime/>
                                <TextField source="METROJobType" label="Способ работ" />
                                <TextField source="Customer" label="Заявитель" />
                                <TextField source="Act" label="Акт" />
                            </Datagrid>

                                </div>
                            </div>
                        )
                        }
                </TabWrapper>
            </Fragment>
        );
    }
}

const StyledTabbedDatagrid = props => {
    const classes = useDatagridStyles();
    const isXSmall = useMediaQuery(theme => theme.breakpoints.down('xs'));
    return <TabbedDatagrid classes={classes} isXSmall={isXSmall} {...props} />;
};

const ListPagination = props => <Pagination rowsPerPageOptions={[10, 25, 50, 100]} {...props} />;

const TicketList = ({ classes, ...props }) => {

    return (
        <List {...props}
              filterDefaultValues={{ Tab: '6' }}
              perPage={25}
              filters={<ListFilters />}
              pagination={<ListPagination />}
        >
            <StyledTabbedDatagrid />
        </List>
    );
}

export default TicketList;