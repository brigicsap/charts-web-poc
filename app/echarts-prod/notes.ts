export const notes = `
## Notes

Same charts, with a more realistic data flow for home usage, import/export and battery history.

- **[fetching]** mocks live behind real endpoints now; the other examples still use static fixtures
- **[cache]** dates, resolution, timezone and scenario all belong in the query key
- **[responses]** TypeScript doesn't check JSON at runtime - validate it before mapping
- **[totals]** use the API summary, not a sum of whatever bars happen to be visible
- **[mapping]** sum matching constituents; missing costs/readings aren't zero
- **[dates]** local energy intervals and UTC battery timestamps aren't interchangeable; DST days aren't always 24 hours
- **[mocks]** the API repeats/shifts the existing day fixtures across dates; not real historical data
- **[debugging]** request/response and mapped values are kept separate; no colours or ECharts options in the API
`;
