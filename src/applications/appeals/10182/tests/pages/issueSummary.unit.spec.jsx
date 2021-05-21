import React from 'react';
import { expect } from 'chai';
import { mount } from 'enzyme';
import sinon from 'sinon';

import { DefinitionTester } from 'platform/testing/unit/schemaform-utils.jsx';

import formConfig from '../../config/form';
import { SELECTED } from '../../constants';

describe('NOD selected issues summary page', () => {
  const {
    schema,
    uiSchema,
  } = formConfig.chapters.conditions.pages.issueSummary;

  it('should render', () => {
    const form = mount(
      <DefinitionTester
        definitions={{}}
        schema={schema}
        uiSchema={uiSchema}
        data={{
          contestableIssues: [{ [SELECTED]: true }],
          additionalIssues: [{ [SELECTED]: true }],
        }}
        formData={{}}
      />,
    );

    expect(form.find('li').length).to.equal(2);
    form.unmount();
  });
  it('should render a link', () => {
    const form = mount(
      <DefinitionTester
        definitions={{}}
        schema={schema}
        uiSchema={uiSchema}
        data={{}}
        formData={{}}
      />,
    );

    const link = form.find('a');

    expect(link.length).to.equal(1);
    expect(link.props().children).to.contain('go back and add');
    form.unmount();
  });

  it('should allow contiunue', () => {
    const onSubmit = sinon.spy();
    const form = mount(
      <DefinitionTester
        definitions={{}}
        schema={schema}
        uiSchema={uiSchema}
        data={{}}
        formData={{}}
        onSubmit={onSubmit}
      />,
    );

    form.find('form').simulate('submit');
    expect(form.find('.usa-input-error-message').length).to.equal(0);
    expect(onSubmit.called).to.be.true;
    form.unmount();
  });
});