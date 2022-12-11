'use strict';

chrome.runtime.onInstalled.addListener((_) => {
  // creates an alarm that runs every 2 day
  chrome.alarms.create('updateRatingsAlarm', {
    delayInMinutes: 0.1,
    periodInMinutes: 60 * 24 * 2,
  });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (!(alarm.name === 'updateRatingsAlarm')) {
    console.warn(`Unknown alarm ${alarm.name}`);
    return;
  }

  reloadRatings();
});

function reloadRatings(retries = 0) {
  fetch(
    'https://raw.githubusercontent.com/zerotrac/leetcode_problem_rating/main/data.json'
  )
    .catch((reason) => {
      // retry on failure with exponential back-off
      console.warn(`Failed to fetch ratings: ${reason}`);

      if (retries < 4) {
        console.log(`Retrying in ${10 ** retries} second...`);
        setTimeout(() => reloadRatings(retries + 1), 10 ** retries);
      } else {
        console.log(`Retries exhausted.`);
      }
    })
    .then((response) => response.json())
    .then((data) => saveRatings(data));
}

function saveRatings(ratings) {
  const problemIdToRatingMap = new Map();

  for (const rating of ratings) {
    problemIdToRatingMap.set(rating.TitleSlug, rating);
  }

  chrome.storage.local
    .set({
      problemIdToRating: JSON.stringify(
        Object.fromEntries(problemIdToRatingMap)
      ),
    })
    .then(() => {
      console.log('Ratings saved.');
    });
}
