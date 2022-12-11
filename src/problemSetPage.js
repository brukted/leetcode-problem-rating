'use strict';

let ratings = null;

const mutation_observer = new MutationObserver(onMutation);
observe();

function onMutation() {
  if (document.querySelector('[role="rowgroup"]')) {
    mutation_observer.disconnect();
    if (ratings) replaceProblemDifficultiesWithRatings(ratings);
    observe();
  }
}

function observe() {
  mutation_observer.observe(document, {
    subtree: true,
    childList: true,
  });
}

chrome.storage.local.get(['problemIdToRating']).then((data) => {
  console.log('Loading ratings...');

  const obj = JSON.parse(data.problemIdToRating);
  ratings = new Map(Object.entries(obj));

  console.log('Ratings loaded.');

  replaceProblemDifficultiesWithRatings(ratings);
});

function replaceProblemDifficultiesWithRatings(problemIdToRating) {
  console.log('Replacing difficulties with ratings...');

  const problemSetPage = document
    .querySelector('[role="rowgroup"]')
    .querySelectorAll('[role="row"]');

  const problemSetPageArray = Array.from(problemSetPage);

  problemSetPageArray.forEach((problem) => {
    const problemId = problem
      .querySelector('div:nth-child(2)')
      .querySelector('a')
      .href.split('/')[4];

    const problemRating = problemIdToRating.get(problemId);

    if (problemRating) {
      problem
        .querySelector('div:nth-child(5)')
        .querySelector('span').innerText = parseInt(problemRating.Rating);
    }
  });
}
