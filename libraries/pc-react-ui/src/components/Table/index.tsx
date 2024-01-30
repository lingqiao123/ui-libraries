import { ProTable as AntdTable } from '@ant-design/pro-components';
import { Table as selfTable } from 'antd';
import type { ProTableProps } from '@ant-design/pro-components';
import { registerComponet } from '@/plugins/index';
import * as plugin from './plugins';
import type { pluginType } from '@/plugins/type';

import './index.module.less';

// type TransferProps = AntdTransferProps

const mapProps = {
  mySize: 'size',
};

const Table = registerComponet<
  ProTableProps,
  pluginType<ProTableProps>
>(
  AntdTable,
  { plugin, displayName: 'descriptions', mapProps },
);

export default Table;

export const TableColumn = selfTable.Column;
// export const DescriptionsItem = AntdTable.Item;
