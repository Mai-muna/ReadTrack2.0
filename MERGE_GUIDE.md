# Merge Conflict Quick Guide

If you see the conflict shown in `backend/controllers/adminController.js` ("Accept current change" vs. "Accept incoming change" from the screenshot):

1. **Keep both sets of changes**. The correct merged version includes the admin moderation helpers (`recalcBookRatings`, ban/unban/remove review) **and** the newer report/validation logic that references the `Report` model.
2. After merging, the top of the file should import `User`, `Review`, and `Report`, define `recalcBookRatings`, and then export the `banUser`, `unbanUser`, `removeReview`, `reportReview`, `resolveReport`, and `listReports` handlers.
3. Make sure no conflict markers remain (search for `<<<<<<`, `======`, `>>>>>>`).
4. Run `npm test -- --runTestsByPath tests/api.test.js` from the `backend` directory to confirm the API suite still passes after resolving conflicts.

This keeps moderation, rating recalculation, and report handling working together.
