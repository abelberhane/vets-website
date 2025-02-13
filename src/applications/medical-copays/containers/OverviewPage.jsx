import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { uniqBy } from 'lodash';
import Breadcrumbs from '@department-of-veterans-affairs/component-library/Breadcrumbs';
import scrollToTop from 'platform/utilities/ui/scrollToTop';
import Balances from '../components/Balances';
import BalanceQuestions from '../components/BalanceQuestions';
import { sortStatementsByDate } from '../utils/helpers';

const OverviewPage = () => {
  const statements = useSelector(({ mcp }) => mcp.statements) ?? [];
  const sortedStatements = sortStatementsByDate(statements);
  const statementsByUniqueFacility = uniqBy(sortedStatements, 'pSFacilityNum');
  const title = 'Current copay balances';

  useEffect(() => {
    scrollToTop();
  }, []);

  return (
    <>
      <Breadcrumbs className="vads-u-font-family--sans no-wrap">
        <a href="/">Home</a>
        <a href="/health-care">Health care</a>
        <a href="/health-care/pay-copay-bill">Pay your VA copay bill</a>
        <a href="/health-care/pay-copay-bill/your-current-balances">{title}</a>
      </Breadcrumbs>
      <h1 data-testid="overview-page-title">{title}</h1>
      <p className="vads-u-font-size--lg vads-u-font-family--serif">
        Check the balance of VA health care and prescription charges from each
        of your facilities. Find out how to make payments or request financial
        help.
      </p>
      <Balances statements={statementsByUniqueFacility} />
      <BalanceQuestions />
    </>
  );
};

export default OverviewPage;
