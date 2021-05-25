import { expect } from 'chai';
import moment from 'moment';
import { SELECTED, FORMAT_YMD } from '../../constants';

import {
  getEligibleContestableIssues,
  createIssueName,
  getContestableIssues,
  addIncludedIssues,
  addAreaOfDisagreement,
  addUploads,
  removeEmptyEntries,
  getAddress,
  getPhone,
  getRepName,
  getTimeZone,
} from '../../utils/submit';

const issue1 = {
  raw: {
    type: 'contestableIssue',
    attributes: {
      ratingIssueSubjectText: 'tinnitus',
      description: 'both ears',
      approxDecisionDate: '2020-01-01',
      decisionIssueId: 1,
      ratingIssueReferenceId: '2',
      ratingDecisionReferenceId: '3',
      ratingIssuePercentNumber: '10',
    },
  },
  result: {
    type: 'contestableIssue',
    attributes: {
      issue: 'tinnitus - 10% - both ears',
      decisionDate: '2020-01-01',
      decisionIssueId: 1,
      ratingIssueReferenceId: '2',
      ratingDecisionReferenceId: '3',
    },
  },
};

const issue2 = {
  raw: {
    type: 'contestableIssue',
    attributes: {
      ratingIssueSubjectText: 'left knee',
      approxDecisionDate: '2020-01-02',
      decisionIssueId: 4,
      ratingIssueReferenceId: '5',
    },
  },
  result: {
    type: 'contestableIssue',
    attributes: {
      issue: 'left knee - 0%',
      decisionDate: '2020-01-02',
      decisionIssueId: 4,
      ratingIssueReferenceId: '5',
    },
  },
};

describe('getEligibleContestableIssues', () => {
  it('should remove ineligible dates', () => {
    expect(
      getEligibleContestableIssues([issue1.raw, issue2.raw]),
    ).to.deep.equal([]);
  });
  it('should keep eligible dates', () => {
    const issue = {
      type: 'contestableIssue',
      attributes: {
        ...issue1.raw.attributes,
        approxDecisionDate: moment()
          .subtract(2, 'months')
          .format(FORMAT_YMD),
      },
    };
    expect(getEligibleContestableIssues([issue, issue2.raw])).to.deep.equal([
      issue,
    ]);
  });
});

describe('createIssueName', () => {
  const getName = (name, description, percent) =>
    createIssueName({
      attributes: {
        ratingIssueSubjectText: name,
        ratingIssuePercentNumber: percent,
        description,
      },
    });

  it('should combine issue details into the name', () => {
    // contestable issues only
    expect(getName('test', 'foo', '10')).to.eq('test - 10% - foo');
    expect(getName('test', 'xyz', null)).to.eq('test - 0% - xyz');
    expect(getName('test')).to.eq('test - 0%');
  });
});

describe('getContestableIssues', () => {
  it('should return all issues', () => {
    const formData = {
      contestableIssues: [
        { ...issue1.raw, [SELECTED]: true },
        { ...issue2.raw, [SELECTED]: true },
      ],
    };
    expect(getContestableIssues(formData)).to.deep.equal([
      issue1.result,
      issue2.result,
    ]);
  });
  it('should return second issue', () => {
    const formData = {
      contestableIssues: [
        { ...issue1.raw, [SELECTED]: false },
        { ...issue2.raw, [SELECTED]: true },
      ],
    };
    expect(getContestableIssues(formData)).to.deep.equal([issue2.result]);
  });
});

describe('addIncludedIssues', () => {
  it('should add additional items to contestableIssues array', () => {
    const issue = {
      type: 'contestableIssue',
      attributes: { issue: 'test', decisionDate: '2000-01-01' },
    };
    const formData = {
      contestableIssues: [
        { ...issue1.raw, [SELECTED]: false },
        { ...issue2.raw, [SELECTED]: true },
      ],
      'view:hasIssuesToAdd': true,
      additionalIssues: [
        { issue: 'not-added', decisionDate: '2000-01-02', [SELECTED]: false },
        { ...issue.attributes, [SELECTED]: true },
      ],
    };
    expect(addIncludedIssues(formData)).to.deep.equal([issue2.result, issue]);
    expect(
      addIncludedIssues({ ...formData, additionalIssues: [] }),
    ).to.deep.equal([issue2.result]);
  });
  it('should not add additional items to contestableIssues array', () => {
    const issue = {
      type: 'contestableIssue',
      attributes: { issue: 'test', decisionDate: '2000-01-01' },
    };
    const formData = {
      contestableIssues: [
        { ...issue1.raw, [SELECTED]: false },
        { ...issue2.raw, [SELECTED]: true },
      ],
      'view:hasIssuesToAdd': false,
      additionalIssues: [
        { issue: 'not-added', decisionDate: '2000-01-02', [SELECTED]: false },
        { ...issue.attributes, [SELECTED]: true },
      ],
    };
    expect(addIncludedIssues(formData)).to.deep.equal([issue2.result]);
    expect(
      addIncludedIssues({ ...formData, additionalIssues: [] }),
    ).to.deep.equal([issue2.result]);
  });
});

describe('addAreaOfDisagreement', () => {
  it('should process a single choice', () => {
    const formData = {
      areaOfDisagreement: [
        {
          disagreementOptions: {
            serviceConnection: true,
            effectiveDate: false,
          },
        },
        {
          disagreementOptions: {
            effectiveDate: true,
            other: false,
          },
          otherEntry: 'test',
        },
      ],
    };
    const result = addAreaOfDisagreement(
      [issue1.result, issue2.result],
      formData,
    );
    expect(result[0].attributes.disagreementReason).to.equal(
      'service connection',
    );
    expect(result[1].attributes.disagreementReason).to.equal('effective date');
  });
  it('should process multiple choices', () => {
    const formData = {
      areaOfDisagreement: [
        {
          disagreementOptions: {
            serviceConnection: true,
            effectiveDate: true,
            evaluation: true,
          },
          otherEntry: 'test',
        },
      ],
    };
    const result = addAreaOfDisagreement([issue1.result], formData);
    expect(result[0].attributes.disagreementReason).to.equal(
      'service connection,effective date,disability evaluation',
    );
  });
  it('should process other choice', () => {
    const formData = {
      areaOfDisagreement: [
        {
          disagreementOptions: {
            serviceConnection: true,
            effectiveDate: true,
            evaluation: true,
            other: true,
          },
          otherEntry: 'this is an other entry',
        },
      ],
    };
    const result = addAreaOfDisagreement([issue1.result], formData);
    expect(result[0].attributes.disagreementReason).to.equal(
      'service connection,effective date,disability evaluation,this is an other entry',
    );
  });
});

describe('addUploads', () => {
  const getData = (checked, files) => ({
    'view:additionalEvidence': checked,
    evidence: files.map(name => ({ name, confirmationCode: '123' })),
  });
  it('should add uploads', () => {
    expect(addUploads(getData(true, ['test1', 'test2']))).to.deep.equal([
      { name: 'test1', confirmationCode: '123' },
      { name: 'test2', confirmationCode: '123' },
    ]);
  });
  it('should not add uploads', () => {
    expect(addUploads(getData(false, ['test1', 'test2']))).to.deep.equal([]);
  });
});

describe('removeEmptyEntries', () => {
  it('should remove empty string items', () => {
    expect(removeEmptyEntries({ a: '', b: 1, c: 'x', d: '' })).to.deep.equal({
      b: 1,
      c: 'x',
    });
  });
  it('should not remove null or undefined items', () => {
    expect(removeEmptyEntries({ a: null, b: undefined, c: 3 })).to.deep.equal({
      a: null,
      b: undefined,
      c: 3,
    });
  });
});

describe('getAddress', () => {
  it('should return a cleaned up address object', () => {
    const wrap = obj => ({ veteran: { address: obj } });
    expect(getAddress()).to.deep.equal({});
    expect(getAddress(wrap({}))).to.deep.equal({});
    expect(getAddress(wrap({ temp: 'test' }))).to.deep.equal({});
    expect(getAddress(wrap({ addressLine1: 'test' }))).to.deep.equal({
      addressLine1: 'test',
    });
    expect(getAddress(wrap({ zipCode: '10101' }))).to.deep.equal({
      zipCode5: '10101',
    });
    expect(
      getAddress(
        wrap({
          addressLine1: '123 test',
          addressLine2: 'c/o foo',
          addressLine3: 'suite 99',
          city: 'Big City',
          stateCode: 'NV',
          zipCode: '10101',
          countryName: 'USA',
          internationalPostalCode: '12345',
          extra: 'will not be included',
        }),
      ),
    ).to.deep.equal({
      addressLine1: '123 test',
      addressLine2: 'c/o foo',
      addressLine3: 'suite 99',
      city: 'Big City',
      stateCode: 'NV',
      zipCode5: '10101',
      countryName: 'USA',
      internationalPostalCode: '12345',
    });
  });
});

describe('getPhone', () => {
  it('should return a cleaned up phone object', () => {
    const wrap = obj => ({ veteran: { phone: obj } });
    expect(getPhone()).to.deep.equal({});
    expect(getPhone(wrap({}))).to.deep.equal({});
    expect(getPhone(wrap({ temp: 'test' }))).to.deep.equal({});
    expect(getPhone(wrap({ areaCode: '111' }))).to.deep.equal({
      areaCode: '111',
    });
    expect(
      getPhone(
        wrap({
          countryCode: '1',
          areaCode: '222',
          phoneNumber: '1234567',
          phoneNumberExt: '0000',
          extra: 'will not be included',
        }),
      ),
    ).to.deep.equal({
      countryCode: '1',
      areaCode: '222',
      phoneNumber: '1234567',
      phoneNumberExt: '0000',
    });
  });
});

describe('getRepName', () => {
  const getData = (checked, representativesName) => ({
    'view:hasRep': checked,
    representativesName,
  });
  it('should return rep name', () => {
    expect(getRepName(getData(true, 'Fred'))).to.eq('Fred');
  });
  it('should limit rep name to 120 characters', () => {
    const result = getRepName(getData(true, new Array(130).fill('A').join('')));
    expect(result).to.contain('AAAA');
    expect(result.length).to.eq(120);
  });
  it('should not return rep name', () => {
    expect(getRepName(getData(false, 'Fred'))).to.eq('');
  });
});

describe('getTimeZone', () => {
  it('should return a string', () => {
    // result will be a location string, not stubbing for this test
    expect(getTimeZone().length).to.be.greaterThan(1);
  });
});
