# Messy field notes: volunteer food pantry routing

The pantry has three volunteer drivers, two pickup sites, and a rush window between 4:30 PM and 6:00 PM. Drivers keep using group chat to decide who should take which route. It works until somebody is late, then everyone loses the latest plan.

The coordinator wants something simple:

- paste the day's donors, dropoff locations, driver availability, and cold-storage limits
- get a route plan with assumptions and risks
- highlight missing information before dispatch
- export a short message that can be sent to drivers

Constraints:

- most volunteers are on older Android phones
- the pantry does not want sensitive family names sent to a hosted AI service
- the plan needs to explain itself because coordinators change shift to shift
- a Raspberry Pi at the pantry office is available

Possible Gemma 4 fit:

- E2B or E4B for low-resource local use
- 31B if the coordinator wants richer tradeoff analysis from longer notes
- structured JSON output would make it easier to turn the response into UI sections
