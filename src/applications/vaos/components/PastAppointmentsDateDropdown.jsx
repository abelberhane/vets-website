import React from 'react';
import PropTypes from 'prop-types';

export default function PastAppointmentsDateDropdown({
  value,
  onChange,
  options,
}) {
  return (
    <div className="vads-u-margin-bottom--3">
      <label
        className="vads-u-display--inline-block vads-u-font-weight--bold vads-u-margin-top--0 vads-u-margin-right--2"
        htmlFor="options"
      >
        Go to:
      </label>
      <select
        className="usa-select usa-select vads-u-display--inline-block vads-u-width--auto"
        name="options"
        id="options"
        value={value}
        onChange={onChange}
      >
        {options.map((o, index) => (
          <option key={`date-range-${index}`} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

PastAppointmentsDateDropdown.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.array.isRequired,
};
