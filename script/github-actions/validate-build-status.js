/* eslint-disable no-console */
/* eslint-disable camelcase */
const { Octokit } = require('@octokit/rest');
const { sleep } = require('../../script/utils');

const { GITHUB_TOKEN: auth, GITHUB_REPOSITORY } = process.env;
const args = process.argv.slice(2);
const timeout = 2; // minutes
const commitSHA = args[0];
const [owner, repo] = GITHUB_REPOSITORY.split('/');

const octokit = new Octokit({ auth });

// TODO: Uncomment for GHA as source of truth
/**
 * uses octokit request for github action run_id provided
 * @param {number} run_id
 */
// function getJobsFailed(run_id) {
//   const params = {
//     owner,
//     repo,
//     run_id,
//   };
//   return octokit.rest.actions
//     .listJobsForWorkflowRun(params)
//     .then(response => {
//       if (response.status !== 200) {
//         throw new Error(
//           `Response ${response.status} from ${response.url}. Aborting.`,
//         );
//       }
//       return response.data;
//     })
//     .then(({ jobs }) => {
//       jobs.forEach(({ name, html_url, conclusion }) => {
//         if (conclusion === 'success') return;
//         const isFailure = conclusion === 'failure';
//         const annotationMessage = isFailure
//           ? `::error::Job "${name}" has failed`
//           : `::warning::Job "${name}" has been cancelled`;
//         console.log(
//           `${annotationMessage}. For more details, please see ${html_url}`,
//         );
//       });
//     });
// }

// TODO: Uncomment for GHA as source of truth
/**
 * uses octokit request for github action to get workflow with matching SHA
 * @param {number} page
 */
// function getLatestWorkflow(page) {
//   const params = {
//     owner,
//     repo,
//     workflow_id: 'continuous-integration.yml',
//     branch: 'master',
//     per_page: '50',
//     page,
//   };
//   return octokit.rest.actions
//     .listWorkflowRuns(params)
//     .then(response => {
//       if (response.status !== 200) {
//         throw new Error(
//           `Response ${response.status} from ${response.url}. Aborting.`,
//         );
//       }
//       return response.data;
//     })
//     .then(({ workflow_runs }) => {
//       if (workflow_runs.length === 0) {
//         throw new Error('No workflows found. Aborting.');
//       }

//       const workflow = workflow_runs.find(
//         ({ head_sha }) => head_sha === commitSHA,
//       );
//       if (workflow) return workflow;
//       console.log('Workflow not found in current page. Checking next page.');
//       return getLatestWorkflow(page + 1);
//     });
// }

// TODO: Uncomment for GHA as source of truth
/**
 * Validates the workflow
 * @param {Object} workflow
 * @returns true, false, undefined
 */
// function validateWorkflowSuccess(workflow) {
//   const { status, conclusion, head_commit, html_url } = workflow;
//   console.log(`Validating commit ${head_commit.id}. Workflow: ${html_url}`);

//   if (conclusion === 'failure') return false;

//   const isWorkflowInProgress =
//     status === 'in_progress' || status === null || status === 'queued';

//   if (isWorkflowInProgress) return undefined;

//   if (conclusion === 'success') {
//     console.log('All checks succeeded');
//     return true;
//   }

//   throw new Error(
//     `Unexpected workflow result: ${JSON.stringify({ status, conclusion })}`,
//   );
// }

/**
 * uses octokit request for jenkins to get workflow with matching SHA
 * @returns (success | error | pending)
 */
function getJenkinsLatestWorkflow() {
  const params = {
    owner,
    repo,
    ref: commitSHA,
  };
  return octokit
    .request('GET /repos/{owner}/{repo}/commits/{ref}/status', params)
    .then(response => {
      if (response.status !== 200) {
        throw new Error(
          `Response ${response.status} from ${response.url}. Aborting.`,
        );
      }
      return response.data;
    })
    .then(({ state }) => {
      return state;
    });
}

/**
 * Validates the workflow
 * @param {string} state
 * @returns true, false, undefined
 */
function validateJenkinsWorkflow(state) {
  if (state === 'error') return false;
  console.log(`Validating commit ${commitSHA}`);

  const isWorkflowInProgress = state === 'pending';

  if (isWorkflowInProgress) return undefined;

  if (state === 'success') {
    console.log('Jenkins succeeded');
    return true;
  }

  throw new Error(`Unexpected error validating Jenkins`);
}

/**
 * Checks Github Actions url. Loops recursively until error is thrown.
 */
async function main() {
  try {
    // const page = 1; // TODO: Uncomment for GHA as source of truth
    // const workflow = await getLatestWorkflow(page); // TODO: Uncomment for GHA as source of truth
    // const success = validateWorkflowSuccess(workflow); // TODO: Uncomment for GHA as source of truth

    const state = await getJenkinsLatestWorkflow();
    const success = validateJenkinsWorkflow(state);

    if (success === undefined) {
      console.log(`Check runs still pending. Sleeping for ${timeout} minutes`);
      await sleep(timeout * 60 * 1000);
      await main();
      return;
    }

    if (!success) {
      // await getJobsFailed(workflow.id); // TODO: Uncomment for GHA as source of truth
      console.log(
        'Error has occurred in Jenkins. Please check logs in Jenkins for more details',
      ); // TODO: Remove when GHA as source of truth
      process.exit(1);
    }
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main();
