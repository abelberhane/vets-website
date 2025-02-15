import React from 'react';
import SkinDeep from 'skin-deep';
import { expect } from 'chai';
import sinon from 'sinon';
import ReactTestUtils from 'react-dom/test-utils';
import { Provider } from 'react-redux';

import { uploadStore } from 'platform/forms-system/test/config/helpers';
import { DocumentRequestPage } from '../../containers/DocumentRequestPage';

const params = { id: 1 };

describe('<DocumentRequestPage>', () => {
  it('should render loading div', () => {
    const tree = SkinDeep.shallowRender(
      <DocumentRequestPage params={params} loading />,
    );
    expect(tree.everySubTree('va-loading-indicator')).not.to.be.empty;
    expect(tree.everySubTree('.claim-container')).to.be.empty;
  });
  it('should render upload error alert', () => {
    const trackedItem = {
      type: 'still_need_from_you_list',
    };
    const claim = {
      id: 1,
      attributes: {},
    };
    const message = {
      title: 'Test',
      body: 'Testing',
    };
    const tree = SkinDeep.shallowRender(
      <DocumentRequestPage
        params={params}
        trackedItem={trackedItem}
        claim={claim}
        message={message}
      />,
    );
    expect(tree.subTree('Notification')).not.to.be.false;
  });
  it('should clear upload error when leaving', () => {
    const claim = {
      id: 1,
      attributes: {},
    };
    const trackedItem = {
      type: 'still_need_from_you_list',
    };
    const message = {
      title: 'test',
      body: 'test',
      type: 'error',
    };
    const clearNotification = sinon.spy();

    const tree = SkinDeep.shallowRender(
      <DocumentRequestPage
        params={params}
        trackedItem={trackedItem}
        claim={claim}
        clearNotification={clearNotification}
        message={message}
      />,
    );
    expect(tree.subTree('Notification')).not.to.be.false;
    tree.getMountedInstance().componentWillUnmount();
    expect(clearNotification.called).to.be.true;
  });
  it('should not clear notification after completed upload', () => {
    const claim = {
      id: 1,
      attributes: {},
    };
    const trackedItem = {
      type: 'still_need_from_you_list',
    };
    const message = {
      title: 'test',
      body: 'test',
      type: 'error',
    };
    const clearNotification = sinon.spy();

    const tree = SkinDeep.shallowRender(
      <DocumentRequestPage
        params={params}
        trackedItem={trackedItem}
        claim={claim}
        uploadComplete
        clearNotification={clearNotification}
        message={message}
      />,
    );
    expect(tree.subTree('Notification')).not.to.be.false;
    tree.getMountedInstance().componentWillUnmount();
    expect(clearNotification.called).to.be.false;
  });
  it('should render due date info', () => {
    const trackedItem = {
      type: 'still_need_from_you_list',
      suspenseDate: '2010-05-10',
    };
    const claim = {
      id: 1,
      attributes: {},
    };
    const tree = SkinDeep.shallowRender(
      <DocumentRequestPage
        params={params}
        claim={claim}
        trackedItem={trackedItem}
      />,
    );
    expect(tree.subTree('DueDate')).not.to.be.false;
    expect(tree.subTree('DueDate').props.date).to.eql(trackedItem.suspenseDate);
  });
  it('should render optional upload alert', () => {
    const trackedItem = {
      type: 'still_need_from_others_list',
      suspenseDate: '2010-05-10',
    };
    const claim = {
      id: 1,
      attributes: {},
    };
    const tree = SkinDeep.shallowRender(
      <DocumentRequestPage
        params={params}
        claim={claim}
        trackedItem={trackedItem}
      />,
    );
    expect(tree.subTree('.optional-upload')).not.to.be.false;
  });
  it('should handle submit files', () => {
    const trackedItem = {
      type: 'still_need_from_you_list',
      suspenseDate: '2010-05-10',
    };
    const claim = {
      id: 1,
      attributes: {},
    };
    const onSubmit = sinon.spy();
    const tree = SkinDeep.shallowRender(
      <DocumentRequestPage
        params={params}
        claim={claim}
        trackedItem={trackedItem}
        submitFiles={onSubmit}
      />,
    );
    tree.subTree('Connect(AddFilesForm)').props.onSubmit();
    expect(onSubmit.called).to.be.true;
  });
  it('should reset uploads and set title on mount', () => {
    const trackedItem = {
      type: 'still_need_from_you_list',
      displayName: 'Testing',
    };
    const claim = {
      id: 1,
      attributes: {},
    };
    const resetUploads = sinon.spy();
    const mainDiv = document.createElement('div');
    mainDiv.classList.add('va-nav-breadcrumbs');
    document.body.appendChild(mainDiv);
    ReactTestUtils.renderIntoDocument(
      <Provider store={uploadStore}>
        <DocumentRequestPage
          params={params}
          claim={claim}
          files={[]}
          uploadField={{ value: null, dirty: false }}
          trackedItem={trackedItem}
          resetUploads={resetUploads}
        />
      </Provider>,
    );

    expect(document.title).to.equal('Request for Testing');
    expect(resetUploads.called).to.be.true;
  });
  it('should set details and go to files page if complete', () => {
    const trackedItem = {
      type: 'still_need_from_you_list',
      displayName: 'Testing',
    };
    const claim = {
      id: 1,
      attributes: {},
    };
    const router = {
      push: sinon.spy(),
      replace: sinon.spy(),
    };
    const parameters = {
      id: 339,
    };
    const getClaimDetail = sinon.spy();
    const resetUploads = sinon.spy();

    const tree = SkinDeep.shallowRender(
      <DocumentRequestPage
        claim={claim}
        files={[]}
        uploadComplete
        uploadField={{ value: null, dirty: false }}
        trackedItem={trackedItem}
        router={router}
        params={parameters}
        getClaimDetail={getClaimDetail}
        resetUploads={resetUploads}
      />,
    );

    tree
      .getMountedInstance()
      .UNSAFE_componentWillReceiveProps({ uploadComplete: true });
    expect(getClaimDetail.calledWith(1)).to.be.true;
    expect(router.push.calledWith('your-claims/1/files')).to.be.true;
  });
});
