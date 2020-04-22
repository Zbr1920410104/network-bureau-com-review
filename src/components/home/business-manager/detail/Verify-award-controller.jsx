import React, { useState, useEffect } from 'react';

// 请求
import proxyFetch from '@/util/request';
import { GET_VERIFY_AWARD_LIST, GET_FILE_URL } from '@/constants/api-constants';

// redux
import { useSelector, useDispatch } from 'react-redux';
import userAction from '@/redux/action/user';

import moment from 'moment';

// 样式
import '@/style/home/business-manager/verify-item-detail.styl';
import { Icon, Button, Modal, Input, Descriptions, Skeleton } from 'antd';
const { TextArea } = Input,
  { confirm } = Modal;

export default (props) => {
  const { staffUuid } = useSelector((state) => state.userStore),
    [verifyVisible, setVerifyVisible] = useState(false),
    [verifyAwardList, setVerifyAwardList] = useState([]),
    [verifyAwardUrl, setVerifyAwardUrl] = useState(''),
    [previewUrl, setPreviewUrl] = useState(''),
    [getFileLoading, setGetFileLoading] = useState(true),
    [verifyAwardLoading, setVerifyAwardLoading] = useState(false),
    [uploadAwardVisible, setUploadAwardVisible] = useState(false),
    dispatch = useDispatch();

  const showVerifyModal = () => {
    setVerifyVisible(true);
  };

  const hideVerifyModal = () => {
    setVerifyVisible(false);
  };

  const showUploadAwardModal = (url) => {
    setVerifyAwardUrl(url);
    setUploadAwardVisible(true);
  };

  const hideUploadAwardModal = () => {
    setUploadAwardVisible(false);
  };

  useEffect(() => {
    (async () => {
      setVerifyAwardLoading(true);

      const verifyAwardList = await proxyFetch(
        GET_VERIFY_AWARD_LIST,
        { staffUuid },
        'GET'
      );

      if (verifyAwardList) {
        setVerifyAwardList(verifyAwardList);
        setVerifyVisible(false);
        setUploadAwardVisible(false);
        dispatch(userAction.setVerifyAward(false));
      }

      setVerifyAwardLoading(false);
    })();
  }, [staffUuid, dispatch]);

  useEffect(() => {
    if (verifyAwardUrl) {
      (async () => {
        setGetFileLoading(true);
        const previewUrl = await proxyFetch(
          GET_FILE_URL,
          { fileUrl: verifyAwardUrl },
          'GET'
        );

        setPreviewUrl(previewUrl);
        setGetFileLoading(false);
      })();
    }
  }, [verifyAwardUrl]);

  return (
    <div className='verify-item-detail-box'>
      <div className='detail-title-box'>
        <div className='title-left-box'>
          <Icon type='trophy' className='icon' />
          <span>获奖情况</span>
        </div>
        <Modal
          title='请核实'
          visible={verifyVisible}
          onOk={hideVerifyModal}
          onCancel={hideVerifyModal}
          okText='确定'
          cancelText='取消'
        >
          <div className='button-box'>
            <Button
              type='primary'
              className='fail-button'
              onClick={hideVerifyModal}
            >
              核实未通过
            </Button>
            <Button
              type='primary'
              className='success-button'
              onClick={() => {
                confirm({
                  title: '确认核实通过?',
                  okType: 'primary',
                  content: (
                    <div className='text-box'>
                      <span>我已核实完</span>
                      <span className='important-text'>获奖情况</span>
                      <span>的所有信息,确认通过?</span>
                    </div>
                  ),
                  okText: '确认',
                  cancelText: '取消',
                  onOk() {},
                  onCancel() {},
                });
              }}
            >
              核实通过
            </Button>
          </div>
          <TextArea
            rows={3}
            maxLength='100'
            placeholder='请输入核实意见及不通过理由'
            className='modal-textArea-box'
          />
        </Modal>
      </div>
      <Modal
        title='下载附件'
        visible={uploadAwardVisible}
        onCancel={hideUploadAwardModal}
        footer={null}
      >
        <div className='download-button-box'>
          {verifyAwardUrl ? (
            <a href={previewUrl}>
              <Button
                type='primary'
                size='large'
                className='download-button'
                icon='download'
                loading={getFileLoading}
              >
                下载附件
              </Button>
            </a>
          ) : (
            <Button disabled>员工未上传</Button>
          )}
        </div>
      </Modal>
      <div className='verify-description-box'>
        <Skeleton loading={verifyAwardLoading}>
          {verifyAwardList?.length ? (
            verifyAwardList.map((item, index) => (
              <Descriptions
                key={item.uuid}
                title={
                  <div className='verify-description-title'>
                    <div className='description-title-text'>
                      <span>{`奖项${index + 1}:  ${item.awardName}`}</span>
                      <span>{`状态: ${item.isVerify}`}</span>
                      <span>{`最近填写/修改于: ${
                        item.currentWriteTime
                          ? moment(item.currentWriteTime).format(
                              'YYYY-MM-DD h:mm:ss a'
                            )
                          : ''
                      }`}</span>
                    </div>
                    <div className='description-title-button'>
                      <Button
                        type='link'
                        icon='edit'
                        className='opinion-button'
                        onClick={showVerifyModal}
                      >
                        核实
                      </Button>
                    </div>
                  </div>
                }
              >
                <Descriptions.Item label='奖项类型'>
                  {item.awardType}
                </Descriptions.Item>
                <Descriptions.Item label='获奖时间'>
                  {item.awardTime
                    ? moment(item.awardTime).format('YYYY-MM-DD')
                    : ''}
                </Descriptions.Item>
                <Descriptions.Item label='奖项级别'>
                  {item.awardGrade}
                </Descriptions.Item>
                <Descriptions.Item label='颁奖部门'>
                  {item.awardDepartment}
                </Descriptions.Item>
                {item.awardNameList ? (
                  <Descriptions.Item label='获奖名单' span={2}>
                    {item.awardNameList}
                  </Descriptions.Item>
                ) : null}
                <Descriptions.Item label='查看附件'>
                  <Button
                    type='link'
                    onClick={() => {
                      showUploadAwardModal(item.url);
                    }}
                    className='link-button'
                  >
                    <Icon type='download' />
                    <span>查看</span>
                  </Button>
                </Descriptions.Item>
              </Descriptions>
            ))
          ) : (
            <span>未填写奖项</span>
          )}
        </Skeleton>
      </div>
    </div>
  );
};
