import React from 'react';
import fp from 'lodash/fp';
import _ from 'lodash';
import { useAntdTable } from 'ahooks';

function useHandle(props) {
  const children = props.get('children');
  const columns = props.get('columns');
  const result = React.useMemo(() => {
    const columnsChildren = fp.filter((item: Record<string, any>) => item.type?.name === 'Column');
    const omitColumnsProps = fp.map((item: Record<string, any>) => item.props);
    const childrenFlow = fp.flow(columnsChildren, omitColumnsProps);

    const columnsCond = fp.cond([
      [fp.conforms({ columns: fp.isArray, children: fp.stubTrue }), fp.constant({ columns })],
      [fp.conforms({ children: fp.isArray }), fp.constant({ columns: childrenFlow(children) })],
      [fp.stubTrue, fp.stubObject],
    ]);
    return columnsCond({ columns, children });
  }, [children, columns]);
  // return {};
  return result;
  // const columnsChildren = fp.filter((item: Record<string, any>) => item.type?.name === 'Column3');
  // const omitColumnsProps = fp.map((item: Record<string, any>) => item.props);
  // const childrenFlow = fp.flow(columnsChildren, omitColumnsProps);
  // const columnsCond = fp.cond([
  //   [fp.conforms({ columns: fp.isArray, children: fp.stubTrue }), fp.constant({ columns })],
  //   [fp.conforms({ children: fp.isArray }), fp.constant({ columns: childrenFlow(children) })],
  //   [fp.stubTrue, fp.stubObject],
  // ]);
  // return columnsCond({ columns, children });
}

export function useHandleTransformOption(props) {
  const dataSource = props.get('dataSource');
  const onBefore = props.get('onBefore', () => { });
  const onSuccess = props.get('onSuccess', () => { });
  const warpList = _.cond([
    [Array.isArray, (list) => ({ list, total: list.length })],
    [_.conforms({ list: _.isArray }), _.identity],
    [fp.stubTrue, fp.constant({ list: [], total: 0 })],
  ]) as (Target: {
    list: unknown;
  }) => {
    list: any;
    total: number;
  };
  const transformOption = React.useMemo(
    () => fp.cond([
      [fp.isArray, fp.constant(() => Promise.resolve({ list: dataSource, total: dataSource.length }))],
      [fp.isFunction, fp.constant(() => Promise.resolve(dataSource()).then(warpList))],
      [fp.stubTrue, fp.constant(() => Promise.resolve({ list: [], total: 0 }))],
    ]),
    [dataSource],
  );

  const { tableProps } = useAntdTable(transformOption(dataSource), {
    onBefore: (params) => _.attempt(onBefore, params),
    onSuccess: (data, params) => _.attempt(onSuccess, data, params),

  });

  return fp.isNil(dataSource) ? {} : tableProps;
}

export function useHandlePagination(props) {
  const pagination = props.get('pagination');
  const pageSize = props.get('pageSize');
  const showSizeChanger = props.get('showSizeChanger');
  const pageSizeOptions = props.get('pageSizeOptions');
  const onChange = props.get('onPageonChange');
  const current = props.get('current');
  const showTotal = props.get('showTotal');
  const showTotalText = fp.cond([
    [fp.isEqual(true), fp.constant((total) => `共 ${total} 条`)],
    [fp.stubTrue, fp.constant(() => '')],
  ])(showTotal);
  const showQuickJumper = props.get('showQuickJumper');
  const paginationConfig = {
    ...(fp.isPlainObject(pagination) ? pagination : {}),
    ...(_.filterUnderfinedValue({
      pageSize,
      showSizeChanger,
      pageSizeOptions,
      current,
      showTotal: showTotalText,
      showQuickJumper,
      onChange,
    })),
  };
  const paginationProps = fp.cond([
    [fp.matches({ pagination: false }), fp.constant({ pagination: false })],
    [fp.matches({ pagination: true }), fp.constant({ pagination: paginationConfig })],
    [fp.stubTrue, fp.stubObject],
  ])({
    pagination,
  });
  return paginationProps;
}

export function useHandleRowSelection(props) {
  const valueProps = props.get('value');
  const onChange = props.get('onChange');
  const result = fp.cond([
    [fp.isEqual({}), fp.constant({})],
    [fp.stubTrue, fp.constant({ rowSelection: { selectedRowKeys: fp.concat([], valueProps), onChange } })],
  ])(_.filterUnderfinedValue({ value: valueProps, onChange }));
  return result;
}

export function useHandleSticky(props) {
  const sticky = props.get('sticky');
  const stickyOffsetTop = props.get('stickyOffsetTop');
  const result = fp.cond([
    [fp.conforms({ sticky: fp.isEqual(true), stickyOffsetTop: fp.isInteger }), fp.constant({ sticky: { offsetHeader: stickyOffsetTop } })],
    [fp.conforms({ sticky: fp.isEqual(true), stickyOffsetTop: fp.stubTrue }), fp.constant({ sticky: true })],
    [fp.stubTrue, fp.constant({})],
  ])({ sticky, stickyOffsetTop });
  return result;
}
export function useHandleLoading(props) {
  const loading = props.get('loading');
  const loadingText = props.get('loadingText');
  const result = fp.cond([
    [fp.conforms({ loading: fp.isEqual(true), loadingText: fp.isString }), fp.constant({ loading: { tip: loadingText } })],
    [fp.stubTrue, fp.constant({})],
  ])({ loading, loadingText });
  return result;
}

export function useHandleEmptyText(props) {
  const emptyText = props.get('emptyText');
  const result = fp.cond([
    [fp.conforms({ emptyText: fp.isString }), fp.constant({ locale: { emptyText } })],
    [fp.stubTrue, fp.constant({})],
  ])({ emptyText });
  return result;
}

export function useHandleOnRow(props) {
  const onRowClick = props.get('onRowClick', () => { });
  const onRowDbClick = props.get('onRowDbClick', () => { });
  return {
    onRow: (record, index) => ({
      onClick: () => _.attempt(onRowClick, record, index),
      onDoubleClick: () => _.attempt(onRowDbClick, record, index),
    }),
  };
}

export function useHandleSorter(props) {
  const columnsProps = props.get('columns');
  const columns = React.useMemo(() => _.map(columnsProps, (item) => {
    const isSorter = fp.conforms({ sorter: fp.isEqual(true) });
    const handleAscend = (a, b) => a[item.dataIndex] > b[item.dataIndex];
    const handleDescend = (a, b) => a[item.dataIndex] < b[item.dataIndex];
    const handleSorter = fp.cond([
      [fp.matches({ defaultSortOrder: 'ascend' }), fp.constant({ ...item, sorter: handleAscend })],
      [fp.matches({ defaultSortOrder: 'descend' }), fp.constant({ ...item, sorter: handleDescend })],
      [fp.stubTrue, fp.constant(fp.constant({ ...item, sorter: handleAscend }))],
    ]);
    return fp.cond([[isSorter, handleSorter], [fp.stubTrue, fp.identity]])(item);
  }), [columnsProps]);
  const result = fp.cond([
    [fp.isNil, fp.stubObject],
    [fp.stubTrue, fp.constant({ columns })],
  ])(columnsProps);
  return result;
}