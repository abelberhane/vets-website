import React from 'react';
import { expect } from 'chai';
import { render, fireEvent } from '@testing-library/react';
import sinon from 'sinon';
import ConfirmablePage from './index';
import { axeCheck } from 'platform/forms-system/test/config/helpers';

describe('pre-check-in experience', () => {
  describe('shared components', () => {
    describe('ConfirmablePage', () => {
      it('passes axeCheck', () => {
        axeCheck(<ConfirmablePage />);
      });
      it('renders the footer if footer is supplied', () => {
        const { getByText } = render(
          <ConfirmablePage Footer={() => <div>foo</div>} />,
        );
        expect(getByText('foo')).to.exist;
      });
      it('renders custom header', () => {
        const { getByText } = render(<ConfirmablePage header="foo" />);

        expect(getByText('foo')).to.exist;
      });
      it('renders custom subtitle', () => {
        const { getByText } = render(<ConfirmablePage subtitle="foo" />);
        expect(getByText('foo')).to.exist;
      });
      it('renders custom loading message when loading', () => {
        const { getByText } = render(
          <ConfirmablePage isLoading LoadingMessage={() => <div>foo</div>} />,
        );
        expect(getByText('foo')).to.exist;
      });
      it('renders buttons when loading is false', () => {
        const { getByTestId } = render(<ConfirmablePage isLoading={false} />);
        expect(getByTestId('yes-button')).to.exist;
        expect(getByTestId('no-button')).to.exist;
      });
      it('renders the data passed in, with label and data', () => {
        const dataFields = [{ key: 'foo', title: 'foo-title' }];
        const data = { foo: 'bar' };

        const { getByText } = render(
          <ConfirmablePage data={data} dataFields={dataFields} />,
        );
        expect(getByText('foo-title')).to.exist;
        expect(getByText('bar')).to.exist;
      });
      it('renders multiple data points the data passed in, with label and data', () => {
        const dataFields = [
          { key: 'foo', title: 'foo-title' },
          { key: 'baz', title: 'baz-title' },
        ];
        const data = { foo: 'bar', baz: 'qux' };

        const { getByText } = render(
          <ConfirmablePage data={data} dataFields={dataFields} />,
        );
        expect(getByText('foo-title')).to.exist;
        expect(getByText('bar')).to.exist;
        expect(getByText('baz-title')).to.exist;
        expect(getByText('qux')).to.exist;
      });
      it('renders not available is data is not found, with label and data', () => {
        const dataFields = [{ key: 'foo', title: 'foo-title' }];
        const data = { notFoo: 'bar' };

        const { getByText } = render(
          <ConfirmablePage data={data} dataFields={dataFields} />,
        );
        expect(getByText('foo-title')).to.exist;
        expect(getByText('Not available')).to.exist;
      });
      it('renders the yes and no buttons with the usa-button-big css class', () => {
        const { getByTestId } = render(<ConfirmablePage />);
        expect(getByTestId('yes-button')).to.have.class('usa-button-big');
        expect(getByTestId('no-button')).to.have.class('usa-button-big');
      });
      it('fires the yes function', () => {
        const yesClick = sinon.spy();
        const screen = render(<ConfirmablePage yesAction={yesClick} />);
        fireEvent.click(screen.getByTestId('yes-button'));
        expect(yesClick.calledOnce).to.be.true;
      });
      it('fires the no function', () => {
        const noClick = sinon.spy();
        const screen = render(<ConfirmablePage noAction={noClick} />);
        fireEvent.click(screen.getByTestId('no-button'));
        expect(noClick.calledOnce).to.be.true;
      });
    });
  });
});
