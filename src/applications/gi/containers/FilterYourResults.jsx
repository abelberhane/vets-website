import React from 'react';
import { useHistory } from 'react-router-dom';
import { connect } from 'react-redux';
import _ from 'lodash';
import recordEvent from 'platform/monitoring/record-event';
import ExpandingGroup from '@department-of-veterans-affairs/component-library/ExpandingGroup';
import LoadingIndicator from '@department-of-veterans-affairs/component-library/LoadingIndicator';
import SearchAccordion from '../components/SearchAccordion';
import Checkbox from '../components/Checkbox';
import Dropdown from '../components/Dropdown';
import LearnMoreLabel from '../components/LearnMoreLabel';
import {
  getStateNameForCode,
  sortOptionsByStateName,
  addAllOption,
  createId,
} from '../utils/helpers';
import { showModal, filterChange } from '../actions';
import { TABS, INSTITUTION_TYPES } from '../constants';
import CheckboxGroup from '../components/CheckboxGroup';
import { updateUrlParams } from '../selectors/search';

export function FilterYourResults({
  dispatchShowModal,
  dispatchFilterChange,
  filters,
  modalClose,
  preview,
  search,
  smallScreen,
}) {
  const history = useHistory();
  const { version } = preview;
  const {
    expanded,
    schools,
    excludedSchoolTypes,
    excludeCautionFlags,
    accredited,
    studentVeteran,
    yellowRibbonScholarship,
    specialMission,
    employers,
    vettec,
    preferredProvider,
    country,
    state,
  } = filters;

  const facets =
    search.tab === TABS.name ? search.name.facets : search.location.facets;

  const recordCheckboxEvent = e => {
    recordEvent({
      event: 'gibct-form-change',
      'gibct-form-field': e.target.name,
      'gibct-form-value': e.target.checked,
    });
  };

  const updateInstitutionFilters = (name, value) => {
    dispatchFilterChange({ ...filters, [name]: value });
  };
  const onChangeCheckbox = e => {
    recordCheckboxEvent(e);
    updateInstitutionFilters(e.target.name, e.target.checked);
  };

  const onChange = e => {
    recordEvent({
      event: 'gibct-form-change',
      'gibct-form-field': e.target.name,
      'gibct-form-value': e.target.value,
    });
    updateInstitutionFilters(e.target.name, e.target.value);
  };

  const onAccordionChange = value => {
    recordEvent({
      event: value ? 'int-accordion-expand' : 'int-accordion-collapse',
    });
    updateInstitutionFilters('expanded', value);
  };

  const handleSchoolChange = e => {
    const { checked } = e.target;

    if (!checked) {
      dispatchFilterChange({
        ...filters,
        schools: false,
        excludedSchoolTypes: [
          'PUBLIC',
          'FOR PROFIT',
          'PRIVATE',
          'FOREIGN',
          'FLIGHT',
          'CORRESPONDENCE',
        ],
        excludeCautionFlags: false,
        accredited: false,
        studentVeteran: false,
        yellowRibbonScholarship: false,
        specialMission: 'ALL',
      });
      recordCheckboxEvent(e);
    } else {
      onChangeCheckbox(e);
    }
  };

  const handleIncludedSchoolTypesChange = e => {
    // The filter consumes these as exclusions
    const { name } = e.target;
    const { checked } = e.target;
    const newExcluded = _.cloneDeep(excludedSchoolTypes);
    recordCheckboxEvent(e);
    updateInstitutionFilters(
      'excludedSchoolTypes',
      checked
        ? newExcluded.concat(name)
        : newExcluded.filter(type => type !== name),
    );
  };

  const handleVetTecChange = e => {
    const { checked } = e.target;
    if (!checked) {
      dispatchFilterChange({
        ...filters,
        vettec: false,
        preferredProvider: false,
      });
      recordCheckboxEvent(e);
    } else {
      dispatchFilterChange({
        ...filters,
        vettec: true,
        preferredProvider: false,
      });
      recordCheckboxEvent(e);
    }
  };

  const handlePreferredProviderChange = e => {
    const { checked } = e.target;
    if (checked) {
      dispatchFilterChange({
        ...filters,
        vettec: true,
        preferredProvider: true,
      });
      recordCheckboxEvent(e);
    } else {
      dispatchFilterChange({
        ...filters,
        vettec: true,
        preferredProvider: false,
      });
      recordCheckboxEvent(e);
    }
  };

  const updateResults = () => {
    updateInstitutionFilters('search', true);

    updateUrlParams(history, search.tab, search.query, filters, version);
  };

  const closeAndUpdate = () => {
    updateResults();
    modalClose();
  };

  const excludedSchoolTypesGroup = () => {
    const options = INSTITUTION_TYPES.map(type => {
      return {
        name: type.toUpperCase(),
        checked: excludedSchoolTypes.includes(type.toUpperCase()),
        optionLabel: type,
      };
    });

    return (
      <div className="vads-u-margin-bottom--5">
        <CheckboxGroup
          label={
            <div className="vads-u-margin-left--neg0p25">
              Include these school types:
            </div>
          }
          onChange={handleIncludedSchoolTypesChange}
          options={options}
        />
      </div>
    );
  };

  const schoolAttributes = () => {
    const options = [
      {
        name: 'excludeCautionFlags',
        checked: excludeCautionFlags,
        optionLabel: (
          <LearnMoreLabel
            text="Has no cautionary warnings"
            onClick={() => {
              dispatchShowModal('cautionaryWarnings');
            }}
            ariaLabel="Learn more about VA education and training programs"
          />
        ),
      },
      {
        name: 'accredited',
        checked: accredited,
        optionLabel: (
          <LearnMoreLabel
            text="Is accredited"
            onClick={() => {
              dispatchShowModal('accredited');
            }}
            buttonId="accredited-button"
            ariaLabel="Learn more about VA education and training programs"
          />
        ),
      },
      {
        name: 'studentVeteran',
        checked: studentVeteran,
        optionLabel: 'Has a Student Veteran Group',
      },
      {
        name: 'yellowRibbonScholarship',
        checked: yellowRibbonScholarship,
        optionLabel: 'Offers Yellow Ribbon Program',
      },
    ];

    return (
      <CheckboxGroup
        label={
          <div className="vads-u-margin-left--neg0p25">About the school:</div>
        }
        onChange={onChangeCheckbox}
        options={options}
      />
    );
  };

  const specialMissions = () => {
    const options = [
      {
        optionValue: 'hbcu',
        optionLabel: 'Historically Black College or University',
      },
      {
        optionValue: 'menonly',
        optionLabel: 'Men-only',
      },
      {
        optionValue: 'womenonly',
        optionLabel: 'Women-only',
      },
      {
        optionValue: 'relaffil',
        optionLabel: 'Religious Affiliation',
      },
    ];
    return (
      <Dropdown
        onChange={onChange}
        value={specialMission}
        name="specialMission"
        options={addAllOption(options)}
        alt="Specialized mission (i.e., Single-gender, Religious affiliation, HBCU)"
        label="Specialized mission (i.e., Single-gender, Religious affiliation, HBCU)"
        visible
      />
    );
  };

  const typeOfInstitution = () => {
    const name = 'Type of institution';
    const legendId = `${createId(name)}-legend`;
    return (
      <>
        <div className="vads-u-margin-bottom--4">
          <h3
            className="vads-u-margin-bottom--3"
            aria-label={`${name}:`}
            id={legendId}
          >
            {name}
          </h3>
          <ExpandingGroup open={schools}>
            <Checkbox
              checked={schools}
              name="schools"
              label="Schools"
              onChange={handleSchoolChange}
              className="expanding-header-checkbox"
              inputAriaLabelledBy={legendId}
            />
            <div className="school-types expanding-group-children">
              {excludedSchoolTypesGroup()}
              {schoolAttributes()}
              {specialMissions()}
            </div>
          </ExpandingGroup>
        </div>
        <Checkbox
          checked={employers}
          name="employers"
          label="On-the-job training and apprenticeships"
          onChange={onChangeCheckbox}
          className="vads-u-margin-bottom--4"
          inputAriaLabelledBy={legendId}
        />
        <ExpandingGroup open={vettec}>
          <Checkbox
            checked={vettec}
            name="vettec"
            label="VET TEC providers"
            onChange={handleVetTecChange}
            className="expanding-header-checkbox"
            inputAriaLabelledBy={legendId}
          />
          <div className="expanding-group-children">
            <Checkbox
              checked={preferredProvider}
              name="preferredProvider"
              label="Preferred providers only"
              onChange={handlePreferredProviderChange}
              labelAriaLabel="VET TEC Preferred providers"
              inputAriaLabelledBy={legendId}
            />
          </div>
        </ExpandingGroup>
      </>
    );
  };

  const renderCountryFilter = () => {
    const options = facets.country.map(facetCountry => ({
      optionValue: facetCountry.name,
      optionLabel: facetCountry.name,
    }));

    return (
      <Dropdown
        label="Country"
        name="country"
        alt="Filter results by country"
        options={addAllOption(options)}
        value={country}
        onChange={onChange}
        visible
      />
    );
  };

  const renderStateFilter = () => {
    const options = Object.keys(facets.state)
      .map(facetState => ({
        optionValue: facetState,
        optionLabel: getStateNameForCode(facetState),
      }))
      .sort(sortOptionsByStateName);
    return (
      <Dropdown
        label="State"
        name="state"
        alt="Filter results by state"
        options={addAllOption(options)}
        value={state}
        onChange={onChange}
        visible
      />
    );
  };

  const renderLocation = () => {
    return (
      <>
        <h3>Location</h3>
        {renderCountryFilter()}
        {renderStateFilter()}
      </>
    );
  };

  const controls = (
    <div>
      {typeOfInstitution()}
      {renderLocation()}
    </div>
  );

  const title = 'Filter your results';

  return (
    <div className="filter-your-results vads-u-margin-bottom--2">
      {!smallScreen && (
        <SearchAccordion
          button={title}
          buttonLabel="Update results"
          buttonOnClick={() => updateResults()}
          expanded={expanded}
          onClick={onAccordionChange}
        >
          {search.inProgress && <LoadingIndicator />}
          {!search.inProgress && controls}
        </SearchAccordion>
      )}
      {smallScreen && (
        <div className="modal-wrapper">
          <div>
            <h1>Filter your results</h1>
            {search.inProgress && <LoadingIndicator />}
            {!search.inProgress && controls}
          </div>
          <div className="modal-button-wrapper">
            <button
              type="button"
              id={`update-${createId(title)}-button`}
              className="update-results-button"
              onClick={closeAndUpdate}
            >
              Update results
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const mapStateToProps = state => ({
  filters: state.filters,
  search: state.search,
  preview: state.preview,
});

const mapDispatchToProps = {
  dispatchShowModal: showModal,
  dispatchFilterChange: filterChange,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(FilterYourResults);
