import React, { useState, useEffect } from 'react';

// redux
import { useSelector, useDispatch } from 'react-redux';
import userAction from '@/redux/action/user';

// 请求
import proxyFetch from '@/util/request';
import {
  QUARY_ACCOUNT,
  RESET_PASSWORD,
  ACCOUNT_CANCEL,
} from '@/constants/api-constants';

import ExportJsonExcel from 'js-export-excel';

import AccountFormController from '@/components/home/admin/Account-form-controller.jsx';
import ModifyAccountContent from '@/components/home/admin/Modify-account-content-controller.jsx';

// 样式
import '@/style/home/admin/account-list.styl';
import { Button, Table, Modal, Skeleton, Select, Input } from 'antd';
const { Column } = Table,
  { confirm } = Modal,
  { Option } = Select,
  { Search } = Input;

export default (porps) => {
  const [accountLoading, setAccountLoading] = useState(false),
    [role, setRole] = useState(0),
    [name, setName] = useState(''),
    [accountVisible, setAccountVisible] = useState(false),
    [isNeedRefresh, setIsNeedRefresh] = useState(true),
    [accountList, setAccountList] = useState([]),
    [modifyAccountVisible, setModifyAccountVisible] = useState(false),
    { addAccount } = useSelector((state) => state.userStore),
    dispatch = useDispatch();

  const showAccountModal = () => {
    setAccountVisible(true);
  };

  const hideAccountModal = () => {
    setAccountVisible(false);
  };

  const showModifyAccountModal = () => {
    setModifyAccountVisible(true);
  };

  const hideModifyAccountModal = () => {
    setModifyAccountVisible(false);
  };

  useEffect(() => {
    let _isMounted = true;

    (async () => {
      if (isNeedRefresh || addAccount) {
        setAccountLoading(true);

        const accountList = await proxyFetch(
          QUARY_ACCOUNT,
          { role, name },
          'GET'
        );

        if (_isMounted) {
          setAccountList(accountList);
          dispatch(userAction.setAddAccount(false));
          setAccountLoading(false);
          setIsNeedRefresh(false);
        }
      }
    })();
  }, [isNeedRefresh, role, name, addAccount, dispatch]);

  const handleReset = async (uuid) => {
    await proxyFetch(RESET_PASSWORD, { uuid });
  };

  const handleCancellation = async (uuid) => {
    const res = await proxyFetch(ACCOUNT_CANCEL, { uuid });
    if (res) {
      setIsNeedRefresh(true);
    }
  };

  const roleToText = (role) => {
    switch (role) {
      case 1:
        return '超级管理员';
      case 5:
        return '评审员';
      case 10:
        return '统计员';
      case 15:
        return '普通员工';
      default:
        return '未知';
    }
  };

  const downloadExcel = async () => {
    const accountList = await proxyFetch(QUARY_ACCOUNT, { role, name }, 'GET');
    const datas = accountList ? accountList : ''; //表格数据
    var option = {};
    let dataTable = []; //新建数组放数据
    console.log(datas);
    if (datas) {
      for (const data of datas) {
        console.log(data);
        if (data) {
          let obj = {
            name: data.name,
            userName: data.userName,
            role: roleToText(data.role),
            isCancel: data.isCancel,
            phone: data.phone,
            department: data.department,
          };
          dataTable.push(obj);
        }
      }
    }
    console.log(dataTable);
    option.fileName = '用户信息'; //文件名
    option.datas = [
      {
        sheetData: dataTable, //数据
        sheetName: '用户信息', //sheet名字
        sheetHeader: ['姓名', '用户名', '权限', '注销状态', '电话', '部门'], //// 第一行
      },
    ];

    var toExcel = new ExportJsonExcel(option);
    toExcel.saveExcel(); //保存
  };

  return (
    <div className='account-list-box'>
      <p className='title-box'>
        <span>账号管理</span>
      </p>
      <div className='account-list-content-box'>
        <div className='list-title-box'>
          <Select
            className='select'
            defaultValue={0}
            onChange={(e) => {
              setRole(e);
              setName('');
              setIsNeedRefresh(true);
            }}
          >
            <Option value={0}>全部用户</Option>
            <Option value={1}>超级管理员</Option>
            <Option value={5}>评审管理员</Option>
            <Option value={10}>统计管理员</Option>
            <Option value={15}>普通员工</Option>
          </Select>
          <Search
            className='search'
            placeholder='请输入姓名\账号'
            enterButton
            onSearch={(e) => {
              setName(e);
              setIsNeedRefresh(true);
            }}
          />
          <Button
            type='primary'
            style={{ marginBottom: 16 }}
            onClick={showAccountModal}
          >
            新增账号
          </Button>
          <Button
            className='export-button'
            type='primary'
            onClick={() => {
              confirm({
                title: '导出当前所有账号信息',
                okType: 'primary',
                content: '确认要导出当前所有账号信息?',
                okText: '确认',
                cancelText: '取消',
                onOk() {
                  downloadExcel();
                },
                onCancel() {},
              });
            }}
          >
            导出所有账号信息
          </Button>
          <Modal
            title='修改账号信息'
            visible={modifyAccountVisible}
            onOk={hideModifyAccountModal}
            onCancel={hideModifyAccountModal}
            okText='确认'
            cancelText='取消'
          >
            <ModifyAccountContent />
          </Modal>
          <Modal
            title='新增账号'
            visible={accountVisible}
            onOk={hideAccountModal}
            onCancel={hideAccountModal}
            okText='确认'
            cancelText='取消'
          >
            <AccountFormController />
          </Modal>
        </div>
        <Skeleton loading={accountLoading}>
          <Table
            dataSource={accountList}
            className='table'
            rowKey={(record) => record.uuid}
            scroll={{ x: 1200 }}
          >
            <Column
              align='center'
              title='姓名'
              dataIndex='name'
              key=''
              fixed='left'
            />
            <Column align='center' title='账号' dataIndex='userName' key='' />
            <Column align='center' title='电话号码' dataIndex='phone' key='' />
            <Column
              align='center'
              title='权限'
              dataIndex='role'
              key=''
              render={(text, record) => {
                if (record.role === 15) return '普通员工';
                else if (record.role === 10) return '统计管理员';
                else if (record.role === 5) return '评审管理员';
                else if (record.role === 1) return '超级管理员';
              }}
            />
            <Column align='center' title='科室' dataIndex='department' key='' />
            <Column
              align='center'
              title='注销状态'
              dataIndex='isCancel'
              key=''
            />
            <Column
              align='center'
              title='重置密码'
              fixed='right'
              width='100px'
              dataIndex=''
              key=''
              render={(text, record) => (
                <Button
                  type='link'
                  onClick={() => {
                    confirm({
                      title: '重置密码?',
                      okType: 'primary',
                      content: '确认要重置密码?',
                      okText: '确认',
                      cancelText: '取消',
                      onOk() {
                        handleReset(record.uuid);
                      },
                      onCancel() {},
                    });
                  }}
                >
                  重置密码
                </Button>
              )}
            />
            <Column
              align='center'
              title='注销'
              fixed='right'
              width='100px'
              dataIndex=''
              key=''
              render={(text, record) => (
                <Button
                  type='link'
                  onClick={() => {
                    confirm({
                      title: '注销账号?',
                      okType: 'primary',
                      content: '确认要注销账号(注销后账号将无法登录)?',
                      okText: '确认',
                      cancelText: '取消',
                      onOk() {
                        handleCancellation(record.uuid);
                      },
                      onCancel() {},
                    });
                  }}
                >
                  注销
                </Button>
              )}
            />
            <Column
              align='center'
              title='修改'
              dataIndex=''
              fixed='right'
              width='100px'
              key=''
              render={(text, record) => (
                <Button
                  type='link'
                  onClick={() => {
                    dispatch(userAction.setUserUuid(record.uuid));
                    showModifyAccountModal();
                  }}
                >
                  修改账号信息
                </Button>
              )}
            />
          </Table>
        </Skeleton>
      </div>
    </div>
  );
};
