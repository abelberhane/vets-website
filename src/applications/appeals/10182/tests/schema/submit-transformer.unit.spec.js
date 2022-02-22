import { expect } from 'chai';

import formConfig from '../../config/form';

import { transform } from '../../config/submit-transformer';

import maximalData from '../fixtures/data/maximal-test-C14435.json';
import transformedMaximalData from '../fixtures/data/transformed-maximal-test.json';

import minimalData from '../fixtures/data/minimal-test-C14436.json';
import transformedMinimalData from '../fixtures/data/transformed-minimal-test.json';

describe('transform', () => {
  it('should transform JSON correctly', () => {
    const transformedResult = JSON.parse(transform(formConfig, maximalData));
    // copy over variables that change based on date & location
    transformedResult.data.attributes.timezone = 'America/Los_Angeles';

    expect(transformedResult).to.deep.equal(transformedMaximalData);
  });
  it('should transform JSON correctly', () => {
    const transformedResult = JSON.parse(transform(formConfig, minimalData));
    // copy over variables that change based on date & location
    transformedResult.data.attributes.timezone = 'America/Los_Angeles';

    expect(transformedResult).to.deep.equal(transformedMinimalData);
  });
});
